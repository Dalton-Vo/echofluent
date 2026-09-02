import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';

/* ============================================================================
 *  Nhắc luyện định kỳ
 * ============================================================================
 *
 *  Cứ vài phút lại ném ra một câu bắt trả lời ngay. Lý do làm tính năng này:
 *  ngồi học 30 phút liền một lúc thua xa việc bị hỏi bất chợt 6 lần trong ngày.
 *  Phản xạ chỉ hình thành khi câu hỏi tới lúc mình KHÔNG chuẩn bị gì — đó đúng
 *  là tình huống trong cuộc họp thật.
 *
 *  Giới hạn cần biết trước, để khỏi tưởng là lỗi:
 *  Trình duyệt chỉ chạy hẹn giờ khi trang còn mở. Đóng hẳn app thì không có gì
 *  nhắc cả. Nhưng app này cài được ra một cửa sổ riêng trên macOS, cứ để nó
 *  chạy nền là thông báo vẫn nổi lên như ứng dụng thường.
 * ========================================================================== */

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function notifySupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function currentNotifyPermission(): NotifyPermission {
  if (!notifySupported()) return 'unsupported';
  return Notification.permission as NotifyPermission;
}

/** Xin quyền hiện thông báo. Phải gọi từ một cú bấm thật của người dùng. */
export async function askNotifyPermission(): Promise<NotifyPermission> {
  if (!notifySupported()) return 'unsupported';
  try {
    return (await Notification.requestPermission()) as NotifyPermission;
  } catch {
    return 'denied';
  }
}

export interface NudgeState {
  /** Còn bao nhiêu mili-giây tới lần nhắc kế tiếp */
  left: number;
  /** Đang có câu hỏi chờ trả lời */
  due: boolean;
}

/**
 * Đồng hồ nhắc luyện.
 *
 * Đếm theo mốc thời gian thật (`Date.now()`) chứ không cộng dồn từng nhịp
 * `setInterval`. Lý do: macOS bóp cổ hẹn giờ của tab chạy nền xuống còn một
 * nhịp mỗi phút, nên cộng dồn kiểu kia sẽ trôi lệch cả chục phút sau vài
 * tiếng — mà chạy nền lại đúng là lúc tính năng này cần chính xác nhất.
 */
export function useNudge(onFire: () => void) {
  const nudge = useStore((s) => s.nudge);
  const setNudge = useStore((s) => s.setNudge);

  const [left, setLeft] = useState(0);
  const fireRef = useRef(onFire);
  fireRef.current = onFire;

  const intervalMs = Math.max(1, nudge.everyMin) * 60_000;

  /** Đặt lại mốc nhắc kế tiếp kể từ bây giờ */
  const reschedule = useCallback(() => {
    setNudge({ nextAt: Date.now() + intervalMs });
  }, [setNudge, intervalMs]);

  /* Bật chế độ hoặc đổi chu kỳ → đặt lại mốc cho khỏi bắn ngay lập tức */
  useEffect(() => {
    if (!nudge.on) return;
    if (!nudge.nextAt || nudge.nextAt > Date.now() + intervalMs) {
      setNudge({ nextAt: Date.now() + intervalMs });
    }
  }, [nudge.on, intervalMs, nudge.nextAt, setNudge]);

  useEffect(() => {
    if (!nudge.on) {
      setLeft(0);
      return;
    }

    const tick = () => {
      const remain = (nudge.nextAt ?? 0) - Date.now();
      setLeft(Math.max(0, remain));
      if (remain <= 0) {
        setNudge({ nextAt: Date.now() + intervalMs });
        fireRef.current();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);

    // Máy vừa ngủ dậy hoặc quay lại tab: kiểm tra ngay, đừng chờ hết nhịp.
    const onWake = () => tick();
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener('focus', onWake);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener('focus', onWake);
    };
  }, [nudge.on, nudge.nextAt, intervalMs, setNudge]);

  return { on: nudge.on, everyMin: nudge.everyMin, left, reschedule };
}

/**
 * Hiện thông báo hệ thống. Chỉ dùng khi cửa sổ đang KHÔNG được nhìn — đang mở
 * sẵn app mà còn bắn thông báo thì chỉ tổ khó chịu.
 */
export function popNotification(title: string, body: string, onClick?: () => void): void {
  if (!notifySupported() || Notification.permission !== 'granted') return;
  if (document.visibilityState === 'visible') return;
  try {
    const n = new Notification(title, {
      body,
      tag: 'echofluent-nudge',
      // Thay thế thông báo cũ thay vì xếp chồng — đi ăn trưa về không muốn
      // thấy 8 cái thông báo giống hệt nhau.
      renotify: true,
      icon: `${import.meta.env?.BASE_URL ?? '/'}icon.png`,
    } as NotificationOptions);
    n.onclick = () => {
      window.focus();
      n.close();
      onClick?.();
    };
  } catch {
    /* trình duyệt từ chối thì thôi, đã có bảng hỏi trong app rồi */
  }
}
