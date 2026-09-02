/* ============================================================================
 *  Chấm phát âm bằng AI (Google Gemini)
 * ============================================================================
 *
 *  Nhận diện giọng nói của trình duyệt chỉ trả về CHỮ. Nó không nói được bạn
 *  phát âm sai chỗ nào — mà đấy mới là thứ cần biết. Tệ hơn: nó hay "tự sửa
 *  hộ", bạn đọc "tree" nó vẫn đoán ra "three" vì đoán theo ngữ cảnh, thành ra
 *  lỗi nặng nhất lại bị giấu đi.
 *
 *  Nên bản ghi âm được gửi thẳng cho Gemini — model nghe được audio thật — và
 *  trả về điểm cho TỪNG TỪ kèm IPA đúng / IPA nghe được, giống cách ELSA chấm.
 *
 *  Về khoá API — hai đường, chọn một:
 *    • Qua Worker (khuyên dùng): khoá Google nằm ở máy chủ; trình duyệt chỉ giữ
 *      mật khẩu Worker để người lạ không dùng ké proxy.
 *    • Khoá dán thẳng: chỉ nằm trong localStorage của máy bạn, tiện khi học một
 *      mình. KHÔNG BAO GIỜ đưa khoá vào mã nguồn — repo này công khai, đẩy khoá
 *      lên là Google thu hồi ngay và ai cũng xài ké được.
 * ========================================================================== */

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';

export const DEFAULT_MODEL = 'gemini-3.5-flash';

export interface AiConfig {
  /** Khoá Google khi gọi thẳng, hoặc mật khẩu Worker khi dùng proxy */
  key: string;
  /** Địa chỉ Worker đứng giữa; Google API key vẫn chỉ nằm trên Worker */
  proxyUrl: string;
  model: string;
}

export function isAiReady(cfg: AiConfig): boolean {
  return Boolean(cfg.key.trim());
}

export function aiRequestHeaders(cfg: AiConfig): Record<string, string> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cfg.proxyUrl.trim()) headers.Authorization = `Bearer ${cfg.key.trim()}`;
  else headers['x-goog-api-key'] = cfg.key.trim();
  return headers;
}

/* --------------------------- kiểu dữ liệu kết quả --------------------------- */

export interface WordScore {
  word: string;
  /** 0–100 */
  score: number;
  /** Phiên âm chuẩn */
  ipa: string;
  /** Phiên âm của những gì bạn thật sự phát ra */
  heard: string;
  /** Sửa thế nào, viết bằng tiếng Việt */
  tip: string;
}

export interface PronunciationReport {
  /** Nghe được nguyên văn, KHÔNG tự sửa lỗi hộ */
  transcript: string;
  overall: number;
  pronunciation: number;
  fluency: number;
  intonation: number;
  /** Nói được bao nhiêu phần so với câu mẫu */
  completeness: number;
  words: WordScore[];
  /** Vài âm đáng tập trung sửa nhất */
  focus: string[];
  summary: string;
}

export type AiError =
  | 'chua_cau_hinh'
  | 'khong_co_audio'
  | 'sai_khoa'
  | 'het_hang_muc'
  | 'mang_loi'
  | 'khong_doc_duoc';

