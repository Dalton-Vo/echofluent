import { useEffect, useState } from 'react';
import {
  RefreshCw,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Link2,
  Trash2,
  Server,
  LoaderCircle,
  Copy,
} from 'lucide-react';
import { Card, Chip, SectionHeader } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import { buildSetupLink, pingSync, readSetupLink, syncNow, wipeRemote, type SyncResult } from '@/lib/sync';
import { cn } from '@/lib/utils';

/* Khu vực cấu hình đồng bộ giữa điện thoại và máy tính */

export function SyncSection() {
  const sync = useStore((s) => s.sync);
  const setSync = useStore((s) => s.setSync);
  const lastSyncAt = useStore((s) => s.lastSyncAt);

  const [showSecret, setShowSecret] = useState(false);
  const [busy, setBusy] = useState<'ping' | 'sync' | 'wipe' | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [fromLink, setFromLink] = useState(false);

  /* Mở app bằng link cài đặt thì tự điền sẵn, khỏi gõ tay trên điện thoại */
  useEffect(() => {
    const cfg = readSetupLink(window.location.hash);
    if (!cfg) return;
    setSync({ url: cfg.url, secret: cfg.secret });
    setFromLink(true);
    // xoá tham số khỏi thanh địa chỉ để mật khẩu không nằm trong lịch sử duyệt web
    window.history.replaceState(null, '', window.location.href.replace(/[?&]sync=[^&]+/, ''));
  }, [setSync]);

  const configured = Boolean(sync.url.trim() && sync.secret.trim());

  const run = async (kind: 'ping' | 'sync' | 'wipe') => {
    setBusy(kind);
    setResult(null);
    const r =
      kind === 'ping' ? await pingSync(sync.url)
      : kind === 'sync' ? await syncNow()
      : await wipeRemote();
    setResult(r);
    setBusy(null);
    setConfirmWipe(false);
  };

  const copyLink = async () => {
    const link = buildSetupLink(window.location.href, sync.url, sync.secret);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Sao chép link này rồi mở trên máy kia:', link);
    }
  };

  return (
    <section>
      <SectionHeader
        title="Đồng bộ giữa các thiết bị"
        desc="Học trên điện thoại, mở laptop là thấy đủ. Cần dựng một máy chủ nhỏ miễn phí, làm một lần."
      />

      <Card className="space-y-5">
        {fromLink && (
          <Chip tone="mint">
            <Check size={11} /> Đã tự điền từ link cài đặt
          </Chip>
        )}

        <div>
          <label className="label">Địa chỉ máy chủ đồng bộ</label>
          <input
            className="input font-mono text-xs"
            placeholder="https://echofluent-sync.<tên-của-bạn>.workers.dev"
            value={sync.url}
            onChange={(e) => setSync({ url: e.target.value.trim() })}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div>
          <label className="label">Mật khẩu đồng bộ</label>
          <div className="relative">
            <input
              className="input pr-11 font-mono text-xs"
              type={showSecret ? 'text' : 'password'}
              placeholder="mật khẩu bạn đặt khi chạy wrangler secret put"
              value={sync.secret}
              onChange={(e) => setSync({ secret: e.target.value })}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              aria-label={showSecret ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:text-ink"
            >
              {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-faint">
            Mật khẩu chỉ nằm trong trình duyệt này. Nó không có trong mã nguồn, không lên GitHub.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => run('sync')}
            disabled={!configured || busy !== null}
            className="btn-primary flex-1"
          >
            {busy === 'sync' ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            Đồng bộ ngay
          </button>
          <button
            type="button"
            onClick={() => run('ping')}
            disabled={!sync.url.trim() || busy !== null}
            className="btn-ghost"
          >
            {busy === 'ping' ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Server size={15} />
            )}
            Kiểm tra máy chủ
          </button>
        </div>

        {result && (
          <div
            className={cn(
              'flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm',
              result.status === 'ok'
                ? 'border-mint/30 bg-mint/[.07] text-ink'
                : result.status === 'off'
                  ? 'border-line bg-raised/40 text-muted'
                  : 'border-rose/30 bg-rose/[.07] text-ink',
            )}
          >
            {result.status === 'ok' ? (
              <Check size={15} className="mt-0.5 shrink-0 text-mint" />
            ) : (
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-rose" />
            )}
            <span>{result.message}</span>
          </div>
        )}

        {lastSyncAt && (
          <p className="text-xs text-faint">
            Lần đồng bộ gần nhất: {new Date(lastSyncAt).toLocaleString('vi-VN')}
          </p>
        )}

        {configured && (
          <div className="space-y-2 border-t border-line/60 pt-4">
            <button type="button" onClick={copyLink} className="btn-ghost w-full">
              {copied ? <Check size={15} className="text-mint" /> : <Link2 size={15} />}
              {copied ? 'Đã sao chép' : 'Sao chép link cài đặt cho máy khác'}
            </button>
            <p className="text-xs leading-relaxed text-faint">
              Mở link đó trên điện thoại là app tự điền địa chỉ và mật khẩu, khỏi gõ tay.{' '}
              <strong className="text-amber">Link có chứa mật khẩu</strong> — chỉ tự gửi cho chính
              mình, đừng đăng ở đâu.
            </p>
          </div>
        )}

        {configured && (
          <div className="rounded-xl border border-rose/25 bg-rose/[.05] p-3">
            {confirmWipe ? (
              <div className="space-y-2">
                <p className="text-sm text-ink">
                  Xoá bản trên máy chủ? Tiến độ trên máy này vẫn còn nguyên, và lần đồng bộ sau nó
                  sẽ được đẩy lên lại.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => run('wipe')}
                    className="btn flex-1 bg-rose text-white"
                  >
                    Xoá
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmWipe(false)}
                    className="btn-ghost flex-1"
                  >
                    Thôi
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmWipe(true)}
                className="btn-quiet w-full justify-start text-rose hover:bg-rose/10"
              >
                <Trash2 size={15} /> Xoá dữ liệu trên máy chủ
              </button>
            )}
          </div>
        )}

        <SetupGuide />
      </Card>
    </section>
  );
}

