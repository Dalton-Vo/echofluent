import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ACHIEVEMENTS } from '@/data/gamify';

/** Bật lên khi mở khoá huy hiệu mới. Tự tắt sau 5 giây. */
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
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-8">
      <AnimatePresence>
        {items.map((a) => (
          <motion.button
            key={a!.id}
            type="button"
            onClick={dismiss}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-mint/30 bg-surface px-4 py-3 shadow-[0_16px_50px_-16px_rgba(0,0,0,.8)]"
          >
            <span className="text-2xl">{a!.emoji}</span>
            <span className="text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-mint">
                Mở khoá huy hiệu
              </span>
              <span className="block text-sm font-bold text-ink">{a!.title}</span>
              <span className="block text-xs text-muted">{a!.desc}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