export class AiFailure extends Error {
  constructor(
    public code: AiError,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function aiErrorText(code: AiError): string {
  switch (code) {
    case 'chua_cau_hinh':
      return 'Chưa gắn khoá AI. Vào Cài đặt → Chấm phát âm bằng AI để dán khoá.';
    case 'khong_co_audio':
      return 'Không có bản ghi âm. Bấm micro và nói lại một lần nữa.';
    case 'sai_khoa':
      return 'Khoá API không đúng hoặc đã bị thu hồi. Tạo khoá mới ở Google AI Studio.';
    case 'het_hang_muc':
      return 'Đã hết lượt miễn phí trong phút này. Chờ khoảng một phút rồi thử lại.';
    case 'mang_loi':
      return 'Không gọi được máy chủ AI. Kiểm tra kết nối mạng.';
    default:
      return 'AI trả về dữ liệu lạ. Thử chấm lại lần nữa.';
  }
}

/* ------------------------------ yêu cầu chấm ------------------------------ */

/**
 * Người Việt nói tiếng Anh vấp gần như đúng một bộ lỗi cố định. Liệt kê thẳng
 * ra đây thì model soi đúng chỗ, thay vì khen chung chung cho qua chuyện.
 */
const VN_ERRORS = `
Lỗi kinh điển của người Việt nói tiếng Anh — soi kỹ đúng những chỗ này:
- Rụng phụ âm cuối: "days" đọc thành /deɪ/, "want" thành /wɒn/, "like" thành /laɪ/.
- /θ/ và /ð/ thành /t/ /d/: "three" → "tree", "this" → "dis", "with" → "wit".
- Cụm phụ âm bị giản lược: "street" → "stree", "asked" → "ask", "texts" → "tex".
- Lẫn /s/ /z/ /ʃ/ /tʃ/ /dʒ/: "watch" ↔ "wash", "choose" ↔ "shoes".
- Nguyên âm dài/ngắn không phân biệt: "ship" ↔ "sheep", "full" ↔ "fool".
- Sai trọng âm từ: "deVElop" đọc thành "DEvelop".
- Nhịp câu đều đều từng tiếng một (do tiếng Việt tính theo âm tiết), thiếu độ
  nhấn - lướt, nên nghe rất "máy móc" dù từng từ đều đúng.
- Âm cuối /s/ /z/ của số nhiều và chia động từ ngôi thứ ba bị bỏ.
`.trim();

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    transcript: { type: 'STRING' },
    overall: { type: 'INTEGER' },
    pronunciation: { type: 'INTEGER' },
    fluency: { type: 'INTEGER' },
    intonation: { type: 'INTEGER' },
    completeness: { type: 'INTEGER' },
    words: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          word: { type: 'STRING' },
          score: { type: 'INTEGER' },
          ipa: { type: 'STRING' },
          heard: { type: 'STRING' },
          tip: { type: 'STRING' },
        },
        required: ['word', 'score', 'ipa', 'heard', 'tip'],
      },
    },
    focus: { type: 'ARRAY', items: { type: 'STRING' } },
    summary: { type: 'STRING' },
  },
  required: [
    'transcript',
    'overall',
    'pronunciation',
    'fluency',
    'intonation',
    'completeness',
    'words',
    'focus',
    'summary',
  ],
} as const;

function buildPrompt(target: string): string {
  return `
Bạn là giám khảo chấm phát âm tiếng Anh, chấm nghiêm như ELSA Speak.
Người học là người Việt. Toàn bộ lời khuyên viết bằng TIẾNG VIỆT, ngắn và cụ thể.

${target ? `Câu cần đọc: "${target}"` : 'Không có câu mẫu — chấm trên đúng những gì nghe được.'}

Nghe bản ghi âm rồi trả về JSON:

- transcript: chép lại ĐÚNG những gì nghe thấy. Tuyệt đối không sửa hộ.
  Người ta đọc "tree" thì ghi "tree", dù biết thừa ý họ là "three".
  Đây là quy tắc quan trọng nhất — sửa hộ là giấu mất lỗi cần chữa.
- words: một mục cho MỖI từ trong câu mẫu (không có câu mẫu thì theo transcript).
    · word  : từ đó
    · score : 0–100 cho riêng từ này
    · ipa   : phiên âm CHUẨN
    · heard : phiên âm của cái người ta THẬT SỰ phát ra (giống ipa nếu đọc đúng)
    · tip   : sai thì bảo cách đặt lưỡi/môi để sửa; đúng thì để chuỗi rỗng
  Từ bị bỏ qua không đọc → score 0, heard là "—".
- pronunciation: độ chuẩn của âm.
- fluency: trôi chảy — ngập ngừng, ê a, ngắt vụn thì trừ.
- intonation: nhịp và ngữ điệu. Đọc đều đều từng tiếng một là điểm thấp.
- completeness: đọc được bao nhiêu phần trăm câu mẫu.
- overall: điểm tổng, coi trọng pronunciation nhất.
- focus: 2–3 âm hoặc thói quen đáng sửa trước nhất, ví dụ "âm cuối /z/", "âm /θ/".
- summary: 1–2 câu, nói thẳng nhưng khích lệ.

Chấm cho thật: đọc chuẩn thì cho 90+, sai rõ thì mạnh tay cho dưới 50.
Cho ai cũng 80 điểm thì người học không biết đường nào mà sửa.

${VN_ERRORS}
`.trim();
}

/* ------------------------------ gọi máy chủ ------------------------------ */

interface GenPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

async function callGemini(
  cfg: AiConfig,
  model: string,
  parts: GenPart[],
  schema?: unknown,
): Promise<string> {
  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: schema
      ? { responseMimeType: 'application/json', responseSchema: schema }
      : {},
  };

  const proxy = cfg.proxyUrl.trim();
  const url = proxy
    ? `${proxy.replace(/\/+$/, '')}/ai/${model}`
    : `${API_ROOT}/${model}:generateContent`;

  const headers = aiRequestHeaders(cfg);

  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  } catch {
    throw new AiFailure('mang_loi');
  }

  if (res.status === 400 || res.status === 401 || res.status === 403) {
    throw new AiFailure('sai_khoa');
  }
  if (res.status === 429) throw new AiFailure('het_hang_muc');
  if (!res.ok) throw new AiFailure('mang_loi', `HTTP ${res.status}`);

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new AiFailure('khong_doc_duoc');
  }

  const text = (data as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  })?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');

  if (!text) throw new AiFailure('khong_doc_duoc');
  return text;
}

