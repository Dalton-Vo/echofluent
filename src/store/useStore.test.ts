import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useStore, selectTodayLog, selectMasteredCount, BLANK_DAY } from './useStore';
import { todayKey } from '@/lib/utils';

/* ============================================================================
 *  Store là nơi giữ toàn bộ động lực học: chuỗi ngày, XP, huy hiệu.
 *  Tính sai chuỗi ngày là làm hỏng đúng thứ giữ người học quay lại.
 * ========================================================================== */

function reset() {
  useStore.getState().resetAll();
  useStore.setState({ onboarded: false, newAchievements: [] });
}

function setToday(y: number, m: number, d: number) {
  vi.setSystemTime(new Date(y, m - 1, d, 10, 0, 0));
}

describe('store — nhật ký và tổng luỹ kế', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('ghi nhận hoạt động vào đúng ngày hôm nay', () => {
    useStore.getState().log({ drills: 3, xp: 30, minutes: 2 });
    const day = selectTodayLog(useStore.getState());
    expect(day?.date).toBe(todayKey());
    expect(day?.drills).toBe(3);
    expect(day?.xp).toBe(30);
    expect(useStore.getState().xp).toBe(30);
    expect(useStore.getState().totals.drills).toBe(3);
  });

  it('cộng dồn nhiều lần ghi trong cùng một ngày vào một bản ghi duy nhất', () => {
    const { log } = useStore.getState();
    log({ drills: 1, xp: 10 });
    log({ drills: 1, xp: 10 });
    log({ listens: 2, xp: 5 });
    expect(useStore.getState().history).toHaveLength(1);
    const day = selectTodayLog(useStore.getState());
    expect(day?.drills).toBe(2);
    expect(day?.listens).toBe(2);
    expect(day?.xp).toBe(25);
  });

  it('selectTodayLog trả undefined khi hôm nay chưa học gì, và BLANK_DAY là số 0', () => {
    expect(selectTodayLog(useStore.getState())).toBeUndefined();
    expect(BLANK_DAY.minutes).toBe(0);
    expect(BLANK_DAY.drills).toBe(0);
  });

  it('BLANK_DAY được đóng băng để không ai lỡ tay sửa vào hằng số dùng chung', () => {
    expect(Object.isFrozen(BLANK_DAY)).toBe(true);
  });
});

describe('store — chuỗi ngày', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('ngày đầu tiên bắt đầu chuỗi bằng 1', () => {
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().streak).toBe(1);
  });

  it('học thêm trong cùng ngày không làm chuỗi tăng lên', () => {
    const { log } = useStore.getState();
    log({ drills: 1, xp: 5 });
    log({ drills: 1, xp: 5 });
    log({ drills: 1, xp: 5 });
    expect(useStore.getState().streak).toBe(1);
    expect(useStore.getState().totals.daysActive).toBe(1);
  });

  it('học ngày kế tiếp làm chuỗi tăng lên 2', () => {
    useStore.getState().log({ drills: 1, xp: 5 });
    setToday(2026, 3, 11);
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().streak).toBe(2);
    expect(useStore.getState().totals.daysActive).toBe(2);
  });

  it('nghỉ một ngày là chuỗi về lại 1', () => {
    useStore.getState().log({ drills: 1, xp: 5 });
    setToday(2026, 3, 11);
    useStore.getState().log({ drills: 1, xp: 5 });
    setToday(2026, 3, 13); // bỏ ngày 12
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().streak).toBe(1);
  });

  it('chuỗi chạy đúng khi bắc qua cuối tháng', () => {
    setToday(2026, 3, 31);
    useStore.getState().log({ drills: 1, xp: 5 });
    setToday(2026, 4, 1);
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().streak).toBe(2);
  });

  it('ghi nhớ kỷ lục chuỗi dài nhất kể cả sau khi bị đứt', () => {
    for (let d = 10; d <= 14; d += 1) {
      setToday(2026, 3, d);
      useStore.getState().log({ drills: 1, xp: 5 });
    }
    expect(useStore.getState().streak).toBe(5);
    setToday(2026, 3, 20);
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().streak).toBe(1);
    expect(useStore.getState().bestStreak).toBe(5);
  });
});

