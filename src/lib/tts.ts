/* ============================================================================
 *  Giọng đọc tự nhiên bằng Gemini TTS
 * ============================================================================
 *
 *  Giọng có sẵn của hệ điều hành đọc đúng chữ nhưng sai nhạc: nhịp đều đều,
 *  không có chỗ nhấn chỗ lướt. Mà nhại theo một giọng như vậy thì người học
 *  nhại luôn cả cái đều đều đó — hỏng đúng thứ mà bài shadowing sinh ra để rèn.
 *
 *  Ba điều bắt buộc phải có, không phải để tối ưu mà để tính năng này dùng
 *  được thật:
 *
 *  1. NHỚ ĐỆM BỀN. Nội dung học là cố định — 61 câu phản xạ, 10 bộ shadowing,
 *     đọc đi đọc lại hàng trăm lần. Sinh lại mỗi lần là đốt hạn mức vô ích.
 *     Đệm vào IndexedDB nên đóng app mở lại vẫn còn.
 *  2. TỰ LÙI VỀ GIỌNG MÁY. Gói miễn phí chặn hạn mức rất nhanh (429 sau vài
 *     câu liên tiếp). Hết lượt mà app im bặt thì tệ hơn hẳn giọng máy khô.
 *  3. KHÔNG CHẶN. Câu hỏi phải hiện ra ngay; giọng tới sau cũng được.
 * ========================================================================== */

import { aiRequestHeaders, type AiConfig } from '@/lib/gemini';

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

/** Giọng chọn sẵn — đã nghe thử và chọn ra bốn giọng hợp cho việc học */
export const AI_VOICES = [
  { id: 'Kore', label: 'Kore — nữ, rõ ràng, hợp luyện nghe' },
  { id: 'Puck', label: 'Puck — nam, trẻ, nhịp tự nhiên' },
  { id: 'Charon', label: 'Charon — nam, trầm, chậm rãi' },
  { id: 'Aoede', label: 'Aoede — nữ, ấm, kiểu kể chuyện' },
] as const;

export const DEFAULT_AI_VOICE = 'Kore';

/* ------------------------------ nhớ đệm ------------------------------ */

const DB_NAME = 'echofluent-tts';
const STORE = 'clips';
/** Đủ chứa toàn bộ nội dung học vài lần, vẫn nhẹ so với hạn mức của trình duyệt */
const MAX_ENTRIES = 600;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      // Chế độ riêng tư của một số trình duyệt cấm IndexedDB. Không sao —
      // mất đệm bền thì vẫn còn đệm trong bộ nhớ.
      resolve(null);
    }
  });
  return dbPromise;
}

/** Đệm trong bộ nhớ, phục vụ những lần đọc lại ngay trong một phiên */
const memCache = new Map<string, Blob>();

function keyOf(voice: string, text: string): string {
  return `${voice}::${text.trim().toLowerCase()}`;
}

async function readCache(key: string): Promise<Blob | null> {
  const hit = memCache.get(key);
  if (hit) return hit;

  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => {
        const val = req.result as Blob | undefined;
        if (val) memCache.set(key, val);
        resolve(val ?? null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeCache(key: string, blob: Blob): Promise<void> {
  memCache.set(key, blob);
  const db = await openDb();
  if (!db) return;
  try {
    const store = db.transaction(STORE, 'readwrite').objectStore(STORE);
    store.put(blob, key);
    // Dọn bớt khi phình quá: xoá theo thứ tự khoá, đủ dùng vì mục đích chỉ là
    // chặn trần chứ không phải quản lý bộ đệm cho tinh vi.
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result <= MAX_ENTRIES) return;
      const cur = store.openCursor();
      let toDelete = countReq.result - MAX_ENTRIES;
      cur.onsuccess = () => {
        const c = cur.result;
        if (!c || toDelete <= 0) return;
        c.delete();
        toDelete -= 1;
        c.continue();
      };
    };
  } catch {
    /* ghi đệm hỏng thì bỏ qua, không ảnh hưởng việc phát */
  }
}

/** Xoá sạch đệm — dùng cho nút dọn dẹp trong Cài đặt */
export async function clearTtsCache(): Promise<void> {
  memCache.clear();
  const db = await openDb();
  if (!db) return;
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).clear();
  } catch {
    /* bỏ qua */
  }
}

export async function ttsCacheSize(): Promise<number> {
  const db = await openDb();
  if (!db) return memCache.size;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    } catch {
      resolve(0);
    }
  });
}

