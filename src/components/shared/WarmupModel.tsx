import { LifeBuoy } from 'lucide-react';
import { SpeakButton } from '@/components/shared/SpeakButton';

/* ============================================================================
 *  Câu mẫu hiện TRƯỚC khi trả lời — chỉ trong chế độ làm quen.
 *
 *  Bình thường app cố tình giấu câu mẫu: bật ra được từ con số không mới là
 *  phản xạ. Nhưng khi đang đuối thì con số không đó là bức tường, không phải
 *  bậc thang — ngồi im bốn phút rồi nhận 24/100 chỉ dạy được một điều là mình
 *  kém.
 *
 *  Có phao thì bài đổi từ "nhớ lại" sang "nhại theo". Vẫn phải mở miệng, vẫn
 *  phải phát âm, vẫn được chấm — chỉ bỏ đi đúng khâu khó nhất. Và vì giai đoạn
 *  này có hạn ngày, cái phao tự biến mất chứ không thành thói quen.
 * ========================================================================== */

export function WarmupModel({
  model,
  vi,
  showVi,
}: {
  model: string;
  vi: string;
  showVi: boolean;
}) {
  return (
    <div className="mx-auto mt-5 max-w-xl rounded-xl border border-sky/30 bg-sky/[.07] p-3.5 text-left">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky">
          <LifeBuoy size={12} /> Đang làm quen — cứ nhại theo
        </span>
        <SpeakButton text={model} variant="icon" />
      </div>
      <p className="text-sm font-semibold leading-relaxed text-ink">{model}</p>
      {showVi && <p className="mt-1 text-xs text-muted">{vi}</p>}
    </div>
  );
}
