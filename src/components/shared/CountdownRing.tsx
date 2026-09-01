import { cn } from '@/lib/utils';

/**
 * Vòng đếm ngược. Đây là "cây gậy" ép phản xạ: khi vòng gần hết, bạn buộc
 * phải bật ra câu trả lời thay vì soạn câu hoàn hảo trong đầu.
 */
export function CountdownRing({
  ratio,
  seconds,
  size = 84,
  stroke = 6,
  label,
}: {
  /** 1 → 0 */
  ratio: number;
  seconds: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const left = Math.max(0, Math.ceil(seconds * ratio));
  const danger = ratio < 0.3;
  const warn = ratio < 0.6;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          className={cn(
            'transition-[stroke] duration-300',
            danger ? 'stroke-rose' : warn ? 'stroke-amber' : 'stroke-mint',
          )}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={cn(
            'font-mono text-xl font-bold tabular-nums',
            danger ? 'text-rose' : warn ? 'text-amber' : 'text-mint',
          )}
        >
          {left}
        </span>
        {label && <span className="text-[10px] uppercase tracking-wider text-faint">{label}</span>}
      </div>
    </div>
  );
}
