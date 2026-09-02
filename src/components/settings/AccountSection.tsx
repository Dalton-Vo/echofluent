import { useState } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  LogIn,
  AlertTriangle,
  Smartphone,
  Wand2,
} from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import { buildSyncCode, readSyncCode, randomSecret } from '@/lib/sync';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  "Tài khoản" — mang tiến độ sang máy khác
 * ============================================================================
 *
 *  Nói thẳng để khỏi hiểu nhầm: app này KHÔNG có tài khoản theo nghĩa thường.
 *  Không có máy chủ nào giữ email hay mật khẩu của bạn. Thay vào đó là một mã
 *  duy nhất, dán vào máy mới là tiến độ về đủ.
 *
 *  Chọn cách này có chủ ý: tài khoản thật đòi máy chủ phải giữ mật khẩu người
 *  dùng, mà giữ mật khẩu cho tử tế là việc dễ làm sai tới mức nguy hiểm. Một
 *  mã ngẫu nhiên đủ dài thì không có gì để lộ ngoài chính nó, và bạn tự giữ.
 * ========================================================================== */

export function AccountSection() {
  const sync = useStore((s) => s.sync);
  const setSync = useStore((s) => s.setSync);

  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pasteOk, setPasteOk] = useState(false);

  const code = buildSyncCode(sync.url, sync.secret);
  const ready = Boolean(code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShowCode(true); // không copy được thì hiện ra cho chép tay
    }
  };

  const signIn = () => {
    setPasteError(null);
    setPasteOk(false);
    const cfg = readSyncCode(pasted);
    if (!cfg) {
      setPasteError(
        'Mã không hợp lệ. Kiểm tra xem đã chép đủ cả mã chưa — nó bắt đầu bằng “EF1.”.',
      );
      return;
    }
    setSync(cfg);
    setPasted('');
    setPasteOk(true);
  };

  return (
    <section>
      <SectionHeader
        title="Mang tiến độ sang máy khác"
        desc="Một mã duy nhất thay cho đăng nhập. Dán vào máy mới là học tiếp đúng chỗ đang dở."
      />

      <Card className="space-y-5">
        {ready ? (
          <>
            <div>
              <label className="label">Mã của bạn</label>
              <div className="flex gap-2">
                <input
                  readOnly
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onFocus={(e) => e.currentTarget.select()}
                  className="input flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="btn-quiet px-3"
                  aria-label={showCode ? 'Ẩn mã' : 'Hiện mã'}
                >
                  {showCode ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button type="button" onClick={copy} className="btn-ghost px-3">
                  {copied ? <Check size={15} className="text-mint" /> : <Copy size={15} />}
                  {copied ? 'Đã chép' : 'Chép'}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-amber/30 bg-amber/[.06] p-3.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-xs leading-relaxed text-muted">
                <b className="text-amber">Mã này chính là mật khẩu.</b> Ai cầm được nó là đọc và
                ghi được tiến độ của bạn. Gửi cho chính mình thì được, đừng đăng lên chỗ công
                khai.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-raised/40 p-3.5">
              <Smartphone size={16} className="mt-0.5 shrink-0 text-faint" />
              <p className="text-xs leading-relaxed text-muted">
                Trên máy mới: mở app → Cài đặt → mục này → dán mã vào ô bên dưới. Tiến độ hai
                bên được <b>trộn</b> chứ không ghi đè, nên lỡ học ở cả hai máy cũng không mất
                bên nào.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5 rounded-xl border border-violet/25 bg-violet/[.06] p-3.5">
              <KeyRound size={16} className="mt-0.5 shrink-0 text-violet" />
              <div className="text-xs leading-relaxed text-muted">
                <p className="mb-2 font-semibold text-ink">Chưa lập chỗ lưu — làm một lần thôi</p>
                <p className="mb-2">
                  Tiến độ cần một chỗ để gửi lên. App dùng Cloudflare Worker, miễn phí và chạy
                  bằng chính tài khoản của bạn. Chạy hai lệnh này trong thư mục dự án:
                </p>
                <pre className="overflow-x-auto rounded-lg bg-bg/60 p-2.5 font-mono text-[11px]">
{`cd worker
npx wrangler secret put SYNC_SECRET
npx wrangler deploy`}
                </pre>
                <p className="mt-2">
                  Lệnh giữa sẽ hỏi mật khẩu — bấm nút bên dưới để lấy một mật khẩu ngẫu nhiên
                  đủ mạnh, rồi dán vào cả hai chỗ.
                </p>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="acc-url">
                Địa chỉ Worker sau khi deploy
              </label>
              <input
                id="acc-url"
                type="url"
                value={sync.url}
                onChange={(e) => setSync({ url: e.target.value.trim() })}
                placeholder="https://echofluent-sync.<tên>.workers.dev"
                spellCheck={false}
                className="input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="label" htmlFor="acc-secret">
                Mật khẩu đồng bộ
              </label>
              <div className="flex gap-2">
                <input
                  id="acc-secret"
                  type="text"
                  value={sync.secret}
                  onChange={(e) => setSync({ secret: e.target.value.trim() })}
                  placeholder="dán mật khẩu vừa đặt ở lệnh trên"
                  spellCheck={false}
                  autoComplete="off"
                  className="input flex-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => setSync({ secret: randomSecret() })}
                  className="btn-ghost px-3"
                  title="Sinh mật khẩu ngẫu nhiên"
                >
                  <Wand2 size={15} /> Sinh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* dán mã từ máy cũ */}
        <div className="border-t border-line/60 pt-4">
          <label className="label" htmlFor="acc-paste">
            Đã có mã từ máy khác?
          </label>
          <div className="flex gap-2">
            <input
              id="acc-paste"
              type="text"
              value={pasted}
              onChange={(e) => {
                setPasted(e.target.value);
                setPasteError(null);
                setPasteOk(false);
              }}
              placeholder="EF1.…"
              spellCheck={false}
              autoComplete="off"
              className="input flex-1 font-mono text-xs"
            />
            <button
              type="button"
              onClick={signIn}
              disabled={!pasted.trim()}
              className="btn-primary px-4 disabled:opacity-40"
            >
              <LogIn size={15} /> Dùng mã
            </button>
          </div>

          {pasteError && (
            <p className={cn('mt-2 flex items-start gap-2 text-xs leading-relaxed text-rose')}>
              <AlertTriangle size={13} className="mt-px shrink-0" />
              {pasteError}
            </p>
          )}
          {pasteOk && (
            <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-mint">
              <Check size={13} className="mt-px shrink-0" />
              Xong. Tiến độ sẽ được kéo về ngay, và trộn với những gì đã học trên máy này.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
