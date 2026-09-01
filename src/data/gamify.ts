import type { Achievement, Mission } from '@/types';

/* ============================================================================
 *  NHIỆM VỤ & HUY HIỆU — phần "kích thích khám phá"
 *  Nhiệm vụ đổi mỗi tuần (chọn theo số tuần trong năm) nên luôn có cảm giác mới.
 * ========================================================================== */

export const MISSION_POOL: Mission[] = [
  { id: 'm-drill-30', title: 'Nổ 30 phát phản xạ', desc: 'Hoàn thành 30 câu Reflex Drill', metric: 'drills', target: 30, xp: 120, emoji: '⚡' },
  { id: 'm-drill-60', title: 'Xạ thủ 60 phát', desc: 'Hoàn thành 60 câu Reflex Drill', metric: 'drills', target: 60, xp: 240, emoji: '🎯' },
  { id: 'm-fast-15', title: 'Bật ra dưới 3 giây', desc: 'Trả lời 15 câu trong vòng 3 giây', metric: 'fastAnswers', target: 15, xp: 180, emoji: '🚀' },
  { id: 'm-fast-25', title: 'Tốc độ bản xứ', desc: 'Trả lời 25 câu trong vòng 3 giây', metric: 'fastAnswers', target: 25, xp: 260, emoji: '💨' },
  { id: 'm-listen-25', title: 'Tai thính hơn', desc: 'Làm đúng 25 bài Listening Gym', metric: 'listens', target: 25, xp: 140, emoji: '👂' },
  { id: 'm-listen-40', title: 'Nghe là hiểu liền', desc: 'Làm đúng 40 bài Listening Gym', metric: 'listens', target: 40, xp: 220, emoji: '🎧' },
  { id: 'm-shadow-40', title: 'Bắt nhịp bản xứ', desc: 'Shadow 40 câu', metric: 'shadowLines', target: 40, xp: 160, emoji: '🗣️' },
  { id: 'm-shadow-80', title: 'Cái bóng hoàn hảo', desc: 'Shadow 80 câu', metric: 'shadowLines', target: 80, xp: 280, emoji: '🌗' },
  { id: 'm-scene-3', title: 'Diễn viên nhập vai', desc: 'Hoàn thành 3 tình huống role-play', metric: 'scenarios', target: 3, xp: 200, emoji: '🎭' },
  { id: 'm-scene-5', title: 'Sống sót mọi hoàn cảnh', desc: 'Hoàn thành 5 tình huống role-play', metric: 'scenarios', target: 5, xp: 320, emoji: '🎬' },
  { id: 'm-review-40', title: 'Không để quên', desc: 'Ôn 40 thẻ SRS', metric: 'reviews', target: 40, xp: 150, emoji: '🔁' },
  { id: 'm-min-60', title: 'Một giờ mỗi tuần', desc: 'Luyện tổng cộng 60 phút', metric: 'minutes', target: 60, xp: 200, emoji: '⏳' },
  { id: 'm-days-5', title: 'Năm ngày liên tục', desc: 'Có mặt 5 ngày trong tuần', metric: 'daysActive', target: 5, xp: 250, emoji: '📅' },
  { id: 'm-days-7', title: 'Trọn vẹn cả tuần', desc: 'Có mặt đủ 7 ngày', metric: 'daysActive', target: 7, xp: 400, emoji: '🔥' },
];

