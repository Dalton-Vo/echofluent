import { describe, expect, it } from 'vitest';
import { describeInterval, dueCards, gradeCard, isDue, isMastered, newCard } from './srs';
import type { SrsCard } from '@/types';

const DAY = 86_400_000;

describe('newCard', () => {
  it('tạo thẻ tới hạn ngay lập tức', () => {
    const c = newCard('c001', 'chunk');
    expect(isDue(c)).toBe(true);
    expect(c.reps).toBe(0);
    expect(c.intervalDays).toBe(0);
  });
});

describe('gradeCard', () => {
  it('“Quên” đẩy thẻ về gặp lại trong vài phút và hạ độ dễ', () => {
    const c = { ...newCard('x', 'chunk'), ease: 2.5, intervalDays: 10, streak: 4 };
    const next = gradeCard(c, 'again');
    expect(next.intervalDays).toBe(0);
    expect(next.streak).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.ease).toBeLessThan(c.ease);
    expect(next.due - Date.now()).toBeLessThan(10 * 60 * 1000);
  });

  it('chuỗi “Được” làm khoảng cách giãn dần', () => {
    let c = newCard('x', 'chunk');
    const intervals: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      c = gradeCard(c, 'good');
      intervals.push(c.intervalDays);
    }
    for (let i = 1; i < intervals.length; i += 1) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });

  it('“Dễ” luôn cho khoảng cách xa hơn “Được”, và “Được” xa hơn “Khó”', () => {
    const base = { ...newCard('x', 'chunk'), intervalDays: 10, streak: 3, reps: 3 };
    const hard = gradeCard(base, 'hard').intervalDays;
    const good = gradeCard(base, 'good').intervalDays;
    const easy = gradeCard(base, 'easy').intervalDays;
    expect(hard).toBeLessThan(good);
    expect(good).toBeLessThan(easy);
  });

  it('độ dễ không bao giờ tụt dưới 1.3 dù quên liên tục', () => {
    let c = newCard('x', 'chunk');
    for (let i = 0; i < 30; i += 1) c = gradeCard(c, 'again');
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });

  it('khoảng cách bị chặn trên ở 365 ngày', () => {
    let c = { ...newCard('x', 'chunk'), intervalDays: 300, streak: 9, ease: 3.2, reps: 9 };
    for (let i = 0; i < 10; i += 1) c = gradeCard(c, 'easy');
    expect(c.intervalDays).toBeLessThanOrEqual(365);
  });

  it('ngày tới hạn luôn khớp với khoảng cách vừa tính', () => {
    const c = gradeCard({ ...newCard('x', 'chunk'), streak: 2, intervalDays: 3, reps: 2 }, 'good');
    const expected = Date.now() + c.intervalDays * DAY;
    expect(Math.abs(c.due - expected)).toBeLessThan(2000);
  });
});

describe('isMastered', () => {
  it('coi là đã thuộc khi khoảng cách đạt 21 ngày', () => {
    expect(isMastered({ ...newCard('x', 'chunk'), intervalDays: 21 })).toBe(true);
    expect(isMastered({ ...newCard('x', 'chunk'), intervalDays: 20 })).toBe(false);
  });

  it('một thẻ mới không bao giờ được coi là đã thuộc', () => {
    expect(isMastered(newCard('x', 'chunk'))).toBe(false);
  });
});

describe('dueCards', () => {
  it('chỉ trả thẻ tới hạn, sắp theo thẻ quá hạn lâu nhất trước', () => {
    const now = Date.now();
    const cards: Record<string, SrsCard> = {
      late: { ...newCard('late', 'chunk'), due: now - 5 * DAY },
      soon: { ...newCard('soon', 'chunk'), due: now - 1000 },
      future: { ...newCard('future', 'chunk'), due: now + 3 * DAY },
    };
    const due = dueCards(cards, now);
    expect(due.map((c) => c.id)).toEqual(['late', 'soon']);
  });

  it('trả mảng rỗng khi chưa có thẻ nào', () => {
    expect(dueCards({})).toEqual([]);
  });
});

describe('describeInterval', () => {
  it('diễn đạt bằng tiếng Việt dễ đọc', () => {
    expect(describeInterval(0)).toBe('vài phút');
    expect(describeInterval(1)).toBe('1 ngày');
    expect(describeInterval(10)).toBe('10 ngày');
    expect(describeInterval(30)).toBe('1 tháng');
    expect(describeInterval(90)).toBe('3 tháng');
  });
});
