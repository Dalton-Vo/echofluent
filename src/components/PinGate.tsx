import { useEffect, useRef, useState } from 'react';
import { Lock, Delete, LoaderCircle } from 'lucide-react';
import { GATE, derive } from '@/gate.config';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  LỚP KHOÁ PIN
 *
 *  Chỉ là tấm rèm che (xem chú thích đầy đủ trong src/gate.config.ts), nhưng nó
 *  làm đúng việc cần làm: người lạ tình cờ mở link sẽ không thấy gì.
 *
 *  Mở khoá xong thì trình duyệt nhớ luôn, lần sau vào không phải nhập lại.
 * ========================================================================== */

const STORAGE_KEY = 'echofluent-gate';
const PIN_LENGTH_MAX = 12;

export function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(!GATE.enabled);
  const [checking, setChecking] = useState(GATE.enabled);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Đã mở khoá ở lần trước chưa? */
  useEffect(() => {
    if (!GATE.enabled) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === GATE.hash) setUnlocked(true);
    } catch {
      /* trình duyệt chặn localStorage — cứ hỏi lại mã */
    }
    setChecking(false);
  }, []);

  const submit = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const got = await derive(value, GATE.salt, GATE.iterations);
      if (got === GATE.hash) {
        try {
          localStorage.setItem(STORAGE_KEY, GATE.hash);
        } catch {
          /* không lưu được thì lần sau nhập lại, không sao */
        }
        setUnlocked(true);
        return;
      }
      setError(true);
      setAttempts((n) => n + 1);
      setPin('');
    } finally {
      setBusy(false);
    }
  };

  if (checking) return null;
  if (unlocked) return <>{children}</>;

  /* Sai nhiều lần thì chờ lâu dần — chặn kiểu dò mò bằng tay */
  const cooldown = attempts >= 5;

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-5">
      <div className="w-full max-w-xs text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-mint/12 text-mint">
          <Lock size={24} />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-ink">EchoFluent</h1>
        <p className="mt-1 text-sm text-muted">Nhập mã để vào</p>

        {/* ô hiển thị số đã nhập */}
        <div
          className={cn(
            'mt-6 flex justify-center gap-2',
            error && 'animate-[pop_.3s_ease]',
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {Array.from({ length: Math.max(6, pin.length) }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-3 w-3 rounded-full transition-colors',
                error ? 'bg-rose' : i < pin.length ? 'bg-mint' : 'bg-line',
              )}
            />
          ))}
        </div>

        {/* input thật, ẩn đi — để bàn phím số của điện thoại bật lên */}
        <input
          ref={inputRef}
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={pin}
          disabled={busy || cooldown}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH_MAX);
            setPin(v);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && pin.length >= 4) submit(pin);
          }}
          className="sr-only"
          aria-label="Mã PIN"
        />

        {/* bàn phím số — bấm được cả trên máy tính lẫn điện thoại */}
        <div className="mt-7 grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <Key key={d} onClick={() => setPin((p) => (p + d).slice(0, PIN_LENGTH_MAX))} disabled={busy || cooldown}>
              {d}
            </Key>
          ))}
          <Key onClick={() => setPin('')} disabled={busy || cooldown} muted>
            ✕
          </Key>
          <Key onClick={() => setPin((p) => (p + '0').slice(0, PIN_LENGTH_MAX))} disabled={busy || cooldown}>
            0
          </Key>
          <Key onClick={() => setPin((p) => p.slice(0, -1))} disabled={busy || cooldown} muted>
            <Delete size={18} />
          </Key>
        </div>

        <button
          type="button"
          disabled={pin.length < 4 || busy || cooldown}
          onClick={() => submit(pin)}
          className="btn-primary mt-4 w-full py-3"
        >
          {busy ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Đang kiểm tra…
            </>
          ) : (
            'Mở khoá'
          )}
        </button>

        {error && !cooldown && (
          <p className="mt-3 text-sm font-semibold text-rose">Mã không đúng. Thử lại.</p>
        )}
        {cooldown && (
          <p className="mt-3 text-sm text-amber">
            Sai quá nhiều lần. Tải lại trang để thử tiếp.
          </p>
        )}

        <p className="mt-8 text-[11px] leading-relaxed text-faint">
          Quên mã? Chạy <code className="text-muted">npm run set-pin</code> trong thư mục dự án rồi
          push lại.
        </p>
      </div>
    </div>
  );
}

function Key({
  children,
  onClick,
  disabled,
  muted,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid h-14 place-items-center rounded-xl border border-line bg-raised/50 text-lg font-bold transition active:scale-95 disabled:opacity-40',
        muted ? 'text-muted' : 'text-ink',
        'hover:border-mint/40 hover:bg-raised',
      )}
    >
      {children}
    </button>
  );
}
