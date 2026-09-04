import { LifeBuoy, RotateCcw, Flag } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import { WARMUP_DAYS, isWarmupOn, isWarmupOver, startWarmup, warmupDaysLeft } from '@/lib/warmup';

/* ============================================================================
 *  Bật/tắt chế độ làm quen.
 *
 *  Ba trạng thái, không phải hai: chưa bật · đang chạy · đã hết hạn nhưng chưa
 *  trả lời. Trạng thái thứ ba tồn tại để app hỏi thẳng một câu thay vì lặng lẽ
 *  tự tắt — người học cần một khoảnh khắc nhìn lại và tự quyết, chứ không phải
 *  một hôm nào đó thấy bài khó lên mà không hiểu vì sao.
 * ========================================================================== */

export function WarmupSection() {
  const until = useStore((s) => s.settings.warmupUntil);
  const setSettings = useStore((s) => s.setSettings);

  const on = isWarmupOn(until);
  const over = isWarmupOver(until);
  const left = warmupDaysLeft(until);

  return (
    <section>
      <SectionHeader
        title="Chế độ làm quen"
        desc="Một giai đoạn có hạn để lấy lại đà. Câu mẫu hiện ra trước khi bạn nói, nên bài đổi từ “nhớ lại” sang “nhại theo”."
      />

      <Card className="space-y-4">
        {on ? (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-sky/30 bg-sky/[.07] p-3.5">
              <LifeBuoy size={20} className="shrink-0 text-sky" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">Đang bật — còn {left} ngày</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  Ở Phản xạ và Hỏi bất chợt, câu mẫu hiện sẵn dưới câu hỏi. Vẫn phải mở miệng và
                  vẫn được chấm — chỉ bỏ đi khâu phải tự nhớ ra.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-quiet"
                onClick={() => setSettings({ warmupUntil: startWarmup() })}
              >
                <RotateCcw size={14} /> Đặt lại {WARMUP_DAYS} ngày
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setSettings({ warmupUntil: null })}
              >
                <Flag size={14} /> Quay lại đường đua ngay
              </button>
            </div>
          </>
        ) : (
          <>
            {over && (
              <div className="rounded-xl border border-amber/30 bg-amber/[.07] p-3.5">
                <p className="text-sm font-bold text-amber">Giai đoạn làm quen đã hết</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  Chọn quay lại đường đua, hoặc gia hạn thêm nếu thấy chưa sẵn sàng. Gia hạn
                  không phải là thất bại — ép quay lại quá sớm mới là thứ làm người ta bỏ hẳn.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSettings({ warmupUntil: startWarmup() })}
              >
                <LifeBuoy size={15} /> {over ? `Gia hạn ${WARMUP_DAYS} ngày` : `Bật ${WARMUP_DAYS} ngày`}
              </button>
              {over && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setSettings({ warmupUntil: null })}
                >
                  <Flag size={14} /> Tôi sẵn sàng rồi
                </button>
              )}
            </div>
            {!over && (
              <p className="text-xs leading-relaxed text-faint">
                Bật khi thấy đuối. Hết {WARMUP_DAYS} ngày app sẽ hỏi lại chứ không tự tắt lặng lẽ.
              </p>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