/** Chuẩn hoá dữ liệu model trả về — không tin tuyệt đối vào đầu ra của AI */
function normalizeReport(raw: unknown, target: string): PronunciationReport {
  const o = raw as Record<string, unknown>;
  const num = (v: unknown, fallback = 0) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : fallback;
  };
  const str = (v: unknown) => (typeof v === 'string' ? v : '');

  const words: WordScore[] = Array.isArray(o.words)
    ? (o.words as unknown[]).slice(0, 60).map((w) => {
        const x = (w ?? {}) as Record<string, unknown>;
        return {
          word: str(x.word),
          score: num(x.score),
          ipa: str(x.ipa),
          heard: str(x.heard),
          tip: str(x.tip),
        };
      }).filter((w) => w.word)
    : [];

  const pronunciation = num(o.pronunciation);
  return {
    transcript: str(o.transcript),
    pronunciation,
    fluency: num(o.fluency),
    intonation: num(o.intonation),
    completeness: num(o.completeness, target ? 0 : 100),
    // Model thỉnh thoảng quên trả overall — tự tính lại cho chắc.
    overall: num(o.overall) || pronunciation,
    words,
    focus: Array.isArray(o.focus) ? (o.focus as unknown[]).map(str).filter(Boolean).slice(0, 4) : [],
    summary: str(o.summary),
  };
}

/**
 * Chấm phát âm một bản ghi âm.
 * `audio` phải là WAV — dùng `toWav()` trong lib/audio trước khi gọi.
 */
export async function reviewPronunciation(
  cfg: AiConfig,
  audioBase64: string,
  mime: string,
  target: string,
): Promise<PronunciationReport> {
  if (!isAiReady(cfg)) throw new AiFailure('chua_cau_hinh');
  if (!audioBase64) throw new AiFailure('khong_co_audio');

  const text = await callGemini(
    cfg,
    cfg.model || DEFAULT_MODEL,
    [{ text: buildPrompt(target) }, { inlineData: { mimeType: mime, data: audioBase64 } }],
    SCHEMA,
  );

  try {
    return normalizeReport(JSON.parse(text), target);
  } catch {
    throw new AiFailure('khong_doc_duoc');
  }
}

/**
 * Chép lại lời nói thành chữ.
 *
 * Dùng cho Firefox và các trình duyệt không có Web Speech API: ghi âm vẫn chạy
 * bình thường, chỉ thiếu mỗi khâu đổi ra chữ — nhờ Gemini làm nốt là app chấm
 * điểm được như thường.
 */
export async function transcribeAudio(
  cfg: AiConfig,
  audioBase64: string,
  mime: string,
): Promise<string> {
  if (!isAiReady(cfg)) throw new AiFailure('chua_cau_hinh');
  if (!audioBase64) throw new AiFailure('khong_co_audio');

  const text = await callGemini(cfg, cfg.model || DEFAULT_MODEL, [
    {
      text:
        'Chép lại nguyên văn lời nói tiếng Anh trong đoạn ghi âm. ' +
        'Chỉ trả về đúng phần lời, không thêm giải thích, không thêm dấu ngoặc kép. ' +
        'Không có tiếng nói nào thì trả về chuỗi rỗng.',
    },
    { inlineData: { mimeType: mime, data: audioBase64 } },
  ]);

  return text.trim().replace(/^["'`]|["'`]$/g, '');
}

/** Kiểm tra khoá có dùng được không — dùng cho nút "Kiểm tra" ở Cài đặt */
export async function pingAi(cfg: AiConfig): Promise<{ ok: boolean; message: string }> {
  if (!isAiReady(cfg)) return { ok: false, message: aiErrorText('chua_cau_hinh') };
  try {
    const out = await callGemini(cfg, cfg.model || DEFAULT_MODEL, [
      { text: 'Trả lời đúng một chữ: OK' },
    ]);
    return { ok: true, message: `Kết nối tốt — model trả lời: ${out.trim().slice(0, 20)}` };
  } catch (e) {
    const code = e instanceof AiFailure ? e.code : 'mang_loi';
    return { ok: false, message: aiErrorText(code) };
  }
}
