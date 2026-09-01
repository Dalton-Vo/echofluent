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

    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', run);
    };
  }, [enabled, url, secret]);
}
