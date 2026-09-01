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
    mint: 'border-mint/30 bg-mint/10 text-mint',
    violet: 'border-violet/30 bg-violet/10 text-violet',
    amber: 'border-amber/30 bg-amber/10 text-amber',
    rose: 'border-rose/30 bg-rose/10 text-rose',
    sky: 'border-sky/30 bg-sky/10 text-sky',
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
      className={cn('w-full overflow-hidden rounded-full bg-raised', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', bg)}
        style={{ width: `${pct}%` }}
      />
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
    mint: 'text-mint bg-mint/10',
    violet: 'text-violet bg-violet/10',
    amber: 'text-amber bg-amber/10',
    sky: 'text-sky bg-sky/10',
    rose: 'text-rose bg-rose/10',
  };
  return (
    <div className="card flex items-center gap-3.5 p-4">
      {icon && (
        <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', tones[tone])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        {/* Nhãn tiếng Việt khá dài — cho phép xuống dòng thay vì cắt cụt trên màn hình hẹp */}
        <div className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-faint">
          {label}
        </div>
        <div className="mt-0.5 text-xl font-bold leading-tight text-ink">{value}</div>
        {sub && <div className="mt-0.5 text-xs leading-snug text-muted">{sub}</div>}
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
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {desc && <p className="mt-0.5 text-sm text-muted">{desc}</p>}
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
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
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-2.5 text-left transition hover:bg-raised/50"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-mint' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
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
    <div className="inline-flex rounded-xl border border-line bg-raised/50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg font-semibold transition-all',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
            value === o.value ? 'bg-mint text-[#04120c]' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
