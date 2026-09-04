import { Mic, MicOff, Square, LoaderCircle, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MicState } from '@/hooks/useSpeech';

/**
 * Nút thu âm lớn — trung tâm của mọi bài luyện nói.
 *
 * Viền đặc báo phiên thu đang mở; các ô âm lượng chỉ sáng theo tín hiệu thật.
 * Không dùng nhịp nhấp nháy giả khiến im lặng trông như đang thu được tiếng.
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
  sttSilent,
  browserName,
  aiReady,
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
  /** Nhận diện chạy nhưng không ra chữ — Brave hay bị */
  sttSilent?: boolean;
  browserName?: string;
  /** Đã gắn khoá AI chưa — quyết định lời khuyên đưa ra */
  aiReady?: boolean;
}) {
  const listening = state === 'listening';
  const starting = state === 'starting';
  const blocked = state === 'denied';
  const noDevice = state === 'nomic';
  const unsupported = state === 'unsupported';
  const unavailable = blocked || noDevice || unsupported;

  const dim = size === 'lg' ? 'h-20 w-20' : 'h-14 w-14';
  const icon = size === 'lg' ? 32 : 24;
  const pixels = size === 'lg' ? 80 : 56;
  const outline = size === 'lg'
    ? 'M28 4H52V8H60V16H68V24H72V32H76V48H72V56H68V64H60V72H52V76H28V72H20V64H12V56H8V48H4V32H8V24H12V16H20V8H28Z'
    : 'M20 4H36V8H44V12H48V20H52V36H48V44H44V48H36V52H20V48H12V44H8V36H4V20H8V12H12V8H20Z';
  const loud = level > 0.06;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative grid place-items-center">
        {listening && (
          <span aria-hidden="true" className="pointer-events-none absolute -inset-2 border-2 border-rose" />
        )}

        <button
          type="button"
          disabled={disabled || starting}
          onClick={listening ? onStop : onStart}
          aria-label={listening ? 'Dừng thu âm' : 'Bắt đầu nói'}
          className={cn(
            'group relative grid place-items-center bg-transparent transition-none enabled:active:translate-y-1 disabled:cursor-not-allowed',
            dim,
            listening
              ? 'text-bg'
              : unavailable
                ? 'text-muted'
                : disabled || starting ? 'text-muted' : 'text-bg',
          )}
        >
          <svg aria-hidden="true" width={pixels} height={pixels} viewBox={`0 0 ${pixels} ${pixels}`} shapeRendering="crispEdges" className="pointer-events-none absolute inset-0">
            <path d={outline} strokeWidth={2} strokeLinejoin="miter" className={cn('stroke-ink', listening ? 'fill-rose' : unavailable || disabled || starting ? 'fill-surface' : 'fill-mint group-hover:fill-ink')} />
          </svg>
          <span className="relative">
          {starting ? (
            <LoaderCircle size={icon} className="animate-spin" />
          ) : listening ? (
            <Square size={icon - 8} />
          ) : blocked ? (
            <ShieldAlert size={icon} />
          ) : unavailable ? (
            <MicOff size={icon} />
          ) : (
            <Mic size={icon} />
          )}
          </span>
        </button>
      </div>

      {/* Thanh mức âm — bằng chứng thứ hai, rõ ràng hơn cả vòng sáng */}
      {listening && (
        <div className="flex h-10 items-end gap-1" aria-hidden>
          {Array.from({ length: 9 }, (_, i) => {
            const threshold = (i + 1) / 11;
            const on = level >= threshold;
            return (
              <span
                key={i}
                className={cn(
                  'w-1 transition-none',
                  on ? 'bg-mint' : 'bg-line',
                )}
                style={{ height: on ? 8 + i * 4 : 4 }}
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

      {resumed && listening && !sttSilent && (
        <span className="text-[11px] text-faint">
          Trình duyệt tự ngắt vì im lặng — app đã nối lại, cứ nói tiếp.
        </span>
      )}

      {/* Nhận diện chạy mà câm: nói thẳng nguyên nhân, đừng để người dùng
          ngồi nói to dần lên rồi tưởng micro của mình hỏng. */}
      {sttSilent && listening && (
        <span className="max-w-xs text-center text-[11px] leading-relaxed text-amber">
          {browserName === 'Brave'
            ? aiReady
              ? 'Brave chặn nhận diện giọng nói của Google, nên chữ không hiện lên được. Cứ nói xong rồi bấm dừng — AI sẽ nghe lại bản ghi âm và chấm bình thường.'
              : 'Brave chặn nhận diện giọng nói của Google nên không hiện chữ được. Vào Cài đặt gắn khoá AI để chấm bằng bản ghi âm, hoặc mở app bằng Chrome.'
            : aiReady
              ? 'Trình duyệt không trả về chữ. Cứ nói xong rồi bấm dừng — AI sẽ nghe lại bản ghi âm.'
              : 'Trình duyệt không trả về chữ. Thử dùng Chrome, hoặc gắn khoá AI trong Cài đặt để chấm bằng bản ghi âm.'}
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
