import { Mic, MicOff, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MicState } from '@/hooks/useSpeech';

/**
 * Nút thu âm lớn — trung tâm của mọi bài luyện nói.
 * Khi trình duyệt không hỗ trợ nhận diện giọng nói, nút vẫn hiển thị nhưng
 * chuyển sang chế độ "tự chấm": bạn nói ra miệng rồi tự đánh giá.
 */
export function MicButton({
  state,
  onStart,
  onStop,
  disabled,
  size = 'lg',
  hint,
}: {
  state: MicState;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  size?: 'lg' | 'md';
  hint?: string;
}) {
  const listening = state === 'listening';
  const dim = size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';
  const icon = size === 'lg' ? 30 : 22;

  const unavailable = state === 'unsupported' || state === 'denied';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {listening && (
          <>
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-rose/40" />
            <span
              className="absolute inset-0 animate-pulse-ring rounded-full bg-rose/30"
              style={{ animationDelay: '.4s' }}
            />
          </>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={listening ? onStop : onStart}
          aria-label={listening ? 'Dừng thu âm' : 'Bắt đầu nói'}
          className={cn(
            'relative grid place-items-center rounded-full transition-all active:scale-95 disabled:opacity-40',
            dim,
            listening
              ? 'bg-rose text-white shadow-[0_0_40px_-8px_rgb(var(--c-rose)/.8)]'
              : unavailable
                ? 'border border-line bg-raised text-faint'
                : 'bg-mint text-[#04120c] shadow-glow hover:brightness-110',
          )}
        >
          {listening ? <Square size={icon - 6} /> : unavailable ? <MicOff size={icon} /> : <Mic size={icon} />}
        </button>
      </div>
      {hint && <span className="text-xs text-faint">{hint}</span>}
      {state === 'denied' && (
        <span className="max-w-xs text-center text-xs text-rose">
          Trình duyệt đã chặn micro. Mở khoá quyền micro cho trang này rồi thử lại.
        </span>
      )}
      {state === 'unsupported' && (
        <span className="max-w-xs text-center text-xs text-amber">
          Trình duyệt này không nhận diện giọng nói. Bạn vẫn nói ra miệng như bình thường rồi tự chấm
          nhé — dùng Chrome sẽ có chấm tự động.
        </span>
      )}
    </div>
  );
}
