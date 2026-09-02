import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  cancelSpeech,
  isSttSupported,
  isTtsSupported,
  speak as rawSpeak,
  startListening,
  type ListenController,
} from '@/lib/speech';
import {
  createLevelMeter,
  isMicApiSupported,
  openMic,
  queryMicPermission,
  readMicError,
  startRecording,
  detectQuirks,
  type LevelMeter,
  type Recording,
  type RecorderHandle,
} from '@/lib/audio';
import { DEFAULT_AI_VOICE, playClip, stopAiVoice, synthesize } from '@/lib/tts';

/**
 * Đọc câu tiếng Anh.
 *
 * Có hai nguồn giọng, và thứ tự ưu tiên quan trọng:
 *
 *   1. Giọng Gemini — tự nhiên, có nhấn nhá thật. Nhại theo giọng này mới rèn
 *      được nhịp câu.
 *   2. Giọng của hệ điều hành — khô nhưng luôn có, không tốn hạn mức.
 *
 * Giọng AI được thử trước, và HỎNG THẾ NÀO CŨNG LÙI VỀ giọng máy: hết hạn mức,
 * mất mạng, hay khoá sai đều không được phép làm app câm. Với một app luyện
 * nói thì im lặng là hỏng hoàn toàn, còn giọng khô chỉ là kém hay hơn một chút.
 */
export function useSpeaker() {
  const { voiceURI, rate } = useStore((s) => s.settings);
  const ai = useStore((s) => s.ai);
  const [speaking, setSpeaking] = useState(false);
  const [usingAi, setUsingAi] = useState(false);
  const mounted = useRef(true);
  /** Tăng mỗi lần đọc — đoạn tiếng về muộn của lần cũ sẽ bị bỏ */
  const runId = useRef(0);

  const aiVoiceOn = ai.enabled && ai.voice && Boolean(ai.key.trim() || ai.proxyUrl.trim());

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelSpeech();
      stopAiVoice();
    };
  }, []);

  const say = useCallback(
    (text: string, opts?: { rate?: number; onEnd?: () => void; style?: string }) => {
      const id = ++runId.current;
      const speed = opts?.rate ?? rate;
      setSpeaking(true);

      const finish = () => {
        if (id !== runId.current) return;
        if (mounted.current) {
          setSpeaking(false);
          setUsingAi(false);
        }
        opts?.onEnd?.();
      };

      const osVoice = () => {
        if (id !== runId.current) return;
        cancelSpeech();
        rawSpeak(text, { voiceURI, rate: speed, onEnd: finish });
      };

      if (!aiVoiceOn) {
        osVoice();
        return;
      }

      cancelSpeech();
      stopAiVoice();
      setUsingAi(true);

      void synthesize(ai, text, ai.voiceName || DEFAULT_AI_VOICE, opts?.style)
        .then((clip) => {
          if (id !== runId.current) return;
          return playClip(clip, speed).then(finish);
        })
        .catch(() => {
          // Hết hạn mức hoặc mất mạng → giọng máy đọc nốt, người học không
          // phải chờ và cũng không cần biết vừa có chuyện gì.
          if (mounted.current) setUsingAi(false);
          osVoice();
        });
    },
    [voiceURI, rate, ai, aiVoiceOn],
  );

  const stop = useCallback(() => {
    runId.current += 1;
    cancelSpeech();
    stopAiVoice();
    setSpeaking(false);
    setUsingAi(false);
  }, []);

  return {
    say,
    stop,
    speaking,
    /** Câu đang đọc dùng giọng AI — để giao diện gắn nhãn cho biết */
    usingAi,
    aiVoiceOn,
    supported: isTtsSupported(),
  };
}

export type MicState =
  | 'idle'
  | 'starting'   // đang xin quyền / mở micro
  | 'listening'
  | 'denied'     // người dùng hoặc hệ điều hành chặn
  | 'nomic'      // máy không có thiết bị thu
  | 'unsupported';

export interface MicFinish {
  text: string;
  recording: Recording | null;
}

/**
 * Nghe bạn nói.
 *
 * Hook này luôn cố làm HAI việc cùng lúc và độc lập nhau:
 *
 *   • nhận diện chữ  (Web Speech API — chỉ Chrome/Edge/Safari có)
 *   • ghi lại audio  (MediaRecorder — gần như trình duyệt nào cũng có)
 *
 * Tách đôi như vậy nên Firefox tuy không có nhận diện chữ vẫn ghi âm được, và
 * phần chấm phát âm bằng AI vẫn chạy bình thường. Ngược lại, khi mạng chập
 * chờn làm nhận diện chữ hỏng thì bản ghi âm vẫn còn nguyên để cứu.
 */
