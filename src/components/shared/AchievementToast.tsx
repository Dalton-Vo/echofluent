import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ACHIEVEMENTS } from '@/data/gamify';

/**
 * Bật lên khi mở khoá huy hiệu mới. Tự tắt sau 5 giây.
 *
 * Hoạt ảnh viết bằng Tailwind chứ không dùng thư viện. Trước đây chỗ này kéo
 * theo cả framer-motion — khoảng 100KB nạp cho MỌI người mở app, để phục vụ
 * đúng một cái toast mà phần lớn phiên học không hề thấy. Cả app còn lại vốn
 * đã dùng hoạt ảnh Tailwind, nên đây là thư viện lạc lõng chứ không phải nền
 * tảng chung.
 *
 * Đổi lại: mất hiệu ứng thoát mượt (không có AnimatePresence để giữ phần tử
 * lại lúc gỡ bỏ). Với một cái toast tự tắt sau 5 giây thì không ai nhận ra.
 */
export function AchievementToast() {
  const ids = useStore((s) => s.newAchievements);
  const dismiss = useStore((s) => s.dismissAchievements);

  useEffect(() => {
    if (!ids.length) return;
    const t = window.setTimeout(dismiss, 5200);
    return () => window.clearTimeout(t);
  }, [ids, dismiss]);

  const items = ids
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 3);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-8">
      {items.map((a, i) => (
        <button
          key={a.id}
          type="button"
          onClick={dismiss}
          style={{ animationDelay: `${i * 90}ms` }}
          className="animate-stamp pointer-events-auto flex max-w-[calc(100vw-32px)] items-center gap-3 border-2 border-mint bg-surface px-4 py-3 shadow-soft"
        >
          <span className="text-2xl">{a.emoji}</span>
          <span className="text-left">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-mint">
              Mở khoá huy hiệu
            </span>
            <span className="block text-sm font-bold text-ink">{a.title}</span>
            <span className="block text-xs text-muted">{a.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