/* --------------------------- PCM thô → WAV --------------------------- */

/**
 * Gemini trả về PCM trần (`audio/L16;codec=pcm;rate=24000`) — thẻ <audio> của
 * trình duyệt không phát thẳng được vì thiếu phần đầu mô tả định dạng. Bọc
 * thêm 44 byte header WAV là phát được ngay, không cần giải mã gì.
 */
export function pcmToWav(pcm: Uint8Array<ArrayBuffer>, rate = 24000): Blob {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const ascii = (off: number, s: string) => {
    for (let i = 0; i < s.length; i += 1) view.setUint8(off + i, s.charCodeAt(i));
  };

  ascii(0, 'RIFF');
  view.setUint32(4, 36 + pcm.length, true);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  ascii(36, 'data');
  view.setUint32(40, pcm.length, true);

  return new Blob([header, pcm], { type: 'audio/wav' });
}

/** Lấy nhịp lấy mẫu từ chuỗi mime kiểu "audio/L16;codec=pcm;rate=24000" */
function rateFromMime(mime: string): number {
  const m = /rate=(\d+)/.exec(mime);
  return m ? Number(m[1]) : 24000;
}

function b64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/* ------------------------------ sinh giọng ------------------------------ */

export class TtsFailure extends Error {
  constructor(public code: 'chua_cau_hinh' | 'het_hang_muc' | 'mang_loi') {
    super(code);
  }
}

/**
 * Sinh giọng cho một câu. Có sẵn trong đệm thì trả về ngay, không gọi mạng.
 *
 * `style` là chỉ dẫn cách đọc — Gemini TTS nghe theo lời mô tả bằng chữ, nên
 * bảo nó "đọc chậm và rõ" là ra giọng khác hẳn. Đây là thứ giọng của hệ điều
 * hành không làm được: ở đó chỉnh tốc độ chỉ là kéo giãn máy móc, còn ở đây là
 * đọc lại theo một cách khác.
 */
export async function synthesize(
  cfg: AiConfig,
  text: string,
  voice: string = DEFAULT_AI_VOICE,
  style = '',
): Promise<Blob> {
  const clean = text.trim();
  if (!clean) throw new TtsFailure('mang_loi');

  const key = keyOf(`${voice}|${style}`, clean);
  const cached = await readCache(key);
  if (cached) return cached;

  const proxy = cfg.proxyUrl.trim();
  if (!cfg.key.trim()) throw new TtsFailure('chua_cau_hinh');

  const url = proxy
    ? `${proxy.replace(/\/+$/, '')}/ai/${TTS_MODEL}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`;

  const headers = aiRequestHeaders(cfg);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contents: [{ parts: [{ text: style ? `${style}: ${clean}` : clean }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      }),
    });
  } catch {
    throw new TtsFailure('mang_loi');
  }

  if (res.status === 429) throw new TtsFailure('het_hang_muc');
  if (!res.ok) throw new TtsFailure('mang_loi');

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string } }[] } }[];
  };
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
  if (!part?.data) throw new TtsFailure('mang_loi');

  const wav = pcmToWav(b64ToBytes(part.data), rateFromMime(part.mimeType));
  void writeCache(key, wav);
  return wav;
}

/* ------------------------------ phát tiếng ------------------------------ */

let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

export function stopAiVoice(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

/** Phát một đoạn audio đã sinh. Trả về Promise kết thúc khi đọc xong. */
export function playClip(blob: Blob, rate = 1): Promise<void> {
  stopAiVoice();
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    // Tốc độ ở đây chỉ để tinh chỉnh nhẹ; muốn đổi hẳn cách đọc thì dùng `style`.
    audio.playbackRate = Math.max(0.5, Math.min(2, rate));
    currentAudio = audio;
    currentUrl = url;

    const done = () => {
      if (currentUrl === url) {
        URL.revokeObjectURL(url);
        currentUrl = null;
        currentAudio = null;
      }
      resolve();
    };
    audio.onended = done;
    audio.onerror = () => {
      done();
      reject(new TtsFailure('mang_loi'));
    };
    void audio.play().catch(() => {
      done();
      reject(new TtsFailure('mang_loi'));
    });
  });
}

/** Câu này đã có sẵn trong đệm chưa — dùng để nạp trước mà không gọi mạng thừa */
export async function isCached(text: string, voice: string, style = ''): Promise<boolean> {
  return Boolean(await readCache(keyOf(`${voice}|${style}`, text.trim())));
}