export function useMic() {
  const [state, setState] = useState<MicState>(() =>
    isSttSupported() || isMicApiSupported() ? 'idle' : 'unsupported',
  );
  const [transcript, setTranscript] = useState('');
  const [level, setLevel] = useState(0);
  const [resumed, setResumed] = useState(false);
  /** Quyền đã cấp sẵn từ lần trước → được phép tự bật micro, khỏi cần bấm */
  const [preAuthorized, setPreAuthorized] = useState(false);
  /**
   * Nhận diện giọng nói có chạy nhưng chưa bao giờ ra chữ.
   * Dấu hiệu của Brave: API vẫn có, `start()` vẫn chạy, không lỗi — chỉ là
   * không bao giờ trả kết quả. Bật cờ này lên để giao diện nói thẳng chuyện
   * gì đang xảy ra thay vì để người dùng ngồi đoán.
   */
  const [sttSilent, setSttSilent] = useState(false);
  const quirks = useMemo(() => detectQuirks(), []);
  const deviceId = useStore((s) => s.settings.micDeviceId);

  const ctrl = useRef<ListenController | null>(null);
  const recorder = useRef<RecorderHandle | null>(null);
  const meter = useRef<LevelMeter | null>(null);
  const raf = useRef(0);
  const alive = useRef(true);
  const resumeCount = useRef(0);

  /* Trạng thái quyền quyết định có được tự bật micro hay không. Trình duyệt chỉ
   * cho mở micro không cần cử chỉ khi quyền đã được cấp từ trước. */
  useEffect(() => {
    alive.current = true;
    void queryMicPermission().then((p) => {
      if (!alive.current) return;
      setPreAuthorized(p === 'granted');
      if (p === 'unavailable' && !isSttSupported()) setState('unsupported');
    });
    return () => {
      alive.current = false;
    };
  }, []);

  const teardown = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    meter.current?.stop();
    meter.current = null;
    setLevel(0);
  }, []);

  useEffect(
    () => () => {
      ctrl.current?.abort();
      ctrl.current = null;
      recorder.current?.cancel();
      recorder.current = null;
      teardown();
    },
    [teardown],
  );

  /**
   * Bật micro. PHẢI gọi từ một cú bấm thật của người dùng, trừ khi
   * `preAuthorized` đang bật — đây chính là chỗ bản cũ sai: nó tự gọi từ trong
   * `setTimeout` sau khi đọc xong câu hỏi, mà trình duyệt coi đó không phải cử
   * chỉ người dùng nên chặn thẳng, không báo gì.
   */
  const start = useCallback(async () => {
    if (state === 'starting' || state === 'listening') return;
    setTranscript('');
    setResumed(false);
    resumeCount.current = 0;
    setState('starting');

    /* 1. Mở micro trước để xin quyền một cách tường minh và để đo được mức âm */
    let stream: MediaStream | null = null;
    if (isMicApiSupported()) {
      try {
        stream = await openMic(deviceId || undefined);
      } catch (err) {
        setState(readMicError(err) === 'unavailable' ? 'nomic' : 'denied');
        return;
      }
    }
    if (!alive.current) return;
    setPreAuthorized(true);

    /* 2. Vòng sáng theo giọng nói — bằng chứng nhìn thấy được là micro đang ăn tiếng */
    if (stream) {
      try {
        meter.current = createLevelMeter(stream);
        const tick = () => {
          if (!meter.current) return;
          setLevel(meter.current.level());
          raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
      } catch {
        /* không đo được mức âm cũng không sao, chỉ mất phần hiển thị */
      }

      /* 3. Ghi âm để dành cho AI chấm phát âm */
      recorder.current = startRecording(stream);
    }

    /* 4. Nhận diện chữ — có thì tốt, không có vẫn còn bản ghi âm */
    if (isSttSupported()) {
      ctrl.current = startListening({
        onInterim: (t) => setTranscript(t),
        onResume: () => {
          setResumed(true);
          // Nối lại hai lần liên tiếp mà vẫn chưa nghe ra chữ nào → coi như
          // phần nhận diện của trình duyệt này hỏng, chuyển hướng sang AI.
          resumeCount.current += 1;
          if (resumeCount.current >= 2 && !ctrl.current?.text()) setSttSilent(true);
        },
        onError: (code) => {
          if (code === 'not-allowed' || code === 'service-not-allowed') setState('denied');
          else if (code === 'audio-capture') setState('nomic');
        },
      });
    }

    setState('listening');
  }, [state, deviceId]);

  /**
   * Dừng nghe và trả về kết quả ĐẦY ĐỦ.
   *
   * Trả Promise chứ không phải đọc state, vì mảnh chữ cuối cùng và tệp ghi âm
   * đều chỉ tới sau khi đã bảo dừng. Đọc state ngay lúc bấm nút — như bản cũ —
   * là cách chắc chắn nhất để mất vế cuối của câu.
   */
  const finish = useCallback(async (): Promise<MicFinish> => {
    const [text, recording] = await Promise.all([
      ctrl.current ? ctrl.current.stop() : Promise.resolve(''),
      recorder.current ? recorder.current.stop() : Promise.resolve(null),
    ]);
    ctrl.current = null;
    recorder.current = null;
    teardown();
    if (alive.current) {
      setState('idle');
      if (text) setTranscript(text);
    }
    return { text, recording };
  }, [teardown]);

  const reset = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
    recorder.current?.cancel();
    recorder.current = null;
    teardown();
    setTranscript('');
    setResumed(false);
    setState((s) => (s === 'unsupported' ? s : 'idle'));
  }, [teardown]);

  return {
    state,
    transcript,
    setTranscript,
    level,
    /** Trình duyệt vừa tự ngắt vì im lặng và ta đã nối lại */
    resumed,
    start,
    finish,
    reset,
    /** Có thể nghe được chữ hoặc chí ít là ghi được âm */
    supported: isSttSupported() || isMicApiSupported(),
    /** Riêng phần nhận diện chữ trong trình duyệt */
    sttSupported: isSttSupported(),
    /** Quyền đã cấp sẵn → được phép tự bật micro mà không cần người dùng bấm */
    preAuthorized,
    /** Nhận diện chạy nhưng câm — Brave hay bị */
    sttSilent,
    /** Thông tin trình duyệt, để hiện đúng lời khuyên */
    quirks,
  };
}

