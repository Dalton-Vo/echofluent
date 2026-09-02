/* ============================================================================
 *  Chấm điểm câu nói
 *
 *  Mục tiêu của app là PHẢN XẠ, không phải chính tả. Nên cách chấm ở đây
 *  cố tình dễ tính: miễn bạn bắn trúng các cụm khoá và ý chính là được điểm.
 *  Nhận diện giọng nói cũng hay nghe nhầm, nên chấm khắt khe sẽ phản tác dụng.
 * ========================================================================== */

const FILLER = new Set([
  'uh', 'um', 'er', 'ah', 'like', 'so', 'well', 'okay', 'ok', 'yeah', 'yes',
  'the', 'a', 'an', 'to', 'of', 'and', 'is', 'it', 'i', 'you',
]);

/** Bỏ dấu câu, hạ về chữ thường, chuẩn hoá dạng rút gọn */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\bgonna\b/g, 'going to')
    .replace(/\bwanna\b/g, 'want to')
    .replace(/\bgotta\b/g, 'got to')
    .replace(/\bkinda\b/g, 'kind of')
    .replace(/\blemme\b/g, 'let me')
    .replace(/\bdunno\b/g, "don't know")
    .replace(/\bcannot\b/g, "can't")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bi am\b/g, "i'm")
    .replace(/\bit is\b/g, "it's")
    .replace(/\bthat is\b/g, "that's")
    .replace(/\bi would\b/g, "i'd")
    .replace(/\bi will\b/g, "i'll")
    .replace(/\bi have\b/g, "i've")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function words(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean);
}

/** Từ "có nghĩa" — bỏ hư từ và tiếng ừm à */
export function contentWords(s: string): string[] {
  return words(s).filter((w) => !FILLER.has(w) && w.length > 1);
}

export interface MatchResult {
  /** 0–100 */
  score: number;
  /** Cụm khoá bắn trúng */
  hit: string[];
  /** Cụm khoá còn thiếu */
  missed: string[];
  /** Số từ có nghĩa bạn nói ra */
  spokenWords: number;
  verdict: 'great' | 'good' | 'partial' | 'weak';
}

/**
 * Chấm câu nói.
 *
 *  70 điểm — phần "nội dung", lấy giá trị TỐT HƠN trong hai cách đo:
 *      (a) bắn trúng bao nhiêu cụm khoá
 *      (b) giống câu mẫu tới đâu
 *  30 điểm — có nói đủ dài không (phản xạ tốt là nói trọn một câu)
 *
 *  Vì sao phải lấy giá trị tốt hơn: nhiều câu có `targets` là các cách nói
 *  THAY THẾ nhau chứ không phải đều bắt buộc — ví dụ phản ứng ngạc nhiên có thể
 *  là "no way", "seriously" hay "wow". Nếu chỉ đếm cụm khoá thì ngay cả người
 *  nói đúng y hệt câu mẫu cũng không bao giờ đạt điểm cao, và người học sẽ bị
 *  phạt oan vì chọn một cách nói hợp lệ.
 */
export function scoreAnswer(spoken: string, targets: string[], model: string): MatchResult {
  const said = normalize(spoken);
  const saidWords = contentWords(spoken);

  const hit: string[] = [];
  const missed: string[] = [];
  for (const t of targets) {
    const nt = normalize(t);
    if (!nt) continue;
    if (said.includes(nt) || looseIncludes(saidWords, nt)) hit.push(t);
    else missed.push(t);
  }

  const coverage = targets.length ? hit.length / targets.length : 0;
  const similarity = overlapRatio(saidWords, contentWords(model));
  const contentScore = Math.max(coverage, similarity) * 70;

  // Độ dài kỳ vọng lấy từ câu mẫu, nhưng không đòi hỏi bằng đúng
  const expected = Math.max(3, contentWords(model).length * 0.55);
  const lengthScore = Math.min(1, saidWords.length / expected) * 30;

  const score = Math.round(Math.min(100, contentScore + lengthScore));

  let verdict: MatchResult['verdict'] = 'weak';
  if (score >= 80) verdict = 'great';
  else if (score >= 60) verdict = 'good';
  else if (score >= 35) verdict = 'partial';

  return { score, hit, missed, spokenWords: saidWords.length, verdict };
}

