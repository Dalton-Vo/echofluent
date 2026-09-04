import { useEffect, useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  Download,
  Upload,
  Trash2,
  Check,
  AlertTriangle,
  FileDown,
} from 'lucide-react';
import { Card, Segmented, SectionHeader, Toggle, Chip } from '@/components/ui/primitives';
import { SyncSection } from '@/components/settings/SyncSection';
import { AccountSection } from '@/components/settings/AccountSection';
import { AiSection } from '@/components/settings/AiSection';
import { NudgeSection } from '@/components/settings/NudgeSection';
import { WarmupSection } from '@/components/settings/WarmupSection';
import { MicCheckSection } from '@/components/settings/MicCheckSection';
import { useStore } from '@/store/useStore';
import { sanitizeBackup } from '@/lib/backup';
import { getEnglishVoices, onVoicesReady, speak } from '@/lib/speech';
import { CHUNK_BY_ID } from '@/data/chunks';
import { REFLEX_BY_ID } from '@/data/reflex';
import { MEMORY_HOOKS } from '@/data/memoryHooks';
import { DOMAIN_LABEL, type Domain, type Level } from '@/types';
import { cn } from '@/lib/utils';

const LEVELS: Level[] = ['A2', 'B1', 'B2', 'C1'];
const DOMAINS: Domain[] = ['work', 'tech', 'daily', 'social'];

