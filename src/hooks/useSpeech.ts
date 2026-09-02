import { useCallback, useEffect, useRef, useState } from 'react';
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
  type LevelMeter,
  type Recording,
  type RecorderHandle,
} from '@/lib/audio';

/** Đọc câu tiếng Anh bằng giọng & tốc độ người dùng đã chọn trong Cài đặt */
export function useSpeaker() {
  const { voiceURI, rate } = useStore((s) => s.settings);
  const [speaking, setSpeaking] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelSpeech();
    };
  }, []);

  const say = useCallback(
    (text: string, opts?: { rate?: number; onEnd?: () => void }) => {
      setSpeaking(true);
      rawSpeak(text, {
        voiceURI,
        rate: opts?.rate ?? rate,
        onEnd: () => {
          if (mounted.current) setSpeaking(false);
          opts?.onEnd?.();
        },
      });
    },
    [voiceURI, rate],
  );

  const stop = useCallback(() => {
    cancelSpeech();
    setSpeaking(false);
  }, []);

  return { say, stop, speaking, supported: isTtsSupported() };
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

  const ctrl = useRef<ListenController | null>(null);
  const recorder = useRef<RecorderHandle | null>(null);
  const meter = useRef<LevelMeter | null>(null);
  const raf = useRef(0);
  const alive = useRef(true);

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
    setState('starting');

    /* 1. Mở micro trước để xin quyền một cách tường minh và để đo được mức âm */
    let stream: MediaStream | null = null;
    if (isMicApiSupported()) {
      try {
        stream = await openMic();
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
        onResume: () => setResumed(true),
        onError: (code) => {
          if (code === 'not-allowed' || code === 'service-not-allowed') setState('denied');
          else if (code === 'audio-capture') setState('nomic');
        },
      });
    }

    setState('listening');
  }, [state]);

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
