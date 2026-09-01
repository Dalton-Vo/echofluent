/* ============================================================================
 *  Bọc Web Speech API — chạy hoàn toàn trong trình duyệt, không cần server.
 *
 *  - speechSynthesis  : đọc câu tiếng Anh bằng giọng có sẵn của hệ điều hành.
 *                       macOS có sẵn giọng rất tốt (Samantha, Daniel, Karen…).
 *  - SpeechRecognition: nhận diện lời bạn nói. Chỉ Chrome/Edge/Safari hỗ trợ.
 *                       Nếu trình duyệt không có, app tự chuyển sang chế độ tự chấm.
 * ========================================================================== */

/* -------------------- khai báo kiểu cho SpeechRecognition -------------------- */

interface SRAlternative {
  transcript: string;
  confidence: number;
}
interface SRResult {
  isFinal: boolean;
  length: number;
  [index: number]: SRAlternative;
}
interface SRResultList {
  length: number;
  [index: number]: SRResult;
}
interface SREvent extends Event {
  resultIndex: number;
  results: SRResultList;
}
interface SRErrorEvent extends Event {
  error: string;
  message?: string;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SRConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  }
}

/* ------------------------------ TEXT → SPEECH ------------------------------ */

let voicesCache: SpeechSynthesisVoice[] = [];

export function isTtsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Danh sách giọng tiếng Anh. Trả về mảng rỗng nếu hệ điều hành chưa nạp xong. */
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (!isTtsSupported()) return [];
  const all = window.speechSynthesis.getVoices();
  if (all.length) voicesCache = all;
  return voicesCache.filter((v) => v.lang.toLowerCase().startsWith('en'));
}

/** Chờ hệ điều hành nạp danh sách giọng (Chrome nạp bất đồng bộ) */
export function onVoicesReady(cb: () => void): () => void {
  if (!isTtsSupported()) return () => {};
  const handler = () => cb();
  window.speechSynthesis.addEventListener('voiceschanged', handler);
  // gọi ngay một lần phòng khi đã sẵn sàng
  if (window.speechSynthesis.getVoices().length) cb();
  return () => window.speechSynthesis.removeEventListener('voiceschanged', handler);
}

/** Chọn giọng mặc định tốt nhất có sẵn trên máy */
export function pickDefaultVoice(): SpeechSynthesisVoice | null {
  const voices = getEnglishVoices();
  if (!voices.length) return null;
  const preferred = [
    'Samantha',
    'Karen',
    'Daniel',
    'Google US English',
    'Google UK English Female',
    'Microsoft Aria',
    'Alex',
  ];
  for (const name of preferred) {
    const hit = voices.find((v) => v.name.includes(name));
    if (hit) return hit;
  }
  return voices.find((v) => v.lang === 'en-US') ?? voices[0];
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

/** Đọc một câu. Tự huỷ câu đang đọc dở. */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!isTtsSupported() || !text.trim()) {
    opts.onEnd?.();
    return;
  }
  cancelSpeech();

  const u = new SpeechSynthesisUtterance(text);
  const voices = getEnglishVoices();
  const chosen =
    (opts.voiceURI && voices.find((v) => v.voiceURI === opts.voiceURI)) || pickDefaultVoice();
  if (chosen) {
    u.voice = chosen;
    u.lang = chosen.lang;
  } else {
    u.lang = 'en-US';
  }
  u.rate = clamp(opts.rate ?? 1, 0.5, 2);
  u.pitch = opts.pitch ?? 1;

  u.onstart = () => opts.onStart?.();
  u.onend = () => {
    currentUtterance = null;
    opts.onEnd?.();
  };
  u.onerror = () => {
    currentUtterance = null;
    opts.onError?.();
    opts.onEnd?.();
  };

  currentUtterance = u;
  // Chrome đôi khi "kẹt" nếu vừa cancel xong đã speak — đẩy sang tick sau.
  window.setTimeout(() => window.speechSynthesis.speak(u), 30);
}

export function cancelSpeech(): void {
  if (!isTtsSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return isTtsSupported() && window.speechSynthesis.speaking;
}

/* ------------------------------ SPEECH → TEXT ------------------------------ */

export function isSttSupported(): boolean {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export interface ListenHandlers {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (code: string) => void;
  onEnd?: () => void;
}

export interface ListenController {
  stop: () => void;
  abort: () => void;
}

/**
 * Bắt đầu nghe. Trả về controller để dừng.
 * Gộp mọi mảnh kết quả lại để câu dài không bị mất đoạn đầu.
 */
export function startListening(handlers: ListenHandlers = {}): ListenController | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) {
    handlers.onError?.('unsupported');
    return null;
  }

  const rec = new Ctor();
  rec.lang = 'en-US';
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  let finalText = '';
  let stopped = false;

  rec.onresult = (e: SREvent) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i += 1) {
      const res = e.results[i];
      const txt = res[0]?.transcript ?? '';
      if (res.isFinal) finalText += ` ${txt}`;
      else interim += txt;
    }
    if (interim) handlers.onInterim?.(`${finalText} ${interim}`.trim());
    else if (finalText) handlers.onInterim?.(finalText.trim());
  };

  rec.onerror = (e: SRErrorEvent) => {
    handlers.onError?.(e.error || 'unknown');
  };

  rec.onend = () => {
    if (!stopped) {
      stopped = true;
      handlers.onFinal?.(finalText.trim());
      handlers.onEnd?.();
    }
  };

  try {
    rec.start();
  } catch {
    handlers.onError?.('start-failed');
    return null;
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* đã dừng rồi */
      }
    },
    abort: () => {
      stopped = true;
      try {
        rec.abort();
      } catch {
        /* bỏ qua */
      }
      handlers.onEnd?.();
    },
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
