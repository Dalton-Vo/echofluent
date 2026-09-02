import { useEffect, useState } from 'react';
import { Zap, Bell, BellOff, AlertTriangle, Check } from 'lucide-react';
import { Card, SectionHeader, Segmented, Toggle } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import {
  askNotifyPermission,
  currentNotifyPermission,
  type NotifyPermission,
} from '@/hooks/useNudge';

/* Cấu hình chế độ hỏi bất chợt */

export function NudgeSection() {
  const nudge = useStore((s) => s.nudge);
  const setNudge = useStore((s) => s.setNudge);
  const [perm, setPerm] = useState<NotifyPermission>('default');

  useEffect(() => {
    setPerm(currentNotifyPermission());
  }, []);

  const enable = async (on: boolean) => {
    if (on && currentNotifyPermission() === 'default') {
      // Xin quyền ngay trong cú bấm này — trình duyệt chỉ chấp nhận lúc đó.
      setPerm(await askNotifyPermission());
    }
    setNudge({ on, nextAt: on ? Date.now() + nudge.everyMin * 60_000 : null });
  };

  return (
    <section>
      <SectionHeader
        title="Hỏi bất chợt"
        desc="Cứ vài phút lại ném ra một câu và bắt bạn nói ngay. Phản xạ chỉ lên khi bị hỏi lúc chưa kịp chuẩn bị."
      />

      <Card className="space-y-5">
        <Toggle
          checked={nudge.on}
          onChange={(v) => void enable(v)}
          label="Bật chế độ hỏi bất chợt"
          hint="Một câu hiện giữa màn hình, trả lời xong là đóng lại ngay. Bấm Esc để bỏ qua."
        />

        {nudge.on && (
          <>
            <div>
              <label className="label">Bao lâu hỏi một lần</label>
              <Segmented
                value={String(nudge.everyMin)}
                onChange={(v) =>
                  setNudge({ everyMin: Number(v), nextAt: Date.now() + Number(v) * 60_000 })
                }
                options={[
                  { value: '5', label: '5′' },
                  { value: '15', label: '15′' },
                  { value: '30', label: '30′' },
                  { value: '60', label: '60′' },
                ]}
              />
              <p className="mt-1.5 text-xs text-faint">
                15 phút là nhịp hợp lý cho một ngày làm việc: đủ dày để thành thói quen, chưa tới
                mức phá mạch tập trung.
              </p>
            </div>

            <Toggle
              checked={nudge.speak}
              onChange={(v) => setNudge({ speak: v })}
              label="Đọc câu hỏi thành tiếng"
              hint="Nghe rồi trả lời sát với hội thoại thật hơn là đọc bằng mắt."
            />

            {/* Trạng thái quyền thông báo */}
            {perm === 'granted' && (
              <p className="flex items-center gap-2 rounded-xl bg-mint/10 px-3.5 py-2.5 text-xs text-mint">
                <Check size={14} /> Thông báo đã bật — app thu nhỏ vẫn nhắc được.
              </p>
            )}
            {perm === 'denied' && (
              <p className="flex items-start gap-2 rounded-xl bg-amber/10 px-3.5 py-2.5 text-xs leading-relaxed text-amber">
                <BellOff size={14} className="mt-px shrink-0" />
                Thông báo đang bị chặn. Chế độ này vẫn chạy khi app đang mở, chỉ là không nổi
                thông báo lúc bạn đang ở cửa sổ khác. Mở lại ở System Settings → Notifications.
              </p>
            )}
            {perm === 'default' && (
              <button
                type="button"
                onClick={async () => setPerm(await askNotifyPermission())}
                className="btn-ghost w-full"
              >
                <Bell size={15} /> Cho phép hiện thông báo
              </button>
            )}

            <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-raised/40 p-3.5">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-faint" />
              <p className="text-xs leading-relaxed text-muted">
                Đồng hồ chỉ chạy khi app còn mở — đóng hẳn cửa sổ thì không có gì nhắc. Trên
                macOS nên cài app ra cửa sổ riêng (Chrome → menu ⋮ → Cast, Save and Share → Install)
                rồi để nó chạy nền, thông báo sẽ nổi lên như ứng dụng thường.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNudge({ nextAt: Date.now() })}
              className="btn-quiet w-full text-xs"
            >
              <Zap size={13} /> Hỏi thử ngay bây giờ
            </button>
          </>
        )}
      </Card>
    </section>
  );
}
