import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, Play, Square, Check, AlertTriangle, RefreshCw, Headphones } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import {
  activeMicLabel,
  closeMic,
  createLevelMeter,
  detectQuirks,
  isRecorderSupported,
  listMicrophones,
  openMic,
  readMicError,
  startRecording,
  type LevelMeter,
  type MicDevice,
  type RecorderHandle,
} from '@/lib/audio';
import { isSttSupported } from '@/lib/speech';
import { isAiReady } from '@/lib/gemini';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  Kiểm tra micro
 *
 *  Sinh ra để trả lời đúng một câu hỏi: "micro của tôi có hoạt động không?"
 *  Trước đây muốn biết thì phải vào bài luyện, nói thử, rồi đoán qua việc app
 *  có hiện chữ hay không — mà chữ không hiện có tới bốn nguyên nhân khác nhau.
 *  Ở đây tách bạch từng khâu: thiết bị nào đang thu, có tín hiệu vào không, ghi
 *  âm lại nghe có ra tiếng mình không.
 *
 *  Đặc biệt cần khi đeo tai nghe: macOS hay tự chuyển đầu vào sang micro của
 *  tai nghe, và không ít tai nghe Bluetooth khi đang ở chế độ nghe nhạc chất
 *  lượng cao thì micro không hoạt động.
 * ========================================================================== */

