import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayLog, Grade, Settings, SrsCard, Totals } from '@/types';
import { gradeCard, isMastered, newCard } from '@/lib/srs';
import { todayKey, daysBetween, weekKey } from '@/lib/utils';
import type { PersistedState } from '@/lib/merge';
import { ACHIEVEMENTS } from '@/data/gamify';

/* ============================================================================
 *  Toàn bộ tiến trình học nằm ở đây và được lưu vào localStorage.
 *  Không có server, không tài khoản — mở máy là học tiếp.
 * ========================================================================== */

const EMPTY_TOTALS: Totals = {
  drills: 0,
  listens: 0,
  shadowLines: 0,
  scenarios: 0,
  reviews: 0,
  fastAnswers: 0,
  minutes: 0,
  daysActive: 0,
};

export interface ActivityDelta {
  drills?: number;
  listens?: number;
  shadowLines?: number;
  scenarios?: number;
  reviews?: number;
  fastAnswers?: number;
  minutes?: number;
  xp?: number;
  /** Thời gian phản xạ của câu vừa rồi (ms) — dùng để tính tốc độ trung bình */
  reactionMs?: number;
}

interface StoreState {
  settings: Settings;
  xp: number;
  streak: number;
  bestStreak: number;
  lastActive: string | null;
  history: DayLog[];
  totals: Totals;
  /** Thống kê của tuần hiện tại, tự reset khi sang tuần mới */
  week: { key: number; totals: Totals };
  srs: Record<string, SrsCard>;
  achievements: string[];
  newAchievements: string[];
  scenarioDone: Record<string, { runs: number; best: number }>;
  bestReactionMs: number;
  /** Cụm/câu bạn hay trả lời sai — dùng để ưu tiên ôn lại */
  weakIds: Record<string, number>;
  /**
   * Ghi chú của riêng bạn cho từng cụm. Tự viết một câu giải thích bằng lời của
   * mình là cách ghi nhớ mạnh nhất — mạnh hơn mọi mẹo do người khác soạn sẵn.
   */
  notes: Record<string, string>;
  /** Lần cuối tải file sao lưu (timestamp ms). Dùng để nhắc khi đã lâu không sao lưu. */
  lastBackupAt: number | null;
  /**
   * Cấu hình đồng bộ giữa các thiết bị. `secret` là mật khẩu do người dùng tự
   * đặt khi deploy Worker — nó chỉ nằm trong trình duyệt của chính họ, không
   * bao giờ nằm trong mã nguồn hay bản build.
   */
  sync: { url: string; secret: string };
  lastSyncAt: number | null;
  /**
   * Cấu hình chấm phát âm bằng AI. `key` là khoá Google AI Studio của riêng
   * bạn — nó nằm trong localStorage của máy này thôi, không có trong mã nguồn
   * và không bao giờ được đẩy lên repo. Ai dùng Worker thì để trống `key` và
   * điền `proxyUrl`, khi đó khoá nằm ở máy chủ, trình duyệt không giữ gì.
   */
  ai: { key: string; proxyUrl: string; model: string; enabled: boolean };
  /**
   * Nhắc luyện định kỳ. `nextAt` là mốc thời gian thật của lần nhắc kế tiếp,
   * lưu lại để đóng app mở lại vẫn đúng nhịp chứ không đếm lại từ đầu.
   */
  nudge: { on: boolean; everyMin: number; nextAt: number | null; speak: boolean };
  onboarded: boolean;

  /* actions */
  log: (d: ActivityDelta) => void;
  ensureCards: (ids: string[], kind: SrsCard['kind']) => void;
  grade: (id: string, kind: SrsCard['kind'], g: Grade) => void;
  markWeak: (id: string) => void;
  clearWeak: (id: string) => void;
  setNote: (id: string, text: string) => void;
  markBackedUp: () => void;
  setSync: (patch: Partial<{ url: string; secret: string }>) => void;
  setAi: (patch: Partial<{ key: string; proxyUrl: string; model: string; enabled: boolean }>) => void;
  setNudge: (
    patch: Partial<{ on: boolean; everyMin: number; nextAt: number | null; speak: boolean }>,
  ) => void;
  /** Thay toàn bộ tiến độ bằng bản đã trộn từ máy chủ đồng bộ */
  hydrate: (next: PersistedState) => void;
  finishScenario: (id: string, score: number) => void;
  setSettings: (patch: Partial<Settings>) => void;
  dismissAchievements: () => void;
  completeOnboarding: () => void;
  resetAll: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  name: '',
  dailyGoalMin: 15,
  level: 'B1',
  focusDomains: ['work', 'tech', 'daily', 'social'],
  voiceURI: null,
  rate: 1,
  showVi: true,
  autoPlay: true,
  strictTimer: true,
  useMic: true,
  theme: 'dark',
  sound: true,
};

