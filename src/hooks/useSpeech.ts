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

export type MicState = 'idle' | 'listening' | 'denied' | 'unsupported';

/** Nghe bạn nói và trả về những gì nhận diện được */
export function useMic() {
  const [state, setState] = useState<MicState>(isSttSupported() ? 'idle' : 'unsupported');
  const [transcript, setTranscript] = useState('');
  const ctrl = useRef<ListenController | null>(null);
  const onDone = useRef<((text: string) => void) | null>(null);

  useEffect(
    () => () => {
      ctrl.current?.abort();
    },
    [],
  );

  const start = useCallback((cb?: (text: string) => void) => {
    if (!isSttSupported()) {
      setState('unsupported');
      return;
    }
    setTranscript('');
    onDone.current = cb ?? null;
    ctrl.current = startListening({
      onInterim: (t) => setTranscript(t),
      onFinal: (t) => {
        setTranscript((prev) => t || prev);
      },
      onError: (code) => {
        if (code === 'not-allowed' || code === 'service-not-allowed') setState('denied');
        else if (code === 'unsupported') setState('unsupported');
      },
      onEnd: () => {
        setState((s) => (s === 'listening' ? 'idle' : s));
        setTranscript((t) => {
          onDone.current?.(t);
          onDone.current = null;
          return t;
        });
      },
    });
    if (ctrl.current) setState('listening');
  }, []);

  const stop = useCallback(() => {
    ctrl.current?.stop();
    ctrl.current = null;
  }, []);

  const reset = useCallback(() => {
    ctrl.current?.abort();
    ctrl.current = null;
    setTranscript('');
    setState(isSttSupported() ? 'idle' : 'unsupported');
  }, []);

  return { state, transcript, setTranscript, start, stop, reset, supported: isSttSupported() };
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
