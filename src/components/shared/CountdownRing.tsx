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
  // Twenty discrete perimeter cells; preserve the original time calculation.
  const pitch = Math.max(8, Math.floor(size / 24) * 4);
  const block = Math.min(pitch - 4, Math.max(4, Math.ceil(stroke / 4) * 4));
  const offset = Math.floor((size - (5 * pitch + block)) / 2);
  const filled = Math.ceil(Math.max(0, Math.min(1, ratio)) * 20);
  const left = Math.max(0, Math.ceil(seconds * ratio));
  const danger = ratio < 0.3;
  const warn = ratio < 0.6;

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="timer" aria-live="off" aria-label={`${left} ${label ?? 'giây'}`}>
      <svg width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
        {Array.from({ length: 20 }, (_, i) => {
          const step = i % 5;
          const [x, y] = i < 5 ? [step, 0] : i < 10 ? [5, step] : i < 15 ? [5 - step, 5] : [0, 5 - step];
          return <rect key={i} x={offset + x * pitch} y={offset + y * pitch} width={block} height={block}
            className={i >= filled ? 'fill-line' : danger ? 'fill-rose' : warn ? 'fill-amber' : 'fill-mint'} />;
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={cn(
            'font-pixel text-base leading-6 tabular-nums',
            danger ? 'text-rose' : warn ? 'text-amber' : 'text-mint',
          )}
        >
          {left}
        </span>
        {label && <span className="font-sans text-xs leading-5 text-muted">{label}</span>}
      </div>
    </div>
  );
}