describe('store — tốc độ phản xạ', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('tính trung bình cộng dồn đúng qua nhiều lần ghi', () => {
    const { log } = useStore.getState();
    log({ drills: 1, reactionMs: 2000 });
    log({ drills: 1, reactionMs: 4000 });
    const day = selectTodayLog(useStore.getState());
    expect(day?.avgMs).toBe(3000);
    expect(day?.msSamples).toBe(2);
  });

  it('giữ kỷ lục nhanh nhất, không bị lần chậm sau ghi đè', () => {
    const { log } = useStore.getState();
    log({ drills: 1, reactionMs: 2500 });
    log({ drills: 1, reactionMs: 1200 });
    log({ drills: 1, reactionMs: 5000 });
    expect(useStore.getState().bestReactionMs).toBe(1200);
  });

  it('bỏ qua lần ghi không có thời gian phản xạ (ví dụ khi bỏ qua câu)', () => {
    const { log } = useStore.getState();
    log({ drills: 1, reactionMs: 2000 });
    log({ drills: 1, reactionMs: 0 });
    const day = selectTodayLog(useStore.getState());
    expect(day?.msSamples).toBe(1);
    expect(useStore.getState().bestReactionMs).toBe(2000);
  });
});

describe('store — nhiệm vụ tuần', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('cộng dồn trong tuần', () => {
    const { log } = useStore.getState();
    log({ drills: 5 });
    log({ drills: 5 });
    expect(useStore.getState().week.totals.drills).toBe(10);
  });

  it('tự đặt lại về 0 khi sang tuần mới', () => {
    useStore.getState().log({ drills: 10 });
    expect(useStore.getState().week.totals.drills).toBe(10);
    setToday(2026, 4, 20); // hơn một tháng sau, chắc chắn khác tuần
    useStore.getState().log({ drills: 2 });
    expect(useStore.getState().week.totals.drills).toBe(2);
  });
});

describe('store — thẻ ôn tập', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('tạo thẻ mới nhưng không ghi đè thẻ đã có tiến độ', () => {
    const { ensureCards, grade } = useStore.getState();
    ensureCards(['c001', 'c002'], 'chunk');
    grade('c001', 'chunk', 'easy');
    const before = useStore.getState().srs.c001.intervalDays;
    expect(before).toBeGreaterThan(0);

    useStore.getState().ensureCards(['c001', 'c003'], 'chunk');
    expect(useStore.getState().srs.c001.intervalDays).toBe(before);
    expect(useStore.getState().srs.c003).toBeDefined();
  });

  it('đếm được số cụm đã thuộc', () => {
    const { ensureCards } = useStore.getState();
    ensureCards(['c001'], 'chunk');
    expect(selectMasteredCount(useStore.getState())).toBe(0);
    for (let i = 0; i < 8; i += 1) useStore.getState().grade('c001', 'chunk', 'easy');
    expect(selectMasteredCount(useStore.getState())).toBe(1);
  });

  it('chấm điểm một thẻ chưa tồn tại thì tự tạo thẻ đó', () => {
    useStore.getState().grade('c099', 'chunk', 'good');
    expect(useStore.getState().srs.c099).toBeDefined();
    expect(useStore.getState().srs.c099.reps).toBe(1);
  });
});

describe('store — điểm yếu và tình huống', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('đếm số lần hụt và xoá được khi đã nắm lại', () => {
    const { markWeak, clearWeak } = useStore.getState();
    markWeak('r001');
    markWeak('r001');
    expect(useStore.getState().weakIds.r001).toBe(2);
    clearWeak('r001');
    expect(useStore.getState().weakIds.r001).toBeUndefined();
  });

  it('giữ điểm cao nhất của mỗi tình huống qua nhiều lần diễn', () => {
    const { finishScenario } = useStore.getState();
    finishScenario('s01', 60);
    finishScenario('s01', 45);
    expect(useStore.getState().scenarioDone.s01).toEqual({ runs: 2, best: 60 });
  });
});

