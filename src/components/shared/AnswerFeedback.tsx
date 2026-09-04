import { useEffect, useMemo, useState } from 'react';
import { Check, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  Dải phản hồi đúng/sai — kiểu Duolingo
 * ============================================================================
 *
 *  Điều Duolingo làm rất khéo là trả lời TỨC THÌ và KHÔNG THỂ HIỂU NHẦM: một
 *  dải màu chiếm nguyên đáy màn hình, xanh hay đỏ nhìn phát biết, chưa cần đọc
 *  chữ. Cảm giác đó mới giữ người ta làm tiếp câu nữa — chứ không phải nội
 *  dung bài học.
 *
 *  Ở đây thêm một chi tiết Duolingo không có mà app này cần: hiện luôn thời
 *  gian phản xạ. Mục tiêu của app là bật ra câu cho nhanh, nên con số đó mới
 *  là điểm số thật, chứ không phải đúng hay sai.
 * ========================================================================== */

export type Verdict = 'pass' | 'retry' | 'skip';

export function AnswerFeedback({
  verdict,
  score,
  reactionMs,
  message,
  action,
  actionLabel,
}: {
  verdict: Verdict;
  score?: number | null;
  reactionMs?: number;
  message: string;
  action?: () => void;
  actionLabel?: string;
}) {
  const pass = verdict === 'pass';
  const tone = pass ? 'mint' : verdict === 'retry' ? 'rose' : 'amber';
  const fast = pass && typeof reactionMs === 'number' && reactionMs > 0 && reactionMs < 3000;

  return (
    <div
      className={cn(
        'animate-slide-up fixed inset-x-0 bottom-0 z-40 border-t-2 bg-surface',
        tone === 'mint'
          ? 'border-mint'
          : tone === 'rose'
            ? 'border-rose'
            : 'border-amber',
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-3 px-5 py-4">
        <span
          className={cn(
            'animate-stamp grid h-11 w-11 shrink-0 place-items-center rounded-full',
            tone === 'mint'
              ? 'bg-mint text-bg'
              : tone === 'rose'
                ? 'bg-rose text-bg'
                : 'bg-amber text-bg',
          )}
        >
          {pass ? <Check size={22} /> : <X size={22} />}
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-base font-extrabold',
              tone === 'mint' ? 'text-mint' : tone === 'rose' ? 'text-rose' : 'text-amber',
            )}
          >
            {message}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
            {typeof score === 'number' && <span className="font-mono">{score}/100</span>}
            {typeof reactionMs === 'number' && reactionMs > 0 && (
              <span className="font-mono">bật ra sau {(reactionMs / 1000).toFixed(1)}s</span>
            )}
            {fast && (
              <span className="flex items-center gap-1 font-semibold text-mint">
                <Zap size={11} /> phản xạ nhanh
              </span>
            )}
          </p>
        </div>

        {action && actionLabel && (
          <button
            type="button"
            onClick={action}
            className={cn(
              'btn shrink-0 px-5 text-sm font-bold',
              tone === 'mint'
                ? 'bg-mint text-bg'
                : tone === 'rose'
                  ? 'bg-rose text-bg'
                  : 'bg-amber text-bg',
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ ăn mừng ------------------------------ */

/**
 * Mảnh giấy vụn rơi xuống khi xong phiên.
 *
 * Vẽ bằng div thuần chứ không kéo thêm thư viện: chỉ cần chục mảnh rơi là đủ
 * cảm giác, không đáng đánh đổi thêm vài chục KB vào bundle cho một hiệu ứng
 * chạy đúng một lần mỗi phiên.
 */
export function Confetti({ count = 24 }: { count?: number }) {
  const [gone, setGone] = useState(false);

  // Vị trí và màu cố định theo lần dựng, để re-render không làm nhảy loạn.
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.round((i * 97 + 13) % 100),
        delay: ((i * 37) % 60) / 100,
        hue: ['bg-mint', 'bg-violet', 'bg-amber', 'bg-sky'][i % 4],
        size: 8 + (i % 3) * 4,
      })),
    [count],
  );

  useEffect(() => {
    const t = window.setTimeout(() => setGone(true), 2400);
    return () => window.clearTimeout(t);
  }, []);

  if (gone) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-0 overflow-visible" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className={cn('animate-confetti absolute top-0 block', b.hue)}
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
