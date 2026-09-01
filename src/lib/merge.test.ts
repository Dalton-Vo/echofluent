import { describe, expect, it } from 'vitest';
import { mergeStates, type PersistedState } from './merge';
import type { DayLog, Settings, SrsCard, Totals } from '@/types';

/* Đây là bộ test quan trọng nhất của tính năng đồng bộ: nếu trộn sai thì người
 * học mất tiến độ thật, và mất im lặng — không có thông báo lỗi nào cả. */

const SETTINGS: Settings = {
  name: 'Thịnh',
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

const ZERO_TOTALS: Totals = {
  drills: 0, listens: 0, shadowLines: 0, scenarios: 0,
  reviews: 0, fastAnswers: 0, minutes: 0, daysActive: 0,
};

function day(date: string, over: Partial<DayLog> = {}): DayLog {
  return {
    date, xp: 0, drills: 0, listens: 0, shadowLines: 0,
    scenarios: 0, reviews: 0, minutes: 0, avgMs: 0, msSamples: 0, ...over,
  };
}

function card(id: string, over: Partial<SrsCard> = {}): SrsCard {
  return {
    id, kind: 'chunk', ease: 2.5, intervalDays: 0,
    due: 1_000_000, reps: 0, lapses: 0, streak: 0, ...over,
  };
}

function state(over: Partial<PersistedState> = {}): PersistedState {
  return {
    settings: SETTINGS,
    xp: 0, streak: 0, bestStreak: 0, lastActive: null,
    history: [], totals: { ...ZERO_TOTALS },
    week: { key: 202601, totals: { ...ZERO_TOTALS } },
    srs: {}, achievements: [], scenarioDone: {},
    bestReactionMs: 0, weakIds: {}, notes: {},
    lastBackupAt: null, onboarded: true,
    ...over,
  };
}

describe('mergeStates — không được mất dữ liệu', () => {
  it('giữ cả hai ngày học khi mỗi máy học một ngày khác nhau', () => {
    const phone = state({ history: [day('2026-03-10', { drills: 12, minutes: 8 })] });
    const laptop = state({ history: [day('2026-03-11', { drills: 5, minutes: 4 })] });
    const m = mergeStates(phone, laptop, true);
    expect(m.history.map((h) => h.date)).toEqual(['2026-03-10', '2026-03-11']);
    expect(m.history[0].drills).toBe(12);
    expect(m.history[1].drills).toBe(5);
  });

  it('cùng một ngày học trên hai máy thì lấy con số lớn hơn từng chỉ số', () => {
    const phone = state({ history: [day('2026-03-10', { drills: 12, listens: 2, minutes: 9 })] });
    const laptop = state({ history: [day('2026-03-10', { drills: 4, listens: 15, minutes: 6 })] });
    const m = mergeStates(phone, laptop, true);
    expect(m.history).toHaveLength(1);
    expect(m.history[0].drills).toBe(12);
    expect(m.history[0].listens).toBe(15);
    expect(m.history[0].minutes).toBe(9);
  });

  it('trung bình phản xạ lấy theo bên đo được nhiều mẫu hơn', () => {
    const few = state({ history: [day('2026-03-10', { avgMs: 900, msSamples: 1 })] });
    const many = state({ history: [day('2026-03-10', { avgMs: 2500, msSamples: 20 })] });
    const m = mergeStates(few, many, true);
    expect(m.history[0].avgMs).toBe(2500);
    expect(m.history[0].msSamples).toBe(20);
  });

  it('XP và các tổng luỹ kế lấy giá trị lớn hơn, không bao giờ tụt', () => {
    const a = state({ xp: 1200, totals: { ...ZERO_TOTALS, drills: 90, listens: 10 } });
    const b = state({ xp: 800, totals: { ...ZERO_TOTALS, drills: 40, listens: 55 } });
    const m = mergeStates(a, b, true);
    expect(m.xp).toBe(1200);
    expect(m.totals.drills).toBe(90);
    expect(m.totals.listens).toBe(55);
  });

  it('chuỗi ngày và kỷ lục chuỗi lấy giá trị lớn hơn', () => {
    const m = mergeStates(state({ streak: 3, bestStreak: 9 }), state({ streak: 7, bestStreak: 5 }), true);
    expect(m.streak).toBe(7);
    expect(m.bestStreak).toBe(9);
  });

  it('kỷ lục phản xạ lấy giá trị NHỎ hơn vì nhanh hơn là tốt hơn', () => {
    expect(mergeStates(state({ bestReactionMs: 2400 }), state({ bestReactionMs: 1100 }), true).bestReactionMs).toBe(1100);
  });

  it('bên chưa có kỷ lục phản xạ (0) không kéo kỷ lục về 0', () => {
    expect(mergeStates(state({ bestReactionMs: 0 }), state({ bestReactionMs: 1500 }), true).bestReactionMs).toBe(1500);
    expect(mergeStates(state({ bestReactionMs: 1500 }), state({ bestReactionMs: 0 }), true).bestReactionMs).toBe(1500);
  });

  it('ngày hoạt động gần nhất lấy ngày muộn hơn', () => {
    expect(mergeStates(state({ lastActive: '2026-03-10' }), state({ lastActive: '2026-03-14' }), true).lastActive).toBe('2026-03-14');
    expect(mergeStates(state({ lastActive: null }), state({ lastActive: '2026-03-14' }), false).lastActive).toBe('2026-03-14');
  });
});

describe('mergeStates — thẻ ôn tập', () => {
  it('giữ thẻ đã ôn nhiều lần hơn', () => {
    const behind = state({ srs: { c001: card('c001', { reps: 2, intervalDays: 3 }) } });
    const ahead = state({ srs: { c001: card('c001', { reps: 9, intervalDays: 40 }) } });
    const m = mergeStates(behind, ahead, true);
    expect(m.srs.c001.reps).toBe(9);
    expect(m.srs.c001.intervalDays).toBe(40);
  });

  it('hoà số lần ôn thì lấy thẻ có hạn ôn xa hơn', () => {
    const a = state({ srs: { c001: card('c001', { reps: 4, due: 5_000 }) } });
    const b = state({ srs: { c001: card('c001', { reps: 4, due: 9_000 }) } });
    expect(mergeStates(a, b, true).srs.c001.due).toBe(9_000);
  });

  it('hợp các thẻ chỉ có ở một bên', () => {
    const a = state({ srs: { c001: card('c001'), c002: card('c002') } });
    const b = state({ srs: { c003: card('c003') } });
    expect(Object.keys(mergeStates(a, b, true).srs).sort()).toEqual(['c001', 'c002', 'c003']);
  });
});

describe('mergeStates — nội dung do người dùng viết', () => {
  it('ghi chú trùng khoá thì bên ghi sau thắng, ghi chú riêng vẫn giữ', () => {
    const local = state({ notes: { c001: 'bản cũ', c002: 'chỉ có ở máy này' } });
    const remote = state({ notes: { c001: 'bản mới', c003: 'chỉ có ở máy kia' } });
    const m = mergeStates(local, remote, true); // remote mới hơn
    expect(m.notes).toEqual({ c001: 'bản mới', c002: 'chỉ có ở máy này', c003: 'chỉ có ở máy kia' });
  });

  it('nếu bản local mới hơn thì ghi chú local thắng', () => {
    const local = state({ notes: { c001: 'bản local' } });
    const remote = state({ notes: { c001: 'bản remote' } });
    expect(mergeStates(local, remote, false).notes.c001).toBe('bản local');
  });

  it('cài đặt lấy theo bên ghi sau', () => {
    const local = state({ settings: { ...SETTINGS, dailyGoalMin: 15 } });
    const remote = state({ settings: { ...SETTINGS, dailyGoalMin: 40 } });
    expect(mergeStates(local, remote, true).settings.dailyGoalMin).toBe(40);
    expect(mergeStates(local, remote, false).settings.dailyGoalMin).toBe(15);
  });
});

describe('mergeStates — danh sách và bộ đếm', () => {
  it('hợp huy hiệu, không trùng lặp', () => {
    const m = mergeStates(
      state({ achievements: ['a-first', 'a-streak3'] }),
      state({ achievements: ['a-streak3', 'a-ear'] }),
      true,
    );
    expect(m.achievements.sort()).toEqual(['a-ear', 'a-first', 'a-streak3']);
  });

  it('tình huống lấy số lần diễn và điểm cao nhất của cả hai', () => {
    const m = mergeStates(
      state({ scenarioDone: { s01: { runs: 3, best: 55 } } }),
      state({ scenarioDone: { s01: { runs: 1, best: 80 }, s02: { runs: 2, best: 60 } } }),
      true,
    );
    expect(m.scenarioDone.s01).toEqual({ runs: 3, best: 80 });
    expect(m.scenarioDone.s02).toEqual({ runs: 2, best: 60 });
  });

  it('số lần hụt lấy giá trị lớn hơn', () => {
    const m = mergeStates(state({ weakIds: { r001: 3 } }), state({ weakIds: { r001: 1, r002: 5 } }), true);
    expect(m.weakIds).toEqual({ r001: 3, r002: 5 });
  });

  it('onboarded chỉ cần một bên đã xong là xong', () => {
    expect(mergeStates(state({ onboarded: false }), state({ onboarded: true }), true).onboarded).toBe(true);
  });
});

describe('mergeStates — thống kê tuần', () => {
  it('cùng tuần thì cộng gộp bằng cách lấy giá trị lớn hơn', () => {
    const m = mergeStates(
      state({ week: { key: 202610, totals: { ...ZERO_TOTALS, drills: 20 } } }),
      state({ week: { key: 202610, totals: { ...ZERO_TOTALS, drills: 12, listens: 8 } } }),
      true,
    );
    expect(m.week.key).toBe(202610);
    expect(m.week.totals.drills).toBe(20);
    expect(m.week.totals.listens).toBe(8);
  });

  it('khác tuần thì lấy tuần gần đây hơn, không trộn lẫn', () => {
    const m = mergeStates(
      state({ week: { key: 202610, totals: { ...ZERO_TOTALS, drills: 99 } } }),
      state({ week: { key: 202611, totals: { ...ZERO_TOTALS, drills: 3 } } }),
      true,
    );
    expect(m.week.key).toBe(202611);
    expect(m.week.totals.drills).toBe(3);
  });
});

describe('mergeStates — tính ổn định', () => {
  const a = state({
    xp: 500, streak: 4, bestReactionMs: 1800,
    history: [day('2026-03-10', { drills: 10 })],
    srs: { c001: card('c001', { reps: 3 }) },
    achievements: ['a-first'],
    notes: { c001: 'ghi chú A' },
    totals: { ...ZERO_TOTALS, drills: 30 },
  });
  const b = state({
    xp: 300, streak: 6, bestReactionMs: 2500,
    history: [day('2026-03-11', { drills: 7 })],
    srs: { c002: card('c002', { reps: 1 }) },
    achievements: ['a-streak3'],
    notes: { c002: 'ghi chú B' },
    totals: { ...ZERO_TOTALS, drills: 12, listens: 9 },
  });

  it('đổi thứ tự hai bên vẫn ra cùng kết quả', () => {
    const ab = mergeStates(a, b, true);
    const ba = mergeStates(b, a, false);
    expect({ ...ab, achievements: [...ab.achievements].sort() }).toEqual({
      ...ba,
      achievements: [...ba.achievements].sort(),
    });
  });

  it('trộn lại nhiều lần không làm dữ liệu đổi thêm', () => {
    const once = mergeStates(a, b, true);
    const twice = mergeStates(once, b, true);
    const thrice = mergeStates(twice, b, true);
    expect(twice).toEqual(once);
    expect(thrice).toEqual(once);
  });

  it('trộn với chính mình thì không đổi gì', () => {
    expect(mergeStates(a, a, true)).toEqual(a);
  });

  it('chịu được dữ liệu thiếu trường mà không nổ', () => {
    const broken = { onboarded: true } as unknown as PersistedState;
    const m = mergeStates(a, broken, false);
    expect(m.xp).toBe(500);
    expect(m.history).toHaveLength(1);
    expect(m.srs.c001.reps).toBe(3);
  });
});
