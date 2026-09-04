import type { Level } from '@/types';

/* ============================================================================
 *  Tầm trình độ
 *
 *  Tách ra một chỗ vì trước đây mỗi màn tự viết lại phép so sánh này, và hai
 *  trong số đó viết sai theo cùng một kiểu: `indexOf(level) + 1`. Cái `+1` biến
 *  ô "Trình độ hiện tại: B1" thành lời nói dối — người học vẫn bị hỏi câu B2 và
 *  tưởng là mình kém. Ba màn còn lại thì quên lọc hẳn, đẩy cả C1 cho người mới.
 *
 *  Một hàm, một ý nghĩa: chọn trình độ nào thì nhận tới đúng trình độ đó.
 * ========================================================================== */

export const LEVEL_ORDER: readonly Level[] = ['A2', 'B1', 'B2', 'C1'] as const;

/** Bài `item` có nằm trong tầm của người đang đặt trình độ `max` không */
export function withinLevel(item: Level, max: Level): boolean {
  return LEVEL_ORDER.indexOf(item) <= LEVEL_ORDER.indexOf(max);
}

/** Lọc một danh sách bất kỳ có mang trường `level` */
export function atOrBelow<T extends { level: Level }>(items: readonly T[], max: Level): T[] {
  return items.filter((x) => withinLevel(x.level, max));
}