export function Settings() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const resetAll = useStore((s) => s.resetAll);

  const srs = useStore((s) => s.srs);
  const notes = useStore((s) => s.notes);
  const lastBackupAt = useStore((s) => s.lastBackupAt);
  const markBackedUp = useStore((s) => s.markBackedUp);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [imported, setImported] = useState<string | null>(null);
  const [exported, setExported] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => onVoicesReady(() => setVoices(getEnglishVoices())), []);

  /**
   * Xuất thẻ Anki. Ba cột: mặt trước (gợi ý tiếng Việt) / mặt sau (câu tiếng Anh)
   * / phần bổ sung (ví dụ + mẹo nhớ + ghi chú của bạn).
   * Mặt trước cố ý là một TÌNH HUỐNG chứ không phải bài dịch từ — vì bạn cần
   * bật ra cụm khi gặp tình huống, không phải khi nhìn thấy từ tiếng Việt.
   */
  const exportAnki = () => {
    const esc = (s: string) => s.replace(/[\t\r\n]+/g, ' ').trim();
    const rows: string[] = [];

    for (const [id, card] of Object.entries(srs)) {
      if (card.kind === 'chunk') {
        const c = CHUNK_BY_ID.get(id);
        if (!c) continue;
        const h = MEMORY_HOOKS[id];
        const extra = [
          `<i>${esc(c.example)}</i>`,
          esc(c.exampleVi),
          h?.hook ? `💡 ${esc(h.hook)}` : '',
          h?.pitfall ? `⚠️ ${esc(h.pitfall)}` : '',
          h?.contrast ? `⚖️ ${esc(h.contrast)}` : '',
          notes[id] ? `✍️ ${esc(notes[id])}` : '',
        ]
          .filter(Boolean)
          .join('<br>');
        rows.push([esc(c.vi), esc(c.en), extra].join('\t'));
      } else {
        const r = REFLEX_BY_ID.get(id);
        if (!r) continue;
        rows.push([esc(r.cueVi), esc(r.model), esc(r.modelVi)].join('\t'));
      }
    }

    if (!rows.length) {
      setExported('empty');
      return;
    }

    // BOM để Anki trên Windows đọc đúng tiếng Việt
    const blob = new Blob([`﻿${rows.join('\n')}\n`], {
      type: 'text/tab-separated-values;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echofluent-anki-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(`${rows.length}`);
  };

  const exportData = () => {
    const raw = localStorage.getItem('echofluent-v1') ?? '{}';

    // Bỏ thông tin đăng nhập đồng bộ ra khỏi file sao lưu. File này người ta hay
    // gửi qua Zalo, lưu Drive, đính kèm email — mật khẩu máy chủ không được đi theo.
    const cleaned = sanitizeBackup(raw);

    const blob = new Blob([cleaned], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echofluent-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    markBackedUp();
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        JSON.parse(text); // kiểm tra hợp lệ trước khi ghi đè
        localStorage.setItem('echofluent-v1', text);
        setImported('ok');
        window.setTimeout(() => window.location.reload(), 700);
      } catch {
        setImported('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <div className="animate-fade-up flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-raised text-muted">
          <SettingsIcon size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Cài đặt</h1>
          <p className="text-sm text-muted">Điều chỉnh cho vừa tai và vừa sức bạn.</p>
        </div>
      </div>

      {/* ------------------------- hồ sơ ------------------------- */}
      <section>
        <SectionHeader title="Hồ sơ" />
        <Card className="space-y-5">
          <div>
            <label className="label">Tên hiển thị</label>
            <input
              className="input"
              value={settings.name}
              placeholder="Thịnh"
              onChange={(e) => setSettings({ name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Trình độ hiện tại</label>
            <Segmented
              value={settings.level}
              onChange={(v) => setSettings({ level: v })}
              options={LEVELS.map((l) => ({ value: l, label: l }))}
            />
            <p className="mt-1.5 text-xs text-faint">
              Quyết định độ khó của MỌI màn luyện — phản xạ, luyện nghe, nói đuổi, nhập vai.
              Bạn chỉ nhận bài tới đúng mức này, không cao hơn. Chọn cao hơn nếu thấy bài quá dễ.
            </p>
          </div>

          <div>
            <label className="label">Mục tiêu mỗi ngày</label>
            <Segmented
              value={String(settings.dailyGoalMin)}
              onChange={(v) => setSettings({ dailyGoalMin: Number(v) })}
              options={[
                { value: '10', label: '10′' },
                { value: '15', label: '15′' },
                { value: '25', label: '25′' },
                { value: '40', label: '40′' },
              ]}
            />
          </div>

          <div>
            <label className="label">Bối cảnh ưu tiên</label>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => {
                const on = settings.focusDomains.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const next = on
                        ? settings.focusDomains.filter((x) => x !== d)
                        : [...settings.focusDomains, d];
                      setSettings({ focusDomains: next.length ? next : DOMAINS });
                    }}
                    className={cn(
                      'rounded-xl border px-3.5 py-2 text-sm font-semibold transition',
                      on
                        ? 'border-mint/50 bg-mint/10 text-mint'
                        : 'border-line bg-raised/40 text-muted hover:text-ink',
                    )}
                  >
                    {on && <Check size={13} className="mr-1 inline" />}
                    {DOMAIN_LABEL[d]}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </section>

      {/* ------------------------- giọng nói ------------------------- */}
      <section>
        <SectionHeader
          title="Giọng đọc & tốc độ"
          desc="Giọng lấy từ hệ điều hành nên không cần internet."
        />
        <Card className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label !mb-0">Tốc độ đọc</label>
              <span className="font-mono text-xs text-mint">{settings.rate.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min={0.6}
              max={1.5}
              step={0.05}
              value={settings.rate}
              onChange={(e) => setSettings({ rate: Number(e.target.value) })}
              className="w-full accent-[rgb(var(--c-mint))]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-faint">
              <span>chậm để bắt kịp</span>
              <span>tốc độ thật</span>
              <span>nhanh để thử thách</span>
            </div>
            <button
              type="button"
              onClick={() =>
                speak(
                  "Alright, so off the top of my head, I'd say we could ship it by Friday.",
                  { rate: settings.rate, voiceURI: settings.voiceURI },
                )
              }
              className="btn-ghost mt-3 w-full"
            >
              <Volume2 size={15} /> Nghe thử ở tốc độ này
            </button>
          </div>

          <div>
            <label className="label">Giọng</label>
            {voices.length === 0 ? (
              <p className="rounded-xl border border-amber/30 bg-amber/10 p-3 text-xs text-amber">
                Chưa tìm thấy giọng tiếng Anh nào. Trên macOS: System Settings → Accessibility →
                Spoken Content → System Voice → Manage Voices, tải thêm giọng English.
              </p>
            ) : (
              <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {voices.map((v) => (
                  <div
                    key={v.voiceURI}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-2.5 transition',
                      settings.voiceURI === v.voiceURI
                        ? 'border-mint/50 bg-mint/10'
                        : 'border-line bg-raised/30',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSettings({ voiceURI: v.voiceURI })}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-semibold text-ink">{v.name}</span>
                      <span className="block text-[11px] text-faint">{v.lang}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Nghe thử ${v.name}`}
                      onClick={() =>
                        speak("Hey, how's it going?", { voiceURI: v.voiceURI, rate: settings.rate })
                      }
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-raised text-muted transition hover:text-mint"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* ------------------------- cách luyện ------------------------- */}
      <section>
        <SectionHeader title="Cách luyện" />
        <Card className="divide-y divide-line/60">
          <Toggle
            checked={settings.strictTimer}
            onChange={(v) => setSettings({ strictTimer: v })}
            label="Đồng hồ ép phản xạ"
            hint="Hiện vòng đếm ngược khi tới lượt bạn nói. Đây là thứ tạo ra áp lực giống đời thật."
          />
          <Toggle
            checked={settings.useMic}
            onChange={(v) => setSettings({ useMic: v })}
            label="Tự bật micro khi tới lượt"
            hint="Tắt nếu bạn muốn tự bấm nút mỗi lần — hữu ích khi đang ở nơi ồn."
          />
          <Toggle
            checked={settings.autoPlay}
            onChange={(v) => setSettings({ autoPlay: v })}
            label="Tự phát âm thanh"
            hint="Tự đọc câu hỏi và câu mẫu mà không cần bấm."
          />
          <Toggle
            checked={settings.showVi}
            onChange={(v) => setSettings({ showVi: v })}
            label="Hiện bản dịch tiếng Việt"
            hint="Khi đã quen, hãy TẮT đi. Không đọc tiếng Việt là bước lớn nhất để bỏ thói quen dịch trong đầu."
          />
          <Toggle
            checked={settings.theme === 'light'}
            onChange={(v) => {
              const t = v ? 'light' : 'dark';
              setSettings({ theme: t });
              document.documentElement.dataset.theme = t;
            }}
            label="Giao diện sáng"
            hint="Mặc định là nền tối cho đỡ mỏi mắt khi luyện buổi tối."
          />
        </Card>
      </section>

      <MicCheckSection />

      <WarmupSection />

      <NudgeSection />

      <AiSection />

      <AccountSection />

      <SyncSection />

      {/* ------------------------- xuất thẻ Anki ------------------------- */}
      <section>
        <SectionHeader
          title="Mang cụm ra khỏi app"
          desc="Xuất bộ thẻ đang ôn sang Anki để ôn cả lúc không mở app."
        />
        <Card className="space-y-3">
          <button type="button" onClick={exportAnki} className="btn-ghost w-full">
            <FileDown size={15} /> Xuất {Object.keys(srs).length} thẻ sang Anki
          </button>

          {exported === 'empty' && (
            <Chip tone="amber">
              <AlertTriangle size={11} /> Bộ thẻ còn trống — làm vài bài trước đã
            </Chip>
          )}
          {exported && exported !== 'empty' && (
            <Chip tone="mint">
              <Check size={11} /> Đã xuất {exported} thẻ
            </Chip>
          )}

          <div className="rounded-xl border border-line/70 bg-raised/40 p-3.5 text-xs leading-relaxed text-muted">
            <strong className="text-ink">Cách nhập vào Anki:</strong> File → Import → chọn file vừa
            tải → kiểu phân tách <em>Tab</em> → gán 3 cột lần lượt là{' '}
            <em>Front / Back / phần ghi chú</em>.
            <br />
            Mặt trước là một <strong className="text-ink">tình huống tiếng Việt</strong>, không phải
            bài dịch từ — vì thứ bạn cần là bật ra cụm khi gặp tình huống.
          </div>
        </Card>
      </section>

      {/* ------------------------- dữ liệu ------------------------- */}
      <section>
        <SectionHeader
          title="Dữ liệu"
          desc="Toàn bộ tiến độ nằm trong trình duyệt này. Xoá dữ liệu trình duyệt là mất — nên sao lưu định kỳ."
        />
        <Card className="space-y-3">
          <div className="rounded-xl border border-line/70 bg-raised/40 p-3.5 text-xs leading-relaxed text-muted">
            <strong className="text-ink">Tiến độ được lưu ở đâu:</strong> trong bộ nhớ của
            <em> chính trình duyệt này, trên chính tên miền này</em>. Nghĩa là điện thoại và máy
            tính là hai kho riêng, bản trên mạng và bản localhost cũng là hai kho riêng — chúng
            không tự đồng bộ với nhau.
            <br />
            <br />
            Muốn chuyển sang máy khác: tải file sao lưu ở đây, rồi mở app trên máy kia và bấm
            “Khôi phục từ file”. Hoặc bật đồng bộ ở trên để khỏi phải làm tay.
            <br />
            File sao lưu <strong className="text-ink">không chứa</strong> mật khẩu đồng bộ, nên gửi
            qua chat hay lưu Drive đều an toàn.
            {lastBackupAt && (
              <>
                <br />
                <br />
                <span className="text-mint">
                  Lần sao lưu gần nhất: {new Date(lastBackupAt).toLocaleDateString('vi-VN')}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportData} className="btn-ghost flex-1">
              <Download size={15} /> Tải file sao lưu
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-ghost flex-1"
            >
              <Upload size={15} /> Khôi phục từ file
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importData(f);
              }}
            />
          </div>

          {imported === 'ok' && (
            <Chip tone="mint">
              <Check size={11} /> Khôi phục xong, đang tải lại…
            </Chip>
          )}
          {imported === 'error' && (
            <Chip tone="rose">
              <AlertTriangle size={11} /> File không hợp lệ
            </Chip>
          )}

          <div className="rounded-xl border border-rose/25 bg-rose/[.05] p-4">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="btn-quiet w-full justify-start text-rose hover:bg-rose/10"
              >
                <Trash2 size={15} /> Xoá toàn bộ tiến độ và làm lại từ đầu
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-ink">
                  Chắc chưa? XP, chuỗi ngày, bộ thẻ ôn và mọi thống kê sẽ mất hết. Không hoàn tác
                  được.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetAll();
                      setConfirmReset(false);
                    }}
                    className="btn flex-1 bg-rose text-white"
                  >
                    Xoá hết
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="btn-ghost flex-1"
                  >
                    Thôi
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      <p className="pb-4 text-center text-xs leading-relaxed text-faint">
        EchoFluent chạy hoàn toàn trên máy bạn — không tài khoản, không gửi dữ liệu đi đâu.
        <br />
        Muốn thêm nội dung? Sửa các file trong <code className="text-muted">src/data/</code>.
      </p>
    </div>
  );
}
