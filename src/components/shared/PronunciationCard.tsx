import { useState } from 'react';
import { LoaderCircle, Sparkles, Volume2, ChevronDown, AlertTriangle } from 'lucide-react';
import { SpeakButton } from '@/components/shared/SpeakButton';
import type { PronunciationReport, WordScore } from '@/lib/gemini';
import { ipaOf } from '@/data/phonemes';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  Bảng điểm phát âm — cách trình bày mượn từ ELSA
 *
 *  Điều làm ELSA hữu ích không nằm ở con số tổng, mà ở chỗ nó chỉ ĐÚNG TỪ nào
 *  sai và sai ra sao. Một điểm "72/100" chẳng giúp ai sửa được gì; còn "chữ
 *  *three* bạn phát ra thành /triː/, phải để lưỡi giữa hai hàm răng" thì sửa
 *  được ngay trong lần đọc kế tiếp. Nên trọng tâm màn này là dải từ tô màu,
 *  bấm vào từng từ để xem phiên âm đúng và phiên âm mình vừa đọc.
 * ========================================================================== */

/** Ngưỡng màu giống ELSA: xanh đạt, vàng tạm, đỏ phải sửa */
function toneOf(score: number): 'mint' | 'amber' | 'rose' {
  if (score >= 80) return 'mint';
  if (score >= 55) return 'amber';
  return 'rose';
}

const TONE_TEXT = { mint: 'text-mint', amber: 'text-amber', rose: 'text-rose' } as const;
const TONE_BG = {
  mint: 'bg-mint/12 text-mint border-mint/35',
  amber: 'bg-amber/12 text-amber border-amber/35',
  rose: 'bg-rose/12 text-rose border-rose/35',
} as const;

export function PronunciationCard({
  report,
  busy,
  error,
  onRetry,
}: {
  report: PronunciationReport | null;
  busy: boolean;
  error: string | null;
  onRetry?: () => void;
}) {
  const [openWord, setOpenWord] = useState<number | null>(null);

  if (busy) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-violet/25 bg-violet/[.06] px-4 py-4">
        <LoaderCircle size={18} className="animate-spin text-violet" />
        <div>
          <p className="text-sm font-semibold text-ink">AI đang nghe lại bản ghi…</p>
          <p className="text-xs text-muted">Thường mất 3–6 giây.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber/30 bg-amber/[.06] px-4 py-3.5">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber">
          <AlertTriangle size={15} /> Chưa chấm được
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-quiet mt-2 px-3 py-1.5 text-xs">
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (!report) return null;

  const tone = toneOf(report.overall);

  return (
    <div className="animate-fade-up space-y-4 rounded-xl border border-violet/25 bg-violet/[.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet">
          <Sparkles size={12} /> AI chấm phát âm
        </span>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-quiet px-2 py-1 text-[11px]">
            Chấm lại
          </button>
        )}
      </div>

      {/* điểm tổng + bốn cột điểm thành phần */}
      <div className="flex flex-wrap items-center gap-5">
        <ScoreDial score={report.overall} tone={tone} />
        <div className="grid min-w-[190px] flex-1 grid-cols-2 gap-x-4 gap-y-2.5">
          <Bar label="Phát âm" value={report.pronunciation} />
          <Bar label="Trôi chảy" value={report.fluency} />
          <Bar label="Ngữ điệu" value={report.intonation} />
          <Bar label="Đủ ý" value={report.completeness} />
        </div>
      </div>

      {/* AI nghe ra gì — chép nguyên văn, không sửa hộ */}
      {report.transcript && (
        <div>
          <div className="label !mb-1">AI nghe được</div>
          <p className="rounded-lg bg-bg/50 px-3 py-2 text-sm text-ink">“{report.transcript}”</p>
        </div>
      )}

      {/* dải từ tô màu — phần đắt giá nhất */}
      {report.words.length > 0 && (
        <div>
          <div className="label !mb-1.5">Bấm vào từ để xem phiên âm</div>
          <div className="flex flex-wrap gap-1.5">
            {report.words.map((w, i) => (
              <WordChip
                key={`${w.word}-${i}`}
                word={w}
                open={openWord === i}
                onToggle={() => setOpenWord(openWord === i ? null : i)}
              />
            ))}
          </div>
          {openWord !== null && report.words[openWord] && (
            <WordDetail word={report.words[openWord]} />
          )}
        </div>
      )}

      {report.focus.length > 0 && (
        <div>
          <div className="label !mb-1.5">Sửa ba thứ này trước</div>
          <div className="flex flex-wrap gap-1.5">
            {report.focus.map((f) => (
              <span
                key={f}
                className="rounded-lg border border-violet/35 bg-violet/10 px-2.5 py-1 font-mono text-xs text-violet"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {report.summary && (
        <p className="border-t border-line/50 pt-3 text-sm leading-relaxed text-muted">
          {report.summary}
        </p>
      )}
    </div>
  );
}

/* ------------------------------ vòng điểm ------------------------------ */

function ScoreDial({ score, tone }: { score: number; tone: 'mint' | 'amber' | 'rose' }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const stroke = `rgb(var(--c-${tone}))`;

  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center">
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth="7" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(100, score)) / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <div className={cn('font-mono text-xl font-bold leading-none', TONE_TEXT[tone])}>
          {score}
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-wider text-faint">điểm</div>
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const tone = toneOf(value);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-muted">{label}</span>
        <span className={cn('font-mono text-[11px] font-bold', TONE_TEXT[tone])}>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700',
            tone === 'mint' ? 'bg-mint' : tone === 'amber' ? 'bg-amber' : 'bg-rose',
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------ từng từ ------------------------------ */

function WordChip({
  word,
  open,
  onToggle,
}: {
  word: WordScore;
  open: boolean;
  onToggle: () => void;
}) {
  const tone = toneOf(word.score);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-1 rounded-lg border px-2 py-1 text-sm font-semibold transition',
        TONE_BG[tone],
        open && 'ring-1 ring-current',
      )}
    >
      {word.word}
      <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
    </button>
  );
}

function WordDetail({ word }: { word: WordScore }) {
  const tone = toneOf(word.score);
  /* AI thỉnh thoảng bỏ trống phiên âm chuẩn — lúc đó tra từ điển CMU đóng sẵn
   * trong app. Đây là dữ liệu tất định, còn đáng tin hơn cả AI ở khoản này. */
  const ipa = word.ipa || (ipaOf(word.word) ? `/${ipaOf(word.word)}/` : '');
  const wrong = word.heard && word.heard !== ipa && word.heard !== word.ipa;

  return (
    <div className="animate-pop mt-2.5 rounded-lg border border-line bg-bg/50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="text-base font-bold text-ink">{word.word}</span>
          <SpeakButton text={word.word} variant="icon" />
        </span>
        <span className={cn('font-mono text-sm font-bold', TONE_TEXT[tone])}>{word.score}/100</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm">
        <span className="text-mint">
          <span className="mr-1 font-sans text-[10px] uppercase tracking-wider text-faint">đúng</span>
          {ipa || '—'}
        </span>
        {wrong && (
          <span className="text-rose">
            <span className="mr-1 font-sans text-[10px] uppercase tracking-wider text-faint">
              bạn đọc
            </span>
            {word.heard}
          </span>
        )}
      </div>

      {word.tip ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">{word.tip}</p>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-mint">
          <Volume2 size={12} /> Từ này bạn đọc chuẩn rồi.
        </p>
      )}
    </div>
  );
}
