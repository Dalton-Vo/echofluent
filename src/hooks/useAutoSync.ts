import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { syncNow } from '@/lib/sync';

/* ============================================================================
 *  Tự đồng bộ vào đúng hai thời điểm có ý nghĩa:
 *    - lúc mở app  → kéo về những gì máy kia đã học
 *    - lúc rời app → đẩy lên những gì vừa học ở máy này
 *
 *  Cố tình KHÔNG đồng bộ sau mỗi thao tác: vừa tốn mạng, vừa dễ tạo vòng lặp
 *  (đồng bộ ghi vào store → store đổi → lại đồng bộ). Hai mốc trên là đủ, vì
 *  cách dùng thật luôn là học xong ở máy này rồi mới mở máy kia.
 * ========================================================================== */

export function useAutoSync() {
  const url = useStore((s) => s.sync.url);
  const secret = useStore((s) => s.sync.secret);
  const running = useRef(false);

  const enabled = Boolean(url.trim() && secret.trim());

  useEffect(() => {
    if (!enabled) return;

    const run = () => {
      if (running.current) return;
      running.current = true;
      void syncNow().finally(() => {
        running.current = false;
      });
    };

    run(); // lúc mở app

    const onHidden = () => {
      if (document.visibilityState === 'hidden') run();
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', run);

    /* Đẩy định kỳ khi app đang mở.
     *
     * Hai mốc mở/rời app chỉ đủ khi app được đóng tử tế. Thực tế hay gặp:
     * trình duyệt bị hệ điều hành thu hồi bộ nhớ, máy sập nguồn, hoặc tab bị
     * đóng bằng cách kill tiến trình — cả ba đều không bắn `pagehide`. Học
     * xong một buổi rồi mất trắng vì mấy chuyện đó thì người dùng bỏ app
     * ngay, nên cứ mười lăm phút đẩy một lần cho chắc.
     *
     * Chỉ chạy khi tab đang hiện: nền bị bóp cổ hẹn giờ nên hẹn cũng không
     * đúng nhịp, mà lúc đó cũng chẳng có gì mới để đẩy. */
    const timer = window.setInterval(
      () => {
        if (document.visibilityState === 'visible') run();
      },
      15 * 60_000,
    );

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', run);
    };
  }, [enabled, url, secret]);
}
