import { Volume2, Square, Gauge } from 'lucide-react';
import { useSpeaker } from '@/hooks/useSpeech';
import { cn } from '@/lib/utils';

/**
 * Nút phát âm. `slowRate` cho phép nghe lại chậm — quan trọng với Listening Gym
 * vì lần đầu bạn nên nghe tốc độ thật, chỉ khi bí mới hạ tốc độ.
 */
export function SpeakButton({
  text,
  rate,
  label,
  className,
  variant = 'primary',
  autoPlay = false,
}: {
  text: string;
  rate?: number;
  label?: string;
  className?: string;
  variant?: 'primary' | 'ghost' | 'icon';
  autoPlay?: boolean;
}) {
  const { say, stop, speaking } = useSpeaker();

  const handle = () => (speaking ? stop() : say(text, { rate }));

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={speaking ? 'Dừng phát' : 'Nghe lại'}
        className={cn(
          'grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-raised/60 text-muted transition hover:text-ink active:scale-95',
          speaking && 'border-mint/40 text-mint',
          className,
        )}
      >
        {speaking ? <Square size={15} /> : <Volume2 size={16} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className={cn(variant === 'primary' ? 'btn-primary' : 'btn-ghost', className)}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoPlay}
    >
      {speaking ? <Square size={15} /> : <Volume2 size={16} />}
      {label ?? (speaking ? 'Dừng' : 'Nghe')}
    </button>
  );
}

/** Nút nghe lại ở tốc độ chậm hơn */
export function SlowSpeakButton({ text, rate = 0.7 }: { text: string; rate?: number }) {
  const { say } = useSpeaker();
  return (
    <button type="button" onClick={() => say(text, { rate })} className="btn-quiet text-xs">
      <Gauge size={14} />
      Nghe chậm
    </button>
  );
}