function emptyDay(date: string): DayLog {
  return {
    date,
    xp: 0,
    drills: 0,
    listens: 0,
    shadowLines: 0,
    scenarios: 0,
    reviews: 0,
    minutes: 0,
    avgMs: 0,
    msSamples: 0,
  };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      xp: 0,
      streak: 0,
      bestStreak: 0,
      lastActive: null,
      history: [],
      totals: { ...EMPTY_TOTALS },
      week: { key: weekKey(), totals: { ...EMPTY_TOTALS } },
      srs: {},
      achievements: [],
      newAchievements: [],
      scenarioDone: {},
      bestReactionMs: 0,
      weakIds: {},
      notes: {},
      lastBackupAt: null,
      sync: { url: '', secret: '' },
      lastSyncAt: null,
      ai: { key: '', proxyUrl: '', model: 'gemini-3.5-flash', enabled: true },
      nudge: { on: false, everyMin: 15, nextAt: null, speak: true },
      onboarded: false,

      log: (d) =>
        set((s) => {
          const today = todayKey();

          /* ---- chuỗi ngày ---- */
          let streak = s.streak;
          let daysActiveDelta = 0;
          if (s.lastActive !== today) {
            const gap = s.lastActive ? daysBetween(s.lastActive, today) : 999;
            streak = gap === 1 ? s.streak + 1 : 1;
            daysActiveDelta = 1;
          }

          /* ---- nhật ký ngày ---- */
          const history = [...s.history];
          let idx = history.findIndex((h) => h.date === today);
          if (idx === -1) {
            history.push(emptyDay(today));
            idx = history.length - 1;
          }
          const day = { ...history[idx] };
          day.xp += d.xp ?? 0;
          day.drills += d.drills ?? 0;
          day.listens += d.listens ?? 0;
          day.shadowLines += d.shadowLines ?? 0;
          day.scenarios += d.scenarios ?? 0;
          day.reviews += d.reviews ?? 0;
          day.minutes += d.minutes ?? 0;
          if (d.reactionMs && d.reactionMs > 0) {
            const total = day.avgMs * day.msSamples + d.reactionMs;
            day.msSamples += 1;
            day.avgMs = total / day.msSamples;
          }
          history[idx] = day;

          /* ---- tổng luỹ kế ---- */
          const totals: Totals = {
            drills: s.totals.drills + (d.drills ?? 0),
            listens: s.totals.listens + (d.listens ?? 0),
            shadowLines: s.totals.shadowLines + (d.shadowLines ?? 0),
            scenarios: s.totals.scenarios + (d.scenarios ?? 0),
            reviews: s.totals.reviews + (d.reviews ?? 0),
            fastAnswers: s.totals.fastAnswers + (d.fastAnswers ?? 0),
            minutes: s.totals.minutes + (d.minutes ?? 0),
            daysActive: s.totals.daysActive + daysActiveDelta,
          };

          /* ---- nhiệm vụ tuần ---- */
          const wk = weekKey();
          const base = s.week.key === wk ? s.week.totals : { ...EMPTY_TOTALS };
          const week = {
            key: wk,
            totals: {
              drills: base.drills + (d.drills ?? 0),
              listens: base.listens + (d.listens ?? 0),
              shadowLines: base.shadowLines + (d.shadowLines ?? 0),
              scenarios: base.scenarios + (d.scenarios ?? 0),
              reviews: base.reviews + (d.reviews ?? 0),
              fastAnswers: base.fastAnswers + (d.fastAnswers ?? 0),
              minutes: base.minutes + (d.minutes ?? 0),
              daysActive:
                s.week.key === wk ? base.daysActive + daysActiveDelta : daysActiveDelta,
            },
          };

          const xp = s.xp + (d.xp ?? 0);
          const bestReactionMs =
            d.reactionMs && d.reactionMs > 0
              ? s.bestReactionMs === 0
                ? d.reactionMs
                : Math.min(s.bestReactionMs, d.reactionMs)
              : s.bestReactionMs;

          /* ---- huy hiệu ---- */
          const masteredChunks = Object.values(s.srs).filter(isMastered).length;
          const unlocked = ACHIEVEMENTS.filter(
            (a) =>
              !s.achievements.includes(a.id) &&
              a.check({ xp, streak, totals, masteredChunks, bestReactionMs }),
          ).map((a) => a.id);

          return {
            xp,
            streak,
            bestStreak: Math.max(s.bestStreak, streak),
            lastActive: today,
            history: history.slice(-400),
            totals,
            week,
            bestReactionMs,
            achievements: [...s.achievements, ...unlocked],
            newAchievements: [...s.newAchievements, ...unlocked],
          };
        }),

      ensureCards: (ids, kind) =>
        set((s) => {
          const srs = { ...s.srs };
          let changed = false;
          for (const id of ids) {
            if (!srs[id]) {
              srs[id] = newCard(id, kind);
              changed = true;
            }
          }
          return changed ? { srs } : {};
        }),

      grade: (id, kind, g) =>
        set((s) => {
          const existing = s.srs[id] ?? newCard(id, kind);
          return { srs: { ...s.srs, [id]: gradeCard(existing, g) } };
        }),

      markWeak: (id) =>
        set((s) => ({ weakIds: { ...s.weakIds, [id]: (s.weakIds[id] ?? 0) + 1 } })),

      clearWeak: (id) =>
        set((s) => {
          const next = { ...s.weakIds };
          delete next[id];
          return { weakIds: next };
        }),

      setNote: (id, text) =>
        set((s) => {
          const notes = { ...s.notes };
          if (text.trim()) notes[id] = text.trim();
          else delete notes[id];
          return { notes };
        }),

      finishScenario: (id, score) =>
        set((s) => {
          const prev = s.scenarioDone[id] ?? { runs: 0, best: 0 };
          return {
            scenarioDone: {
              ...s.scenarioDone,
              [id]: { runs: prev.runs + 1, best: Math.max(prev.best, score) },
            },
          };
        }),

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      markBackedUp: () => set({ lastBackupAt: Date.now() }),

      setSync: (patch) => set((s) => ({ sync: { ...s.sync, ...patch } })),

      setAi: (patch) => set((s) => ({ ai: { ...s.ai, ...patch } })),

      setNudge: (patch) => set((s) => ({ nudge: { ...s.nudge, ...patch } })),

      hydrate: (next) =>
        set({
          settings: next.settings,
          xp: next.xp,
          streak: next.streak,
          bestStreak: next.bestStreak,
          lastActive: next.lastActive,
          history: next.history,
          totals: next.totals,
          week: next.week,
          srs: next.srs,
          achievements: next.achievements,
          scenarioDone: next.scenarioDone,
          bestReactionMs: next.bestReactionMs,
          weakIds: next.weakIds,
          notes: next.notes,
          lastBackupAt: next.lastBackupAt,
          onboarded: next.onboarded,
          lastSyncAt: Date.now(),
        }),

      dismissAchievements: () => set({ newAchievements: [] }),

      completeOnboarding: () => set({ onboarded: true }),

      resetAll: () =>
        set({
          xp: 0,
          streak: 0,
          bestStreak: 0,
          lastActive: null,
          history: [],
          totals: { ...EMPTY_TOTALS },
          week: { key: weekKey(), totals: { ...EMPTY_TOTALS } },
          srs: {},
          achievements: [],
          newAchievements: [],
          scenarioDone: {},
          bestReactionMs: 0,
          weakIds: {},
          notes: {},
          lastBackupAt: null,
          lastSyncAt: null,
          onboarded: false,
          settings: { ...DEFAULT_SETTINGS, ...get().settings, name: get().settings.name },
        }),
    }),
    {
      name: 'echofluent-v1',
      version: 1,
    },
  ),
);

/* ------------------------------ selector tiện dụng ------------------------------ */

/**
 * Nhật ký hôm nay — trả về đúng phần tử trong mảng, hoặc undefined.
 * Không được tạo object mới ở đây: zustand so sánh bằng tham chiếu, trả về
 * object mới mỗi lần sẽ khiến component render vô hạn.
 */
export const selectTodayLog = (s: StoreState): DayLog | undefined =>
  s.history.find((h) => h.date === todayKey());

/** Giá trị mặc định khi hôm nay chưa học gì — hằng số nên tham chiếu luôn ổn định */
export const BLANK_DAY: DayLog = Object.freeze(emptyDay('')) as DayLog;

export const selectMasteredCount = (s: StoreState): number =>
  Object.values(s.srs).filter(isMastered).length;
