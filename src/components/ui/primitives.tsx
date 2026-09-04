import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* Các khối giao diện dùng lại khắp app — giữ đơn giản, không thư viện UI nặng */

export function Card({
  children,
  className,
  as: Tag = 'div',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Tag className={cn('card p-5', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Chip({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: 'default' | 'mint' | 'violet' | 'amber' | 'rose' | 'sky';
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: '',
    mint: 'border-mint text-mint',
    violet: 'border-violet text-violet',
    amber: 'border-amber text-amber',
    rose: 'border-rose text-rose',
    sky: 'border-sky text-sky',
  };
  return <span className={cn('chip', tones[tone], className)}>{children}</span>;
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'mint',
  className,
  height = 8,
}: {
  value: number;
  max?: number;
  tone?: 'mint' | 'violet' | 'amber' | 'sky';
  className?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  const bg = { mint: 'bg-mint', violet: 'bg-violet', amber: 'bg-amber', sky: 'bg-sky' }[tone];
  return (
    <div
      className={cn('flex w-full gap-1', className)}
      style={{ height: Math.max(4, Math.ceil(height / 4) * 4) }}
      role="progressbar"
      aria-label="Tiến độ"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} aria-hidden="true" className={cn('h-full min-w-0 flex-1', i < Math.floor(pct / 5) ? bg : 'bg-line')} />
      ))}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = 'mint',
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: 'mint' | 'violet' | 'amber' | 'sky' | 'rose';
}) {
  const tones: Record<string, string> = {
    mint: 'text-mint border-mint',
    violet: 'text-violet border-violet',
    amber: 'text-amber border-amber',
    sky: 'text-sky border-sky',
    rose: 'text-rose border-rose',
  };
  const numeric = typeof value === 'number' || (typeof value === 'string' && /^[\d\s.,%:+/-]+$/.test(value));
  return (
    <div className="card flex flex-col items-start gap-3 p-4 sm:flex-row">
      {icon && (
        <div className={cn('grid h-10 w-10 shrink-0 place-items-center border-2 bg-surface', tones[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        {/* Nhãn tiếng Việt khá dài — cho phép xuống dòng thay vì cắt cụt trên màn hình hẹp */}
        <div className="text-xs font-semibold leading-5 text-muted">
          {label}
        </div>
        <div className={cn('mt-1 break-words leading-8 text-ink', numeric ? 'font-pixel text-base' : 'text-xl font-bold')}>{value}</div>
        {sub && <div className="mt-1 text-xs leading-5 text-muted">{sub}</div>}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  desc,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-l-4 border-mint pl-3">
      <div className="min-w-0 flex-1 basis-48">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {desc && <p className="mt-1 text-sm leading-6 text-muted">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({
  emoji = '🫙',
  title,
  desc,
  action,
}: {
  emoji?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-line bg-surface px-6 py-14 text-center">
      <div className="text-4xl">{emoji}</div>
      <div className="font-semibold text-ink">{title}</div>
      {desc && <p className="max-w-sm text-sm text-muted">{desc}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl px-1 py-3 text-left transition-none hover:bg-raised"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          'relative h-8 w-14 shrink-0',
          checked ? 'bg-mint' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-6 w-6 bg-bg',
            checked ? 'left-7' : 'left-1',
          )}
        />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  size = 'md',
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border-2 border-line bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'min-h-11 rounded-lg border-2 font-semibold transition-none',
            size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
            value === o.value ? 'border-mint bg-mint text-bg' : 'border-transparent text-muted hover:border-line hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
