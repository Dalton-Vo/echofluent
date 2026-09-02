import { useEffect, useState } from 'react';
import {
  Sparkles,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  LoaderCircle,
  ExternalLink,
  ShieldCheck,
  Volume2,
  Square,
} from 'lucide-react';
import { Card, SectionHeader, Toggle } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import { pingAi, isAiReady, DEFAULT_MODEL } from '@/lib/gemini';
import { AI_VOICES, DEFAULT_AI_VOICE, clearTtsCache, ttsCacheSize } from '@/lib/tts';
import { useSpeaker } from '@/hooks/useSpeech';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  Cấu hình chấm phát âm bằng AI
 *
 *  Về khoá API, nói thẳng để khỏi hiểu nhầm: khoá dán vào đây chỉ nằm trong
 *  localStorage của đúng trình duyệt này. Nó KHÔNG đi vào mã nguồn, KHÔNG lên
 *  GitHub, và cũng không nằm trong dữ liệu đồng bộ giữa các máy (xem danh sách
 *  trường ở `snapshot()` trong lib/sync.ts — `ai` cố tình bị bỏ ra ngoài).
 * ========================================================================== */

const MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash — cân bằng, khuyên dùng' },
  { id: 'gemini-3.5-transcribe', label: 'Gemini 3.5 Transcribe — nghe chuẩn nhất' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash — ổn định, rẻ' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash — nhanh' },
];

