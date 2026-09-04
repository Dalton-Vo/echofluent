import { describe, expect, it } from 'vitest';
import {
  WARMUP_DAYS,
  isWarmupOn,
  isWarmupOver,
  startWarmup,
  warmupDaysLeft,
} from './warmup';
import { atOrBelow, withinLevel } from './level';

const NOW = Date.UTC(2026, 8, 4, 12, 0, 0);
const DAY = 86_400_000;

describe('Chế độ làm quen', () => {
  it('chưa bao giờ bật thì coi như tắt', () => {
    expect(isWarmupOn(null, NOW)).toBe(false);
    expect(isWarmupOver(null, NOW)).toBe(false);
    expect(warmupDaysLeft(null, NOW)).toBe(0);
  });

  it('máy đã có dữ liệu cũ (undefined) cũng coi như tắt, không nổ', () => {
    /* Đường nâng cấp thật: zustand persist trộn nông, nên object `settings`
     * lưu từ bản cũ thay nguyên chỗ mặc định và trường mới thành undefined.
     * Không chịu được undefined là app trắng màn hình ngay lần mở đầu tiên
     * sau khi cập nhật — với đúng những người đã dùng lâu nhất. */
    const cu = undefined as unknown as number | null;
    expect(isWarmupOn(cu, NOW)).toBe(false);
    expect(isWarmupOver(cu, NOW)).toBe(false);
    expect(warmupDaysLeft(cu, NOW)).toBe(0);
  });

  it('bật lên thì chạy đúng 14 ngày', () => {
    const until = startWarmup(NOW);
    expect(until - NOW).toBe(WARMUP_DAYS * DAY);
    expect(isWarmupOn(until, NOW)).toBe(true);
    expect(warmupDaysLeft(until, NOW)).toBe(WARMUP_DAYS);
  });

  it('hết hạn thì tắt, và báo là đã hết để còn hỏi người dùng', () => {
    const until = startWarmup(NOW);
    const sau = until + 1000;
    expect(isWarmupOn(until, sau)).toBe(false);
    expect(isWarmupOver(until, sau)).toBe(true);
    expect(warmupDaysLeft(until, sau)).toBe(0);
  });

  it('đúng khoảnh khắc hết hạn đã tính là hết, không còn lấp lửng', () => {
    const until = startWarmup(NOW);
    expect(isWarmupOn(until, until)).toBe(false);
    expect(isWarmupOver(until, until)).toBe(true);
  });

  it('đang bật thì không đồng thời là đã hết — hai trạng thái loại trừ nhau', () => {
    const until = startWarmup(NOW);
    for (const t of [NOW, NOW + DAY, until - 1, until, until + DAY]) {
      expect(isWarmupOn(until, t) && isWarmupOver(until, t)).toBe(false);
    }
  });

  it('đếm ngày lùi dần từng ngày một', () => {
    const until = startWarmup(NOW);
    expect(warmupDaysLeft(until, NOW + DAY)).toBe(13);
    expect(warmupDaysLeft(until, NOW + 13 * DAY)).toBe(1);
    expect(warmupDaysLeft(until, NOW + 13.5 * DAY)).toBe(1);
  });

  it('còn nửa ngày vẫn hiện là 1 ngày, không hiện 0 khi vẫn đang bật', () => {
    // Hiện "còn 0 ngày" trong khi chế độ vẫn chạy là tự mâu thuẫn.
    const until = NOW + DAY / 2;
    expect(isWarmupOn(until, NOW)).toBe(true);
    expect(warmupDaysLeft(until, NOW)).toBeGreaterThanOrEqual(1);
  });

  it('gia hạn tính từ lúc bấm, không cộng dồn vào mốc cũ đã hết', () => {
    const cu = startWarmup(NOW);
    const tre = cu + 5 * DAY;
    expect(startWarmup(tre) - tre).toBe(WARMUP_DAYS * DAY);
  });
});

describe('Tầm trình độ', () => {
  it('nhận tới đúng trình độ đang đặt, không nhận cao hơn', () => {
    // Đây là con bug thật: `indexOf(level) + 1` khiến người đặt B1 bị hỏi B2.
    expect(withinLevel('B2', 'B1')).toBe(false);
    expect(withinLevel('C1', 'B1')).toBe(false);
    expect(withinLevel('B1', 'B1')).toBe(true);
    expect(withinLevel('A2', 'B1')).toBe(true);
  });

  it('đặt C1 thì nhận hết', () => {
    for (const l of ['A2', 'B1', 'B2', 'C1'] as const) {
      expect(withinLevel(l, 'C1')).toBe(true);
    }
  });

  it('đặt A2 thì chỉ còn A2', () => {
    expect(atOrBelow([{ level: 'A2' }, { level: 'B1' }, { level: 'C1' }] as const, 'A2')).toEqual([
      { level: 'A2' },
    ]);
  });
});
