import { Mic, MicOff, Square, LoaderCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MicState } from '@/hooks/useSpeech';

/**
 * Nút thu âm lớn — trung tâm của mọi bài luyện nói.
 *
 * Điểm mấu chốt là VÒNG SÁNG NẢY THEO GIỌNG. Trước đây nút chỉ nhấp nháy một
 * nhịp cố định, nên khi micro không ăn tiếng thì nhìn vẫn y hệt lúc chạy tốt —
 * người dùng nói cả câu rồi mới biết công cốc. Giờ vòng sáng phồng ra theo
 * đúng độ to của tiếng nói: im lặng là nó đứng yên, và chỉ cần liếc mắt là
 * biết ngay micro có nghe thấy mình hay không.
 */
export function MicButton({
  state,
  level = 0,
  onStart,
  onStop,
  disabled,
  size = 'lg',
  hint,
  resumed,
}: {
  state: MicState;
  /** Mức âm thanh vào, 0 → 1 */
  level?: number;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  size?: 'lg' | 'md';
  hint?: string;
  /** Trình duyệt vừa tự ngắt và app đã nối lại — trấn an người dùng */
  resumed?: boolean;
}) {
  const listening = state === 'listening';
  const starting = state === 'starting';
  const blocked = state === 'denied';
  const noDevice = state === 'nomic';
  const unsupported = state === 'unsupported';
  const unavailable = blocked || noDevice || unsupported;

  const dim = size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';
  const icon = size === 'lg' ? 30 : 22;

  // Vòng sáng to dần theo giọng. Có sàn 1.0 để lúc im lặng nó không teo mất.
  const ring = 1 + Math.min(level, 1) * 0.85;
  const loud = level > 0.06;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid place-items-center">
        {listening && (
          <>
            {/* vòng phản ứng tức thì theo âm lượng */}
            <span
              aria-hidden
              className="pointer-events-none absolute rounded-full bg-mint/25 transition-none"
              style={{
                width: size === 'lg' ? 80 : 56,
                height: size === 'lg' ? 80 : 56,
                transform: `scale(${ring})`,
                opacity: 0.25 + Math.min(level, 1) * 0.5,
              }}
            />
            {/* nhịp nền chậm, cho biết phiên nghe vẫn đang mở */}
            <span
              aria-hidden
              className="pointer-events-none absolute animate-pulse-ring rounded-full bg-rose/30"
              style={{ width: size === 'lg' ? 80 : 56, height: size === 'lg' ? 80 : 56 }}
            />
          </>
        )}

        <button
          type="button"
          disabled={disabled || starting}
          onClick={listening ? onStop : onStart}
          aria-label={listening ? 'Dừng thu âm' : 'Bắt đầu nói'}
          className={cn(
            'relative grid place-items-center rounded-full transition-all active:scale-95 disabled:opacity-60',
            dim,
            listening
              ? 'bg-rose text-white shadow-[0_0_40px_-8px_rgb(var(--c-rose)/.8)]'
              : unavailable
                ? 'border border-line bg-raised text-faint'
                : 'bg-mint text-[#04120c] shadow-glow hover:brightness-110',
          )}
        >
          {starting ? (
            <LoaderCircle size={icon} className="animate-spin" />
          ) : listening ? (
            <Square size={icon - 6} />
          ) : blocked ? (
            <ShieldAlert size={icon} />
          ) : unavailable ? (
            <MicOff size={icon} />
          ) : (
            <Mic size={icon} />
          )}
        </button>
      </div>

      {/* Thanh mức âm — bằng chứng thứ hai, rõ ràng hơn cả vòng sáng */}
      {listening && (
        <div className="flex h-4 items-end gap-[3px]" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => {
            const threshold = (i + 1) / 11;
            const on = level >= threshold;
            return (
              <span
                key={i}
                className={cn(
                  'w-[3px] rounded-full transition-all duration-75',
                  on ? 'bg-mint' : 'bg-line',
                )}
                style={{ height: on ? 6 + i * 1.4 : 4 }}
              />
            );
          })}
        </div>
      )}

      {starting && <span className="text-xs text-faint">Đang mở micro…</span>}

      {listening && !loud && (
        <span className="text-xs text-amber">Chưa nghe thấy gì — nói to hơn một chút</span>
      )}

      {hint && !starting && <span className="text-xs text-faint">{hint}</span>}

      {resumed && listening && (
        <span className="text-[11px] text-faint">
          Trình duyệt tự ngắt vì im lặng — app đã nối lại, cứ nói tiếp.
        </span>
      )}

      {blocked && (
        <span className="max-w-xs text-center text-xs leading-relaxed text-rose">
          Trình duyệt đang chặn micro. Bấm vào biểu tượng ổ khoá 🔒 bên trái thanh địa chỉ →
          bật Micro → tải lại trang.
        </span>
      )}
      {noDevice && (
        <span className="max-w-xs text-center text-xs text-rose">
          Không tìm thấy micro nào. Kiểm tra lại thiết bị thu âm trong cài đặt hệ thống.
        </span>
      )}
      {unsupported && (
        <span className="max-w-xs text-center text-xs leading-relaxed text-amber">
          Trình duyệt này không thu âm được. Bạn vẫn nói ra miệng như bình thường rồi tự chấm —
          dùng Chrome hoặc Edge sẽ có chấm tự động.
        </span>
      )}
    </div>
  );
}
