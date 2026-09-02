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
  /** Gọi đúng MỘT lần, khi phiên nghe thật sự khép lại */
  onFinal?: (text: string) => void;
  onError?: (code: string) => void;
  onEnd?: () => void;
  /** Trình duyệt tự ngắt vì im lặng và ta đã nối lại — dùng để báo cho người dùng */
  onResume?: () => void;
}

export interface ListenController {
  /** Dừng và CHỜ mảnh kết quả cuối cùng rồi mới trả về câu đầy đủ */
  stop: () => Promise<string>;
  abort: () => void;
  /** Đọc câu đang có ngay lập tức, không chờ */
  text: () => string;
}

/** Lỗi không thể chữa — nối lại cũng vô ích */
const FATAL = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported']);

/** Chặn trên số lần tự nối lại, phòng khi trình duyệt ngắt liên tục thành vòng lặp */
const MAX_RESUMES = 20;

/**
 * Bắt đầu nghe.
 *
 * Hai thứ ở đây quan trọng hơn hết, và cũng chính là hai chỗ bản cũ làm sai:
 *
 *  1. TỰ NỐI LẠI. Chrome tự tắt nhận diện sau khoảng 5–8 giây im lặng, kể cả
 *     khi đã đặt `continuous = true`. Với bài luyện phản xạ thì người học im
 *     vài giây đầu để nghĩ là chuyện bình thường — thế là micro tắt ngóm ngay
 *     trước lúc họ mở miệng, và nhìn từ ngoài đúng y như "app không thu âm".
 *     Nên khi bị ngắt mà ta chưa hề bảo dừng, ta bật lại ngay.
 *
 *  2. DỪNG CÓ CHỜ. `stop()` trả về Promise. Mảnh kết quả cuối cùng của trình
 *     duyệt chỉ tới SAU khi gọi `stop()`; bản cũ đọc câu nói từ state React
 *     ngay lúc bấm nút nên luôn thiếu vế cuối, thậm chí rỗng nếu người dùng
 *     nói gọn — và app báo "chưa nói được" dù người ta vừa nói xong.
 */
export function startListening(handlers: ListenHandlers = {}): ListenController | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) {
    handlers.onError?.('unsupported');
    return null;
  }

  let rec: SpeechRecognitionLike | null = null;
  let finalText = '';
  let interimText = '';
  let wantStop = false;
  let finished = false;
  let resumes = 0;
  let fatal = '';
  let resolveStop: ((t: string) => void) | null = null;
  let stopTimer = 0;

  /* Trình duyệt hay trả mảnh chữ kèm sẵn khoảng trắng đầu ("  about three days"),
   * nên phải bóp lại. Khoảng trắng đôi lọt xuống dưới sẽ làm lệch bước tách từ
   * lúc chấm điểm, và nhìn cũng lôi thôi khi hiện câu nói lên màn hình. */
  const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();

  const full = () => tidy(`${finalText} ${interimText}`);

  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(stopTimer);
    const text = full();
    handlers.onFinal?.(text);
    handlers.onEnd?.();
    resolveStop?.(text);
    resolveStop = null;
  };

  const build = (): SpeechRecognitionLike => {
    const r = new Ctor();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (e: SREvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        const txt = res[0]?.transcript ?? '';
        if (res.isFinal) finalText = tidy(`${finalText} ${txt}`);
        else interim += txt;
      }
      interimText = interim;
      handlers.onInterim?.(full());
    };

    r.onerror = (e: SRErrorEvent) => {
      const code = e.error || 'unknown';
      // 'no-speech' và 'aborted' không phải hỏng hóc: cái đầu là người dùng còn
      // đang nghĩ, cái sau là do chính ta gọi abort. Báo đỏ ở đây chỉ làm người
      // học hoang mang vô cớ.
      if (code === 'no-speech' || code === 'aborted') return;
      if (FATAL.has(code)) fatal = code;
      handlers.onError?.(code);
    };

    r.onend = () => {
      // Ta chủ động dừng, hoặc gặp lỗi không chữa được → khép phiên.
      if (wantStop || fatal) {
        finish();
        return;
      }
      // Bị ngắt ngoài ý muốn → nối lại để người dùng không mất câu.
      if (resumes >= MAX_RESUMES) {
        finish();
        return;
      }
      resumes += 1;
      try {
        rec = build();
        rec.start();
        handlers.onResume?.();
      } catch {
        finish();
      }
    };

    return r;
  };

  try {
    rec = build();
    rec.start();
  } catch {
    handlers.onError?.('start-failed');
    return null;
  }

  return {
    text: full,

    stop() {
      return new Promise<string>((resolve) => {
        if (finished) {
          resolve(full());
          return;
        }
        wantStop = true;
        resolveStop = resolve;
        try {
          rec?.stop();
        } catch {
          finish();
          return;
        }
        // Safari đôi khi nuốt luôn sự kiện `onend`. Không có lưới này thì nút
        // bấm treo vĩnh viễn ở trạng thái "đang nghe".
        stopTimer = window.setTimeout(finish, 1500);
      });
    },

    abort() {
      wantStop = true;
      window.clearTimeout(stopTimer);
      try {
        rec?.abort();
      } catch {
        /* bỏ qua */
      }
      if (!finished) {
        finished = true;
        handlers.onEnd?.();
        resolveStop?.(full());
        resolveStop = null;
      }
    },
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