export function MicCheckSection() {
  const micDeviceId = useStore((s) => s.settings.micDeviceId);
  const setSettings = useStore((s) => s.setSettings);
  const ai = useStore((s) => s.ai);

  const [devices, setDevices] = useState<MicDevice[]>([]);
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState('');
  const [clipUrl, setClipUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const meter = useRef<LevelMeter | null>(null);
  const rec = useRef<RecorderHandle | null>(null);
  const raf = useRef(0);
  const quirks = detectQuirks();

  const stopAll = useCallback(() => {
    cancelAnimationFrame(raf.current);
    meter.current?.stop();
    meter.current = null;
    rec.current?.cancel();
    rec.current = null;
    setListening(false);
    setRecording(false);
    setLevel(0);
  }, []);

  useEffect(() => () => {
    stopAll();
    closeMic();
  }, [stopAll]);

  /* Nhả URL của bản thu cũ, không thì mỗi lần thu lại rò một khối bộ nhớ */
  useEffect(() => {
    return () => {
      if (clipUrl) URL.revokeObjectURL(clipUrl);
    };
  }, [clipUrl]);

  const startTest = async () => {
    setError(null);
    setPeak(0);
    try {
      const stream = await openMic(micDeviceId || undefined);
      setActiveLabel(activeMicLabel());
      // Nhãn thiết bị chỉ hiện sau khi đã có quyền, nên nạp lại danh sách ở đây.
      setDevices(await listMicrophones());

      meter.current = createLevelMeter(stream);
      const tick = () => {
        if (!meter.current) return;
        const v = meter.current.level();
        setLevel(v);
        setPeak((p) => Math.max(p, v));
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
      setListening(true);
    } catch (e) {
      setError(
        readMicError(e) === 'unavailable'
          ? 'Không tìm thấy thiết bị thu nào trên máy.'
          : 'Trình duyệt chặn micro. Bấm biểu tượng ổ khoá bên trái thanh địa chỉ để mở quyền.',
      );
    }
  };

  const recordClip = async () => {
    if (recording) {
      const out = await rec.current?.stop();
      rec.current = null;
      setRecording(false);
      if (out) {
        if (clipUrl) URL.revokeObjectURL(clipUrl);
        setClipUrl(URL.createObjectURL(out.blob));
      }
      return;
    }
    try {
      const stream = await openMic(micDeviceId || undefined);
      rec.current = startRecording(stream);
      setRecording(true);
    } catch {
      setError('Không mở được micro để thu thử.');
    }
  };

  const heard = peak > 0.05;

  return (
    <section>
      <SectionHeader
        title="Kiểm tra micro"
        desc="Xem máy đang thu bằng thiết bị nào và micro có thật sự ăn tiếng bạn không."
      />

      <Card className="space-y-5">
        {/* chọn thiết bị */}
        <div>
          <label className="label" htmlFor="mic-device">
            Thiết bị thu
          </label>
          <div className="flex gap-2">
            <select
              id="mic-device"
              value={micDeviceId}
              onChange={(e) => {
                setSettings({ micDeviceId: e.target.value });
                stopAll();
                closeMic();
              }}
              className="input flex-1 text-sm"
            >
              <option value="">Để hệ điều hành tự chọn</option>
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={async () => setDevices(await listMicrophones())}
              className="btn-quiet px-3"
              aria-label="Nạp lại danh sách thiết bị"
            >
              <RefreshCw size={15} />
            </button>
          </div>
          {!devices.length && (
            <p className="mt-1.5 text-xs text-faint">
              Bấm “Bắt đầu kiểm tra” bên dưới để trình duyệt cho phép đọc tên các thiết bị.
            </p>
          )}
          {activeLabel && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-mint">
              <Headphones size={12} /> Đang thu qua: {activeLabel}
            </p>
          )}
        </div>

        {/* vạch mức âm */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Tín hiệu vào</span>
            {listening && (
              <span className={cn('text-xs font-semibold', heard ? 'text-mint' : 'text-amber')}>
                {heard ? 'Nghe rõ' : 'Chưa thấy tiếng'}
              </span>
            )}
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-line">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-75',
                level > 0.5 ? 'bg-rose' : level > 0.05 ? 'bg-mint' : 'bg-faint',
              )}
              style={{ width: `${Math.min(100, level * 130)}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {!listening ? (
              <button type="button" onClick={startTest} className="btn-primary">
                <Mic size={15} /> Bắt đầu kiểm tra
              </button>
            ) : (
              <button type="button" onClick={stopAll} className="btn-ghost">
                <Square size={14} /> Dừng
              </button>
            )}

            {isRecorderSupported() && (
              <button type="button" onClick={recordClip} className="btn-ghost">
                {recording ? (
                  <>
                    <Square size={14} /> Dừng thu
                  </>
                ) : (
                  <>
                    <Play size={15} /> Thu thử rồi nghe lại
                  </>
                )}
              </button>
            )}
          </div>

          {listening && !heard && (
            <p className="mt-2.5 rounded-xl bg-amber/10 px-3.5 py-2.5 text-xs leading-relaxed text-amber">
              Vạch không nhúc nhích. Thử theo thứ tự: nói to hơn và gần micro hơn → đổi sang
              thiết bị khác ở ô trên → mở  → Cài đặt hệ thống → Âm thanh → Đầu vào và xem
              vạch ở đó có nhảy không. Đeo tai nghe Bluetooth thì thử rút ra dùng micro máy,
              vì nhiều tai nghe ở chế độ nghe nhạc chất lượng cao sẽ tắt micro.
            </p>
          )}

          {clipUrl && (
            <div className="mt-3">
              <p className="label !mb-1.5">Nghe lại bản vừa thu</p>
              <audio controls src={clipUrl} className="w-full" />
              <p className="mt-1.5 text-xs text-faint">
                Nghe ra giọng mình là micro chạy tốt. Im lặng thì vấn đề nằm ở thiết bị thu,
                không phải ở app.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-rose/10 px-3.5 py-2.5 text-xs leading-relaxed text-rose">
            <AlertTriangle size={14} className="mt-px shrink-0" />
            {error}
          </p>
        )}

        {/* khả năng của trình duyệt */}
        <div className="space-y-2 border-t border-line/60 pt-4">
          <p className="text-sm font-semibold text-ink">Trình duyệt: {quirks.name}</p>
          <Capability ok label="Thu âm" note="ghi lại giọng để AI chấm" />
          <Capability
            ok={isSttSupported() && !quirks.sttLikelyBlocked}
            label="Hiện chữ trực tiếp khi nói"
            note={
              quirks.isBrave
                ? 'Brave gỡ khoá API của Google nên phần này không chạy'
                : !isSttSupported()
                  ? 'trình duyệt này không có Web Speech API'
                  : 'nhận diện ngay trong trình duyệt'
            }
          />
          <Capability
            ok={isAiReady(ai) && ai.enabled}
            label="Chấm phát âm & chép chữ bằng AI"
            note={isAiReady(ai) ? 'đã gắn khoá' : 'chưa gắn khoá — xem mục ngay dưới'}
          />

          {quirks.sttLikelyBlocked && (
            <p className="mt-2 rounded-xl border border-violet/25 bg-violet/[.06] px-3.5 py-2.5 text-xs leading-relaxed text-muted">
              {quirks.name} không hiện chữ trực tiếp lúc bạn đang nói được. App vẫn ghi âm bình
              thường, nên chỉ cần gắn khoá AI ở mục dưới là chấm điểm và chấm phát âm chạy đủ —
              chỉ khác ở chỗ chữ hiện ra sau khi bạn nói xong thay vì hiện dần theo lời.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}

function Capability({ ok, label, note }: { ok: boolean; label: string; note: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={cn(
          'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full',
          ok ? 'bg-mint/15 text-mint' : 'bg-amber/15 text-amber',
        )}
      >
        {ok ? <Check size={10} /> : <AlertTriangle size={10} />}
      </span>
      <span className="text-xs leading-relaxed">
        <span className={cn('font-semibold', ok ? 'text-ink' : 'text-muted')}>{label}</span>
        <span className="text-faint"> — {note}</span>
      </span>
    </div>
  );
}
