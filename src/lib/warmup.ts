/* ============================================================================
 *  CHẾ ĐỘ LÀM QUEN
 *
 *  Một giai đoạn có hạn, không phải một công tắc bật rồi quên. Lý do có nó:
 *  bài luyện phản xạ đòi bật ra câu trả lời từ con số không, và khi đang đuối
 *  thì đó là bức tường chứ không phải bậc thang — ngồi im 4 phút rồi được chấm
 *  24/100 không dạy được gì ngoài cảm giác mình kém.
 *
 *  Trong giai đoạn này, câu mẫu hiện ra TRƯỚC khi nói. Bài đổi từ "nhớ lại" sang
 *  "nhại theo": vẫn câu đó, vẫn nội dung đó, chỉ khác chỗ dựa.
 *
 *  Có hạn ngày vì đây là đường dốc dẫn trở lại, không phải chỗ ở lâu dài. Hết
 *  hạn thì app hỏi thẳng một câu, chứ không lặng lẽ tự tắt.
 * ========================================================================== */

export const WARMUP_DAYS = 14;

const DAY_MS = 86_400_000;

/** Mốc kết thúc cho một giai đoạn bắt đầu từ `now` */
export function startWarmup(now: number = Date.now(), days: number = WARMUP_DAYS): number {
  return now + days * DAY_MS;
}

/**
 * Đang trong giai đoạn làm quen.
 *
 * Nhận cả `undefined` chứ không chỉ `null`, và đó là chuyện bắt buộc chứ không
 * phải phòng xa: zustand `persist` trộn NÔNG ở cấp cao nhất, nên object
 * `settings` đọc từ localStorage thay nguyên chỗ giá trị mặc định. Máy nào đã
 * chạy bản cũ thì sau khi cập nhật sẽ có `settings.warmupUntil === undefined`,
 * và mọi trường mới thêm vào `Settings` về sau cũng vậy.
 */
export function isWarmupOn(until: number | null | undefined, now: number = Date.now()): boolean {
  return typeof until === 'number' && until > now;
}

/**
 * Đã bật nhưng đã hết hạn — lúc cần hỏi "quay lại đường đua chưa?".
 *
 * Cố tình KHÔNG tự xoá mốc khi hết hạn: còn mốc thì còn biết mà hỏi. Người dùng
 * trả lời xong (quay lại hoặc gia hạn) thì mốc mới được đặt lại.
 */
export function isWarmupOver(until: number | null | undefined, now: number = Date.now()): boolean {
  return typeof until === 'number' && until <= now;
}

/** Số ngày còn lại, làm tròn lên. Hết hạn hoặc chưa bật thì 0. */
export function warmupDaysLeft(until: number | null | undefined, now: number = Date.now()): number {
  if (!isWarmupOn(until, now)) return 0;
  return Math.ceil(((until as number) - now) / DAY_MS);
}