/** Tỉ lệ từ có nghĩa của `target` xuất hiện trong `said`, có đếm số lần lặp */
function overlapRatio(said: string[], target: string[]): number {
  if (!target.length) return 0;
  const bag = new Map<string, number>();
  for (const w of target) bag.set(w, (bag.get(w) ?? 0) + 1);
  let matched = 0;
  for (const w of said) {
    const left = bag.get(w) ?? 0;
    if (left > 0) {
      bag.set(w, left - 1);
      matched += 1;
    }
  }
  return matched / target.length;
}

/** Cho phép trúng khi các từ của cụm khoá xuất hiện rời rạc nhưng đúng thứ tự */
function looseIncludes(saidWords: string[], target: string): boolean {
  const parts = target.split(' ').filter((w) => w.length > 2);
  if (!parts.length) return false;
  let idx = 0;
  for (const w of saidWords) {
    if (w.startsWith(parts[idx]) || parts[idx].startsWith(w)) {
      idx += 1;
      if (idx === parts.length) return true;
    }
  }
  return false;
}

/** So sánh câu shadow với bản gốc — dùng cho màn hình Shadowing */
export function shadowAccuracy(spoken: string, target: string): number {
  // Ở đây tính trên TẤT CẢ các từ (kể cả hư từ), vì shadowing quan tâm cả nhịp
  // câu chứ không chỉ nội dung.
  return Math.round(overlapRatio(words(spoken), words(target)) * 100);
}

/** Xáo mảng theo hạt giống cố định — cùng seed thì cùng thứ tự */
export function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const a = [...arr];
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.abs(rnd()) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


/* ============================================================================
 *  Chặn tiếng vọng
 * ========================================================================== */

/**
 * Câu vừa nghe được có phải chính là câu app vừa đọc ra loa không.
 *
 * Khi không đeo tai nghe, micro thu luôn giọng máy đọc câu hỏi, và nhận diện
 * giọng nói chép nó lại y như thể người học vừa nói. Hậu quả thấy rõ trên màn
 * hình: câu hỏi "How do you like living here?" biến thành câu trả lời
 * "How do you like How do you like being here" — rồi bị chấm điểm nghiêm túc
 * như một câu trả lời thật.
 *
 * Chống tiếng vọng của trình duyệt (`echoCancellation`) không cứu được ca này
 * vì bộ đọc của hệ điều hành đi theo đường âm thanh riêng, không nằm trong đồ
 * thị mà bộ khử tiếng vọng nhìn thấy.
 *
 * Cách nhận ra: câu nghe được trùng phần lớn với câu vừa đọc, mà lại gần như
 * không có chữ nào ngoài câu đó. Người học trả lời thật thì luôn mang theo từ
 * mới — kể cả khi họ nhại lại một phần câu hỏi.
 */
export function looksLikeEcho(spoken: string, promptText: string): boolean {
  const said = new Set(words(spoken));
  const prompt = new Set(words(promptText));
  if (!said.size || !prompt.size) return false;

  /* Đếm theo TỪ KHÁC NHAU, không theo tổng số từ. Tiếng vọng thường lặp cụm —
   * ca thật gặp trên máy là "How do you like How do you like being here", dài
   * gấp rưỡi câu hỏi gốc. Đo bằng tổng số từ thì đúng những ca lặp nặng nhất
   * lại lọt lưới vì bị tưởng nhầm là câu trả lời dài. */
  let outside = 0;
  for (const w of said) if (!prompt.has(w)) outside += 1;

  /* Câu quá ngắn thì không đủ căn cứ. "living here" đúng là toàn chữ của câu
   * hỏi, nhưng cũng có thể là người học trả lời cụt — thà bỏ sót một tiếng
   * vọng còn hơn vứt oan câu trả lời thật của người ta. */
  if (said.size < 4) return false;

  const overlap = said.size - outside;
  return overlap / said.size >= 0.8 && overlap / prompt.size >= 0.75;
}
