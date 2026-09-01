import { describe, expect, it } from 'vitest';
import {
  clamp,
  cn,
  dateFromKey,
  daysBetween,
  formatMinutes,
  formatMs,
  gradientFor,
  sample,
  todayKey,
  weekKey,
} from './utils';

describe('todayKey', () => {
  it('dùng giờ địa phương, không bị lệch ngày như toISOString', () => {
    // 23:30 giờ địa phương ngày 5/3 — toISOString ở múi giờ VN sẽ ra ngày 5 hoặc 6
    const late = new Date(2026, 2, 5, 23, 30);
    expect(todayKey(late)).toBe('2026-03-05');
  });

  it('đệm số 0 cho tháng và ngày một chữ số', () => {
    expect(todayKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });

  it('đi vòng qua dateFromKey thì không đổi', () => {
    const key = '2026-11-30';
    expect(todayKey(dateFromKey(key))).toBe(key);
  });
});

describe('daysBetween', () => {
  it('đếm đúng số ngày', () => {
    expect(daysBetween('2026-03-01', '2026-03-02')).toBe(1);
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0);
  });

  it('đúng cả khi bắc qua ranh giới tháng', () => {
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
  });

  it('đúng cả khi bắc qua ranh giới năm', () => {
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
  });

  it('đúng qua mốc đổi giờ mùa hè (không ra 0 hay 2)', () => {
    expect(daysBetween('2026-03-28', '2026-03-29')).toBe(1);
    expect(daysBetween('2026-10-24', '2026-10-25')).toBe(1);
  });
});

describe('weekKey', () => {
  it('hai ngày cách nhau 1 ngày thường cùng tuần', () => {
    expect(weekKey(new Date(2026, 4, 12))).toBe(weekKey(new Date(2026, 4, 13)));
  });

  it('cách nhau 10 ngày thì khác tuần', () => {
    expect(weekKey(new Date(2026, 4, 1))).not.toBe(weekKey(new Date(2026, 4, 11)));
  });
});

describe('formatMinutes / formatMs', () => {
  it('hiển thị phút và giờ đúng tiếng Việt', () => {
    expect(formatMinutes(45)).toBe('45 phút');
    expect(formatMinutes(60)).toBe('1 giờ');
    expect(formatMinutes(95)).toBe('1 giờ 35 phút');
  });

  it('formatMs trả dấu gạch khi chưa có dữ liệu', () => {
    expect(formatMs(0)).toBe('—');
    expect(formatMs(Number.NaN)).toBe('—');
    expect(formatMs(2500)).toBe('2.5s');
  });
});

describe('gradientFor', () => {
  it('cùng seed cho cùng màu', () => {
    expect(gradientFor('s01Daily standup')).toBe(gradientFor('s01Daily standup'));
  });

  it('các seed gần nhau vẫn ra màu khác hẳn nhau', () => {
    const hues = ['s01', 's02', 's03', 's04', 's05', 's06'].map((id) => {
      const m = gradientFor(id).match(/hsl\((\d+)/);
      return Number(m![1]);
    });
    expect(new Set(hues).size).toBe(hues.length);
    // không được dồn cục trong một dải hẹp
    expect(Math.max(...hues) - Math.min(...hues)).toBeGreaterThan(90);
  });

  it('luôn tạo ra chuỗi CSS hợp lệ', () => {
    expect(gradientFor('bất kỳ')).toMatch(/^linear-gradient\(135deg, hsl\(\d+ \d+% \d+%\), hsl\(\d+ \d+% \d+%\)\)$/);
  });
});

describe('sample', () => {
  it('không bao giờ trả nhiều hơn số phần tử có', () => {
    expect(sample([1, 2, 3], 10)).toHaveLength(3);
  });

  it('không trả phần tử trùng lặp', () => {
    const out = sample([1, 2, 3, 4, 5, 6, 7, 8], 5);
    expect(new Set(out).size).toBe(out.length);
  });

  it('trả mảng rỗng khi nguồn rỗng', () => {
    expect(sample([], 3)).toEqual([]);
  });
});

describe('cn / clamp', () => {
  it('cn bỏ qua giá trị rỗng', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('clamp giới hạn hai đầu', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-5, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
});