export function AiSection() {
  const ai = useStore((s) => s.ai);
  const setAi = useStore((s) => s.setAi);

  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [cached, setCached] = useState(0);
  const { say, stop, speaking } = useSpeaker();

  useEffect(() => {
    void ttsCacheSize().then(setCached);
  }, [ai.voice, ai.voiceName]);

  const configured = isAiReady(ai);

  const test = async () => {
    setBusy(true);
    setResult(null);
    setResult(await pingAi(ai));
    setBusy(false);
  };

  return (
    <section>
      <SectionHeader
        title="Chấm phát âm bằng AI"
        desc="Gửi bản ghi âm cho Google Gemini để chấm điểm từng từ, kèm phiên âm đúng và phiên âm bạn vừa đọc."
      />

      <Card className="space-y-5">
        <Toggle
          checked={ai.enabled}
          onChange={(v) => setAi({ enabled: v })}
          label="Bật chấm phát âm"
          hint="Tắt thì app chạy hoàn toàn ngoại tuyến, chỉ chấm bằng cách so chữ như cũ."
        />

        {ai.enabled && (
          <>
            <div>
              <label className="label" htmlFor="ai-key">
                Khoá Google AI Studio
              </label>
              <div className="flex gap-2">
                <input
                  id="ai-key"
                  type={showKey ? 'text' : 'password'}
                  value={ai.key}
                  onChange={(e) => setAi({ key: e.target.value.trim() })}
                  placeholder="AQ.… hoặc AIza…"
                  spellCheck={false}
                  autoComplete="off"
                  className="input flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="btn-quiet px-3"
                  aria-label={showKey ? 'Ẩn khoá' : 'Hiện khoá'}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-faint">
                Lấy khoá miễn phí ở{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-violet underline underline-offset-2"
                >
                  aistudio.google.com/apikey <ExternalLink size={10} className="inline" />
                </a>
                . Gói miễn phí đủ cho vài trăm lượt chấm mỗi ngày.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-mint/25 bg-mint/[.05] p-3.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-mint" />
              <p className="text-xs leading-relaxed text-muted">
                Khoá này chỉ nằm trong trình duyệt của máy đang dùng. Nó không được đưa vào mã
                nguồn, không lên GitHub, và cũng không nằm trong dữ liệu đồng bộ sang máy khác —
                nên nếu bạn dùng cả điện thoại thì phải dán lại một lần ở đó.
              </p>
            </div>

            <div>
              <label className="label" htmlFor="ai-model">
                Model
              </label>
              <select
                id="ai-model"
                value={ai.model || DEFAULT_MODEL}
                onChange={(e) => setAi({ model: e.target.value })}
                className="input w-full text-sm"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ---------------- giọng đọc ---------------- */}
            <div className="space-y-3.5 rounded-xl border border-line/70 bg-raised/30 p-4">
              <Toggle
                checked={ai.voice}
                onChange={(v) => setAi({ voice: v })}
                label="Dùng giọng đọc của Gemini"
                hint="Giọng máy của hệ điều hành đọc đúng chữ nhưng nhịp đều đều. Nhại theo giọng đó thì nhại luôn cả cái đều đều — hỏng đúng thứ bài shadowing rèn."
              />

              {ai.voice && (
                <>
                  <div>
                    <label className="label" htmlFor="ai-voice">
                      Chọn giọng
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="ai-voice"
                        value={ai.voiceName || DEFAULT_AI_VOICE}
                        onChange={(e) => setAi({ voiceName: e.target.value })}
                        className="input flex-1 text-sm"
                      >
                        {AI_VOICES.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!configured}
                        onClick={() =>
                          speaking
                            ? stop()
                            : say("No blockers on my end, although I'm still waiting on the API key.")
                        }
                        className="btn-ghost px-3 disabled:opacity-40"
                      >
                        {speaking ? <Square size={14} /> : <Volume2 size={15} />}
                        {speaking ? 'Dừng' : 'Nghe thử'}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-faint">
                    Câu đã đọc được lưu lại trong máy nên lần sau phát ngay, không gọi mạng và
                    không tốn hạn mức. Hiện đã lưu <b className="text-muted">{cached}</b> câu.
                    {cached > 0 && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={async () => {
                            await clearTtsCache();
                            setCached(0);
                          }}
                          className="underline underline-offset-2 hover:text-ink"
                        >
                          Xoá bộ nhớ đệm
                        </button>
                      </>
                    )}
                  </p>

                  <p className="rounded-lg bg-amber/10 px-3 py-2 text-xs leading-relaxed text-amber">
                    Gói miễn phí giới hạn số lượt khá chặt. Hết lượt thì app tự quay về giọng
                    của hệ điều hành chứ không im lặng — bạn vẫn học tiếp bình thường.
                  </p>
                </>
              )}
            </div>

            <details className="group">
              <summary className="cursor-pointer text-xs font-semibold text-muted hover:text-ink">
                Cách an toàn hơn: để khoá ở máy chủ
              </summary>
              <div className="mt-2.5 space-y-2.5">
                <p className="text-xs leading-relaxed text-faint">
                  Nếu bạn mở app trên máy dùng chung, đừng để khoá trong trình duyệt. Deploy
                  Worker kèm khoá rồi điền địa chỉ vào đây và để trống ô khoá bên trên — khi đó
                  trình duyệt không giữ gì cả.
                </p>
                <pre className="overflow-x-auto rounded-lg bg-bg/60 p-2.5 font-mono text-[11px] text-muted">
{`cd worker
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy`}
                </pre>
                <input
                  type="url"
                  value={ai.proxyUrl}
                  onChange={(e) => setAi({ proxyUrl: e.target.value.trim() })}
                  placeholder="https://echofluent-sync.<tên>.workers.dev"
                  spellCheck={false}
                  className="input w-full font-mono text-xs"
                />
              </div>
            </details>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={test}
                disabled={busy || !configured}
                className="btn-ghost disabled:opacity-40"
              >
                {busy ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                Kiểm tra kết nối
              </button>
              {!configured && (
                <span className="text-xs text-faint">Dán khoá hoặc địa chỉ Worker trước đã.</span>
              )}
            </div>

            {result && (
              <p
                className={cn(
                  'flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed',
                  result.ok
                    ? 'bg-mint/10 text-mint'
                    : 'bg-rose/10 text-rose',
                )}
              >
                {result.ok ? (
                  <Check size={14} className="mt-px shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="mt-px shrink-0" />
                )}
                {result.message}
              </p>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