describe('store — ghi chú cá nhân', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('lưu và sửa được ghi chú cho từng cụm', () => {
    const { setNote } = useStore.getState();
    setNote('c001', 'Dùng khi sếp hỏi estimate mà mình chưa kịp tính');
    expect(useStore.getState().notes.c001).toBe(
      'Dùng khi sếp hỏi estimate mà mình chưa kịp tính',
    );
    useStore.getState().setNote('c001', 'Nhớ vụ họp với Marcus');
    expect(useStore.getState().notes.c001).toBe('Nhớ vụ họp với Marcus');
  });

  it('cắt khoảng trắng thừa và xoá hẳn ghi chú khi để trống', () => {
    const { setNote } = useStore.getState();
    setNote('c002', '   có khoảng trắng hai đầu   ');
    expect(useStore.getState().notes.c002).toBe('có khoảng trắng hai đầu');
    useStore.getState().setNote('c002', '    ');
    expect(useStore.getState().notes.c002).toBeUndefined();
  });

  it('ghi chú của cụm này không đè lên cụm khác', () => {
    const { setNote } = useStore.getState();
    setNote('c001', 'ghi chú A');
    setNote('c002', 'ghi chú B');
    expect(useStore.getState().notes).toEqual({ c001: 'ghi chú A', c002: 'ghi chú B' });
  });

  it('xoá toàn bộ tiến độ thì ghi chú cũng bị xoá theo', () => {
    useStore.getState().setNote('c001', 'ghi chú');
    useStore.getState().resetAll();
    expect(useStore.getState().notes).toEqual({});
  });
});

describe('store — huy hiệu', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('mở khoá huy hiệu đầu tiên ngay sau bài đầu tiên', () => {
    useStore.getState().log({ drills: 1, xp: 10 });
    expect(useStore.getState().achievements).toContain('a-first');
    expect(useStore.getState().newAchievements).toContain('a-first');
  });

  it('không mở khoá lại huy hiệu đã có', () => {
    const { log } = useStore.getState();
    log({ drills: 1, xp: 10 });
    useStore.getState().dismissAchievements();
    log({ drills: 1, xp: 10 });
    const count = useStore.getState().achievements.filter((a) => a === 'a-first').length;
    expect(count).toBe(1);
    expect(useStore.getState().newAchievements).not.toContain('a-first');
  });

  it('mở khoá huy hiệu chuỗi 3 ngày đúng vào ngày thứ ba', () => {
    setToday(2026, 3, 10);
    useStore.getState().log({ drills: 1, xp: 5 });
    setToday(2026, 3, 11);
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().achievements).not.toContain('a-streak3');
    setToday(2026, 3, 12);
    useStore.getState().log({ drills: 1, xp: 5 });
    expect(useStore.getState().achievements).toContain('a-streak3');
  });
});

describe('store — cài đặt và xoá dữ liệu', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setToday(2026, 3, 10);
    reset();
  });
  afterEach(() => vi.useRealTimers());

  it('cập nhật một phần cài đặt không làm mất phần còn lại', () => {
    useStore.getState().setSettings({ name: 'Thịnh' });
    useStore.getState().setSettings({ rate: 1.2 });
    expect(useStore.getState().settings.name).toBe('Thịnh');
    expect(useStore.getState().settings.rate).toBe(1.2);
    expect(useStore.getState().settings.dailyGoalMin).toBe(15);
  });

  it('xoá toàn bộ tiến độ nhưng giữ lại tên người dùng', () => {
    useStore.getState().setSettings({ name: 'Thịnh' });
    useStore.getState().log({ drills: 5, xp: 100 });
    useStore.getState().resetAll();
    expect(useStore.getState().xp).toBe(0);
    expect(useStore.getState().streak).toBe(0);
    expect(useStore.getState().history).toEqual([]);
    expect(useStore.getState().settings.name).toBe('Thịnh');
  });
});
