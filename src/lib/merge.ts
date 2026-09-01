import type { DayLog, Settings, SrsCard, Totals } from '@/types';

/* ============================================================================
 *  TRỘN TIẾN ĐỘ GIỮA HAI THIẾT BỊ
 *
 *  Cách làm ngây thơ là "ai ghi sau thắng" — và nó ăn mất dữ liệu thật: học
 *  trên điện thoại buổi sáng, mở laptop buổi tối, laptop đẩy bản cũ đè lên là
 *  bay sạch buổi sáng.
 *
 *  Nên ở đây trộn theo TỪNG TRƯỜNG, chọn quy tắc theo đúng bản chất của trường:
 *    - số đếm luỹ kế  → lấy giá trị lớn hơn
 *    - kỷ lục tốc độ  → lấy giá trị nhỏ hơn (nhanh hơn)
 *    - nhật ký theo ngày → gộp theo ngày, mỗi chỉ số lấy giá trị lớn hơn
 *    - thẻ ôn tập     → giữ thẻ đã học được nhiều lần hơn
 *    - danh sách      → hợp hai bên
 *    - cài đặt & ghi chú → bên nào ghi sau thì thắng (đây là lựa chọn của người dùng)
 *
 *  Hàm này thuần tuý và giao hoán được: trộn A với B hay B với A đều ra một
 *  kết quả. Nhờ vậy đồng bộ nhiều lần không làm dữ liệu trôi đi đâu cả.
 * ========================================================================== */

export interface PersistedState {
  settings: Settings;
  xp: number;
  streak: number;
  bestStreak: number;
  lastActive: string | null;
  history: DayLog[];
  totals: Totals;
  week: { key: number; totals: Totals };
  srs: Record<string, SrsCard>;
  achievements: string[];
  scenarioDone: Record<string, { runs: number; best: number }>;
  bestReactionMs: number;
  weakIds: Record<string, number>;
  notes: Record<string, string>;
  lastBackupAt: number | null;
  onboarded: boolean;
}

/** Cục dữ liệu trao đổi với máy chủ */
export interface SyncEnvelope {
  updatedAt: number;
  data: PersistedState;
}

const TOTAL_KEYS: (keyof Totals)[] = [
  'drills',
  'listens',
  'shadowLines',
  'scenarios',
  'reviews',
  'fastAnswers',
  'minutes',
  'daysActive',
];

export function mergeStates(
  local: PersistedState,
  remote: PersistedState,
  /** true nếu bản remote được ghi sau bản local — quyết định các trường "ai sau thắng" */
  remoteIsNewer: boolean,
): PersistedState {
  const newer = remoteIsNewer ? remote : local;
  const older = remoteIsNewer ? local : remote;

  return {
    // Cài đặt là lựa chọn của người dùng, không phải số liệu → bên ghi sau thắng
    settings: newer.settings ?? older.settings,

    xp: Math.max(local.xp ?? 0, remote.xp ?? 0),
    streak: Math.max(local.streak ?? 0, remote.streak ?? 0),
    bestStreak: Math.max(local.bestStreak ?? 0, remote.bestStreak ?? 0),
    lastActive: laterDate(local.lastActive, remote.lastActive),

    history: mergeHistory(local.history ?? [], remote.history ?? []),
    totals: mergeTotals(local.totals, remote.totals),
    week: mergeWeek(local.week, remote.week),
    srs: mergeSrs(local.srs ?? {}, remote.srs ?? {}),

    achievements: [...new Set([...(local.achievements ?? []), ...(remote.achievements ?? [])])],
    scenarioDone: mergeScenarios(local.scenarioDone ?? {}, remote.scenarioDone ?? {}),

    // Kỷ lục phản xạ: nhanh hơn là tốt hơn, nhưng 0 nghĩa là "chưa có"
    bestReactionMs: minNonZero(local.bestReactionMs, remote.bestReactionMs),

    weakIds: mergeCounters(local.weakIds ?? {}, remote.weakIds ?? {}),

    // Ghi chú là chữ người dùng viết → bên ghi sau thắng khi trùng khoá,
    // nhưng ghi chú chỉ có ở một bên thì vẫn giữ lại.
    notes: { ...older.notes, ...newer.notes },

    lastBackupAt: maxNullable(local.lastBackupAt, remote.lastBackupAt),
    onboarded: Boolean(local.onboarded || remote.onboarded),
  };
}

