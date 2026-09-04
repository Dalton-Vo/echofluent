/* ============================================================
 *  EchoFluent — Kiểu dữ liệu dùng chung
 * ============================================================ */

export type Level = 'A2' | 'B1' | 'B2' | 'C1';

/** Bối cảnh sử dụng — quyết định nội dung được cá nhân hoá cho ai */
export type Domain = 'work' | 'daily' | 'social' | 'tech';

export const DOMAIN_LABEL: Record<Domain, string> = {
  work: 'Công việc',
  tech: 'Kỹ thuật / Dev',
  daily: 'Đời sống',
  social: 'Xã giao',
};

/* ---------------- Chunk (cụm từ phản xạ) ---------------- */

/**
 * Độ "nóng" của một cụm nói bựa.
 *
 * Không phải xếp hạng cho vui — người học cần biết mình đang cầm thứ gì. Cùng
 * là "chán quá" nhưng `damn` nói trước mặt khách hàng thì qua, còn `fuck` thì
 * mất hợp đồng. Ranh giới nằm ở đây, không nằm ở nghĩa.
 *
 *   1 — damn, crap, hell. Phim chiếu giờ vàng vẫn nói.
 *   2 — shit, piss off, screw. Bạn bè thoải mái, chỗ làm thì tuỳ văn hoá.
 *   3 — họ nhà f-word. Chỉ với người thân thiết, và phải chắc họ cũng nói vậy.
 */
export type Heat = 1 | 2 | 3;

export interface Chunk {
  id: string;
  /** Cụm tiếng Anh cần thuộc lòng tới mức bật ra không cần nghĩ */
  en: string;
  /** Nghĩa / khi nào dùng (tiếng Việt) */
  vi: string;
  /** Chức năng giao tiếp: câu giờ, phản đối, làm rõ... */
  fn: FunctionTag;
  domain: Domain;
  level: Level;
  example: string;
  exampleVi: string;
  register: 'casual' | 'neutral' | 'formal' | 'raw';
  /** Mẹo phát âm / nuốt âm khi người bản xứ nói nhanh */
  say?: string;
  /** Chỉ có ở cụm `raw`. Xem chú thích của Heat. */
  heat?: Heat;
  /**
   * Chỉ có ở cụm `raw`, và BẮT BUỘC với chúng — có test canh.
   * Nói được với ai, tuyệt đối tránh chỗ nào. Dạy một câu chửi mà không dạy
   * chỗ dùng thì không phải dạy, là gài bẫy người học.
   */
  warn?: string;
}

export type FunctionTag =
  | 'thinking'
  | 'opinion'
  | 'agree'
  | 'disagree'
  | 'clarify'
  | 'turn-taking'
  | 'softening'
  | 'smalltalk'
  | 'reacting'
  | 'status'
  | 'feedback'
  | 'planning'
  | 'problem'
  | 'asking'
  | 'service'
  | 'travel'
  | 'health'
  | 'phone'
  | 'closing'
  /* --- bốn nhóm dưới đây thuộc mảng nói bựa --- */
  | 'venting'
  | 'banter'
  | 'emphasis'
  | 'dismissal';

export const FN_LABEL: Record<FunctionTag, string> = {
  thinking: 'Câu giờ khi nghĩ',
  opinion: 'Nêu ý kiến',
  agree: 'Đồng ý',
  disagree: 'Phản đối lịch sự',
  clarify: 'Làm rõ / hỏi lại',
  'turn-taking': 'Giành / nhường lượt nói',
  softening: 'Nói giảm, nói tránh',
  smalltalk: 'Bắt chuyện',
  reacting: 'Phản ứng, thể hiện quan tâm',
  status: 'Báo cáo tiến độ',
  feedback: 'Góp ý / code review',
  planning: 'Họp & lên kế hoạch',
  problem: 'Nói về sự cố, bug',
  asking: 'Nhờ vả, xin giúp đỡ',
  service: 'Mua bán, dịch vụ',
  travel: 'Đi lại, du lịch',
  health: 'Sức khoẻ, khẩn cấp',
  phone: 'Điện thoại / online meeting',
  closing: 'Kết thúc hội thoại',
  venting: 'Xả bực, văng tục',
  banter: 'Cà khịa thân mật',
  emphasis: 'Nhấn mạnh kiểu đường phố',
  dismissal: 'Dẹp đi, kệ nó',
};

/* ---------------- Reflex drill ---------------- */

export type ReflexType = 'respond' | 'translate' | 'expand' | 'react';

export interface ReflexPrompt {
  id: string;
  type: ReflexType;
  /** Câu hỏi/gợi ý hiển thị (EN với respond/react/expand, VI với translate) */
  cue: string;
  /** Bản dịch/ghi chú tiếng Việt của cue */
  cueVi: string;
  /** Cụm khoá — dùng chấm điểm khi nhận diện giọng nói */
  targets: string[];
  /** Câu mẫu của người bản xứ */
  model: string;
  modelVi: string;
  domain: Domain;
  level: Level;
  /** Số giây cho phép trước khi phải bật ra câu trả lời */
  seconds: number;
}

/* ---------------- Listening Gym ---------------- */