/** Đồng hồ đếm ngược để ép phản xạ. Trả về số mili-giây còn lại. */
export function useCountdown(seconds: number, running: boolean, onExpire?: () => void) {
  const [left, setLeft] = useState(seconds * 1000);
  const startedAt = useRef(0);
  const fired = useRef(false);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    setLeft(seconds * 1000);
    fired.current = false;
    if (!running) return;
    startedAt.current = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const remain = Math.max(0, seconds * 1000 - elapsed);
      setLeft(remain);
      if (remain <= 0) {
        if (!fired.current) {
          fired.current = true;
          expireRef.current?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seconds, running]);

  const elapsedMs = seconds * 1000 - left;
  return { left, elapsedMs, ratio: left / (seconds * 1000) };
}


/* ============================================================================
 *  Tự dừng khi người học đã nói xong
 * ========================================================================== */

/**
 * Theo dõi âm lượng để biết lúc nào người học nói xong, rồi tự chốt câu.
 *
 * Trước đây nói xong phải rướn tay bấm nút dừng. Nghe thì nhỏ, nhưng nó phá
 * đúng thứ bài này rèn: vừa dứt câu đã phải nghĩ tới cái nút, thay vì để câu
 * chảy ra tự nhiên rồi nghe máy chấm. Nói xong là xong.
 *
 * Chỉ tính im lặng SAU KHI đã nghe thấy tiếng. Nếu không thì mấy giây đầu —
 * lúc người học còn đang nghĩ, vốn là chuyện bình thường của bài phản xạ — sẽ
 * bị coi là "nói xong rồi" và câu bị chốt trước cả khi họ mở miệng.
 */
export function useAutoStop(
  level: number,
  active: boolean,
  onDone: () => void,
  opts: { threshold?: number; silenceMs?: number; maxMs?: number } = {},
) {
  const { threshold = 0.07, silenceMs = 1600, maxMs = 25_000 } = opts;

  const spoke = useRef(false);
  const quietSince = useRef(0);
  const startedAt = useRef(0);
  const fired = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!active) {
      spoke.current = false;
      fired.current = false;
      quietSince.current = 0;
      startedAt.current = performance.now();
      return;
    }
    if (!startedAt.current) startedAt.current = performance.now();
  }, [active]);

  useEffect(() => {
    if (!active || fired.current) return;
    const now = performance.now();

    // Lưới an toàn: micro kẹt mở thì cũng phải chốt, đừng thu vô tận.
    if (startedAt.current && now - startedAt.current > maxMs) {
      fired.current = true;
      doneRef.current();
      return;
    }

    if (level > threshold) {
      spoke.current = true;
      quietSince.current = 0;
      return;
    }
    if (!spoke.current) return;

    if (!quietSince.current) quietSince.current = now;
    else if (now - quietSince.current >= silenceMs) {
      fired.current = true;
      doneRef.current();
    }
  }, [level, active, threshold, silenceMs, maxMs]);

  return { spoke: spoke.current };
}