/* ------------------------------ từng phần ------------------------------ */

function laterDate(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b; // dạng YYYY-MM-DD nên so sánh chuỗi là đúng thứ tự
}

function minNonZero(a: number, b: number): number {
  if (!a) return b || 0;
  if (!b) return a;
  return Math.min(a, b);
}

function maxNullable(a: number | null, b: number | null): number | null {
  if (a === null || a === undefined) return b ?? null;
  if (b === null || b === undefined) return a;
  return Math.max(a, b);
}

function mergeTotals(a: Totals | undefined, b: Totals | undefined): Totals {
  const out = {} as Totals;
  for (const k of TOTAL_KEYS) out[k] = Math.max(a?.[k] ?? 0, b?.[k] ?? 0);
  return out;
}

/**
 * Thống kê tuần tự đặt lại mỗi tuần. Chỉ trộn khi hai bên cùng một tuần;
 * khác tuần thì lấy bên có số tuần lớn hơn (tuần gần đây hơn).
 */
function mergeWeek(
  a: PersistedState['week'] | undefined,
  b: PersistedState['week'] | undefined,
): PersistedState['week'] {
  if (!a) return b ?? { key: 0, totals: mergeTotals(undefined, undefined) };
  if (!b) return a;
  if (a.key === b.key) return { key: a.key, totals: mergeTotals(a.totals, b.totals) };
  return a.key > b.key ? a : b;
}

/** Gộp nhật ký theo ngày. Cùng một ngày thì mỗi chỉ số lấy giá trị lớn hơn. */
function mergeHistory(a: DayLog[], b: DayLog[]): DayLog[] {
  const byDate = new Map<string, DayLog>();

  for (const day of [...a, ...b]) {
    const cur = byDate.get(day.date);
    if (!cur) {
      byDate.set(day.date, { ...day });
      continue;
    }
    byDate.set(day.date, {
      date: day.date,
      xp: Math.max(cur.xp, day.xp),
      drills: Math.max(cur.drills, day.drills),
      listens: Math.max(cur.listens, day.listens),
      shadowLines: Math.max(cur.shadowLines, day.shadowLines),
      scenarios: Math.max(cur.scenarios, day.scenarios),
      reviews: Math.max(cur.reviews, day.reviews),
      minutes: Math.max(cur.minutes, day.minutes),
      // Trung bình lấy theo bên đo được nhiều mẫu hơn — đáng tin hơn
      ...(day.msSamples > cur.msSamples
        ? { avgMs: day.avgMs, msSamples: day.msSamples }
        : { avgMs: cur.avgMs, msSamples: cur.msSamples }),
    });
  }

  return [...byDate.values()].sort((x, y) => (x.date < y.date ? -1 : 1)).slice(-400);
}

/**
 * Thẻ nào đã được ôn nhiều lần hơn thì thẻ đó mang tiến độ thật hơn.
 * Hoà số lần ôn thì lấy thẻ có hạn ôn xa hơn (đã nhớ chắc hơn).
 */
function mergeSrs(
  a: Record<string, SrsCard>,
  b: Record<string, SrsCard>,
): Record<string, SrsCard> {
  const out: Record<string, SrsCard> = { ...a };
  for (const [id, card] of Object.entries(b)) {
    const cur = out[id];
    if (!cur) {
      out[id] = card;
      continue;
    }
    if (card.reps > cur.reps) out[id] = card;
    else if (card.reps === cur.reps && card.due > cur.due) out[id] = card;
  }
  return out;
}

function mergeScenarios(
  a: Record<string, { runs: number; best: number }>,
  b: Record<string, { runs: number; best: number }>,
): Record<string, { runs: number; best: number }> {
  const out = { ...a };
  for (const [id, v] of Object.entries(b)) {
    const cur = out[id];
    out[id] = cur
      ? { runs: Math.max(cur.runs, v.runs), best: Math.max(cur.best, v.best) }
      : v;
  }
  return out;
}

function mergeCounters(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const out = { ...a };
  for (const [id, n] of Object.entries(b)) out[id] = Math.max(out[id] ?? 0, n);
  return out;
}