export type ListenFocus =
  | 'reduction'
  | 'linking'
  | 'contraction'
  | 'weak-form'
  | 'number'
  | 'phrasal'
  | 'idiom'
  | 'chunking';

export const FOCUS_LABEL: Record<ListenFocus, string> = {
  reduction: 'Nuốt âm (gonna, wanna…)',
  linking: 'Nối âm',
  contraction: 'Rút gọn (I’ve, they’re…)',
  'weak-form': 'Âm yếu (of, to, can…)',
  number: 'Số & ngày tháng',
  phrasal: 'Cụm động từ',
  idiom: 'Thành ngữ đời thường',
  chunking: 'Cắt cụm nghĩa trong câu dài',
};

export interface ListeningItem {
  id: string;
  /** Chuỗi đưa vào TTS — viết theo kiểu nói nhanh để mô phỏng người bản xứ */
  spoken: string;
  /** Dạng viết chuẩn */
  written: string;
  vi: string;
  focus: ListenFocus;
  level: Level;
  domain: Domain;
  /** 4 lựa chọn nghĩa — đáp án đúng nằm ở index 0 trước khi shuffle */
  options: string[];
  /** Giải thích vì sao nghe ra như vậy */
  note: string;
}

/* ---------------- Scenario / Role-play ---------------- */

export interface ScenarioTurn {
  speaker: 'them' | 'you';
  /** Lời thoại (với 'you' đây là câu mẫu) */
  text: string;
  vi: string;
  /** Gợi ý nhiệm vụ cho lượt của bạn */
  task?: string;
  targets?: string[];
  /** Vài cách trả lời khác nhau để mở rộng vốn */
  alts?: { text: string; note: string }[];
}

export interface Scenario {
  id: string;
  title: string;
  titleVi: string;
  emoji: string;
  domain: Domain;
  level: Level;
  /** Số phút ước lượng */
  minutes: number;
  context: string;
  contextVi: string;
  /** Ảnh minh hoạ tuỳ chọn — nếu thiếu app tự vẽ gradient */
  image?: string;
  chunkIds: string[];
  turns: ScenarioTurn[];
}

/* ---------------- Shadowing ---------------- */

export interface ShadowLine {
  /** Dùng “/” để tách nhóm nghĩa và *sao* để đánh dấu trọng âm: "I *think* / we should *ship* it" */
  text: string;
  vi: string;
}

export interface ShadowPack {
  id: string;
  title: string;
  titleVi: string;
  emoji: string;
  domain: Domain;
  level: Level;
  /** Tốc độ gợi ý khi shadow lần đầu */
  baseRate: number;
  lines: ShadowLine[];
}

/* ---------------- Missions & achievements ---------------- */

export interface Mission {
  id: string;
  title: string;
  desc: string;
  /** Chỉ số theo dõi trong store */
  metric: MissionMetric;
  target: number;
  xp: number;
  emoji: string;
}

export type MissionMetric =
  | 'drills'
  | 'listens'
  | 'shadowLines'
  | 'scenarios'
  | 'reviews'
  | 'fastAnswers'
  | 'minutes'
  | 'daysActive';

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  check: (s: AchievementInput) => boolean;
}

export interface AchievementInput {
  xp: number;
  streak: number;
  totals: Totals;
  masteredChunks: number;
  bestReactionMs: number;
}

/* ---------------- Progress / store ---------------- */

export interface Totals {
  drills: number;
  listens: number;
  shadowLines: number;
  scenarios: number;
  reviews: number;
  fastAnswers: number;
  minutes: number;
  daysActive: number;
}

export interface DayLog {
  /** YYYY-MM-DD */
  date: string;
  xp: number;
  drills: number;
  listens: number;
  shadowLines: number;
  scenarios: number;
  reviews: number;
  minutes: number;
  /** Thời gian phản xạ trung bình trong ngày (ms) */
  avgMs: number;
  msSamples: number;
}

/** Thẻ ôn tập theo thuật toán SM-2 rút gọn */
export interface SrsCard {
  id: string;
  kind: 'chunk' | 'reflex';
  ease: number;
  intervalDays: number;
  /** timestamp ms */
  due: number;
  reps: number;
  lapses: number;
  /** Tổng số lần trả lời đúng liên tiếp */
  streak: number;
}

export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface Settings {
  name: string;
  dailyGoalMin: number;
  level: Level;
  /** Ưu tiên bối cảnh nào khi sinh bài */
  focusDomains: Domain[];
  voiceURI: string | null;
  rate: number;
  showVi: boolean;
  autoPlay: boolean;
  /** Bật đồng hồ đếm ngược ép phản xạ */
  strictTimer: boolean;
  useMic: boolean;
  /** Thiết bị thu người dùng chọn. Rỗng = để hệ điều hành tự quyết. */
  micDeviceId: string;
  theme: 'dark' | 'light';
  sound: boolean;
  /**
   * Chế độ làm quen: mốc kết thúc (timestamp ms), null là chưa từng bật.
   *
   * Nằm trong `Settings` chứ không nằm riêng, để nó tự đi theo bản đồng bộ sang
   * máy khác — giai đoạn thích nghi là chuyện của người học, không phải cấu
   * hình của một cái máy. Xem `lib/warmup.ts`.
   */
  warmupUntil: number | null;
}