function SetupGuide() {
  return (
    <details className="rounded-xl border border-line/70 bg-raised/40">
      <summary className="cursor-pointer list-none px-3.5 py-3 text-sm font-semibold text-ink">
        Chưa có máy chủ? Dựng trong 4 lệnh →
      </summary>
      <div className="space-y-3 border-t border-line/60 px-3.5 py-3 text-xs leading-relaxed text-muted">
        <p>
          Chạy trong thư mục <code className="text-ink">worker/</code> của dự án. Miễn phí, và
          Cloudflare cho 100.000 lượt gọi mỗi ngày — dùng cá nhân thì không bao giờ chạm tới.
        </p>
        <ol className="space-y-2">
          <li>
            <strong className="text-ink">1.</strong> <code>npx wrangler login</code>
            <span className="block text-faint">
              Mở trình duyệt để đăng nhập Cloudflare. Chưa có tài khoản thì đăng ký ngay ở đó, miễn phí.
            </span>
          </li>
          <li>
            <strong className="text-ink">2.</strong> <code>npx wrangler deploy</code>
            <span className="block text-faint">
              Tự tạo kho lưu trữ và in ra địa chỉ dạng <em>https://echofluent-sync.…workers.dev</em>.
              Chép địa chỉ đó vào ô bên trên.
            </span>
          </li>
          <li>
            <strong className="text-ink">3.</strong> <code>npx wrangler secret put SYNC_SECRET</code>
            <span className="block text-faint">
              Nó sẽ hỏi mật khẩu — gõ một chuỗi bạn tự nghĩ ra, rồi điền đúng chuỗi đó vào ô mật
              khẩu bên trên.
            </span>
          </li>
          <li>
            <strong className="text-ink">4.</strong> Bấm <em>Kiểm tra máy chủ</em> rồi{' '}
            <em>Đồng bộ ngay</em>. Xong. Trên máy kia thì dùng link cài đặt cho nhanh.
          </li>
        </ol>
        <p className="border-t border-line/60 pt-2">
          Đồng bộ chạy tự động lúc mở app và lúc rời app. Nút bấm tay chỉ dùng khi bạn muốn chắc
          chắn ngay lập tức.
        </p>
      </div>
    </details>
  );
}