/** Lấy 3 nhiệm vụ của tuần hiện tại — cùng một tuần thì luôn ra cùng bộ */
export function missionsForWeek(weekKey: number): Mission[] {
  const pool = [...MISSION_POOL];
  const picked: Mission[] = [];
  let seed = weekKey * 9301 + 49297;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  while (picked.length < 3 && pool.length) {
    picked.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  return picked;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a-first',
    title: 'Bước đầu tiên',
    desc: 'Hoàn thành buổi luyện đầu tiên',
    emoji: '🌱',
    check: (s) => s.totals.drills + s.totals.listens + s.totals.shadowLines > 0,
  },
  {
    id: 'a-streak3',
    title: 'Ba ngày liền',
    desc: 'Giữ chuỗi 3 ngày',
    emoji: '🔥',
    check: (s) => s.streak >= 3,
  },
  {
    id: 'a-streak7',
    title: 'Một tuần không nghỉ',
    desc: 'Giữ chuỗi 7 ngày',
    emoji: '🏕️',
    check: (s) => s.streak >= 7,
  },
  {
    id: 'a-streak30',
    title: 'Thói quen đã hình thành',
    desc: 'Giữ chuỗi 30 ngày',
    emoji: '🗿',
    check: (s) => s.streak >= 30,
  },
  {
    id: 'a-drill100',
    title: 'Trăm phát trăm trúng',
    desc: 'Trả lời 100 câu phản xạ',
    emoji: '💯',
    check: (s) => s.totals.drills >= 100,
  },
  {
    id: 'a-drill500',
    title: 'Cỗ máy phản xạ',
    desc: 'Trả lời 500 câu phản xạ',
    emoji: '🤖',
    check: (s) => s.totals.drills >= 500,
  },
  {
    id: 'a-fast',
    title: 'Nhanh như chớp',
    desc: 'Có câu trả lời dưới 1,5 giây',
    emoji: '⚡',
    check: (s) => s.bestReactionMs > 0 && s.bestReactionMs < 1500,
  },
  {
    id: 'a-ear',
    title: 'Đôi tai bản xứ',
    desc: 'Làm đúng 100 bài Listening Gym',
    emoji: '👂',
    check: (s) => s.totals.listens >= 100,
  },
  {
    id: 'a-actor',
    title: 'Nhập vai trọn vẹn',
    desc: 'Hoàn thành cả 12 tình huống',
    emoji: '🎭',
    check: (s) => s.totals.scenarios >= 12,
  },
  {
    id: 'a-master50',
    title: 'Năm mươi cụm nằm lòng',
    desc: 'Thuộc 50 cụm phản xạ (thẻ SRS đạt mức nhớ lâu)',
    emoji: '🧠',
    check: (s) => s.masteredChunks >= 50,
  },
  {
    id: 'a-master150',
    title: 'Trọn bộ thư viện',
    desc: 'Thuộc 150 cụm phản xạ',
    emoji: '📚',
    check: (s) => s.masteredChunks >= 150,
  },
  {
    id: 'a-xp5k',
    title: 'Năm nghìn XP',
    desc: 'Tích luỹ 5.000 XP',
    emoji: '⭐',
    check: (s) => s.xp >= 5000,
  },
  {
    id: 'a-xp20k',
    title: 'Hai mươi nghìn XP',
    desc: 'Tích luỹ 20.000 XP',
    emoji: '🌟',
    check: (s) => s.xp >= 20000,
  },
  {
    id: 'a-shadow200',
    title: 'Cái bóng của bản xứ',
    desc: 'Shadow 200 câu',
    emoji: '🌗',
    check: (s) => s.totals.shadowLines >= 200,
  },
];

/* ---------------------------------------------------------------------------
 *  Cấp độ: XP → level. Mỗi cấp cần nhiều hơn cấp trước một chút.
 * ------------------------------------------------------------------------- */

export const LEVEL_TITLES = [
  'Người mới bắt đầu',
  'Dám mở miệng',
  'Nói được câu dài',
  'Bắt kịp hội thoại',
  'Phản xạ khá nhanh',
  'Nói không cần dịch',
  'Trò chuyện thoải mái',
  'Gần như tự động',
  'Phản xạ bản năng',
  'Thông thạo',
];

export function levelFromXp(xp: number): { level: number; title: string; into: number; need: number } {
  let level = 1;
  let remaining = xp;
  let need = 300;
  while (remaining >= need && level < 40) {
    remaining -= need;
    level += 1;
    need = Math.round(need * 1.18);
  }
  const title = LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 4))];
  return { level, title, into: remaining, need };
}
