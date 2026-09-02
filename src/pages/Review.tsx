import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Repeat2, Check, ArrowRight, Volume2, Sparkles, Clock } from 'lucide-react';
import { Card, Chip, ProgressBar, Empty, SectionHeader } from '@/components/ui/primitives';
import { MicButton } from '@/components/shared/MicButton';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { MemoryAid } from '@/components/shared/MemoryAid';
import { useMic, useSpeaker } from '@/hooks/useSpeech';
import { useStore } from '@/store/useStore';
import { CHUNK_BY_ID } from '@/data/chunks';
import { REFLEX_BY_ID } from '@/data/reflex';
import { describeInterval, dueCards, gradeCard } from '@/lib/srs';
import { FN_LABEL, type Grade, type SrsCard } from '@/types';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  ÔN TẬP — nhưng ôn bằng MIỆNG.
 *
 *  Khác Anki ở một điểm quyết định: bạn không được phép "nhìn thấy là nhớ".
 *  Bạn phải NÓI RA câu tiếng Anh trước khi lật thẻ. Nhớ mặt chữ không giúp gì
 *  cho phản xạ; chỉ có kéo được nó ra khỏi miệng mới tính.
 * ========================================================================== */

interface CardFace {
  cue: string;
  cueSub: string;
  answer: string;
  answerVi: string;
  example?: string;
  exampleVi?: string;
  tag: string;
}

function faceOf(card: SrsCard): CardFace | null {
  if (card.kind === 'chunk') {
    const c = CHUNK_BY_ID.get(card.id);
    if (!c) return null;
    return {
      cue: c.vi,
      cueSub: 'Nói cụm tiếng Anh tương ứng',
      answer: c.en,
      answerVi: c.vi,
      example: c.example,
      exampleVi: c.exampleVi,
      tag: FN_LABEL[c.fn],
    };
  }
  const r = REFLEX_BY_ID.get(card.id);
  if (!r) return null;
  return {
    cue: r.type === 'translate' ? r.cue : r.cueVi,
    cueSub: r.type === 'translate' ? 'Nói câu này bằng tiếng Anh' : 'Trả lời bằng tiếng Anh',
    answer: r.model,
    answerVi: r.modelVi,
    tag: 'Câu phản xạ',
  };
}

const GRADES: { value: Grade; label: string; hint: string; tone: string }[] = [
  { value: 'again', label: 'Quên', hint: 'gặp lại sau vài phút', tone: 'bg-rose text-white' },
  { value: 'hard', label: 'Khó', hint: 'nhớ được nhưng chậm', tone: 'bg-amber text-[#1a1000]' },
  { value: 'good', label: 'Được', hint: 'bật ra bình thường', tone: 'bg-mint text-[#04120c]' },
  { value: 'easy', label: 'Dễ', hint: 'bật ra không cần nghĩ', tone: 'bg-sky text-white' },
];

export function Review() {
  const srs = useStore((s) => s.srs);
  const grade = useStore((s) => s.grade);
  const log = useStore((s) => s.log);
  const clearWeak = useStore((s) => s.clearWeak);

  const [queue, setQueue] = useState<SrsCard[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const { say } = useSpeaker();
  const mic = useMic();

  const due = useMemo(() => dueCards(srs), [srs]);
  const total = Object.keys(srs).length;
  const nextDue = useMemo(() => {
    const upcoming = Object.values(srs).sort((a, b) => a.due - b.due)[0];
    return upcoming ? upcoming.due : 0;
  }, [srs]);

  const start = () => {
    setQueue(due.slice(0, 30));
    setIdx(0);
    setFlipped(false);
    setReviewed(0);
    mic.reset();
  };

  const current = queue?.[idx];
  const face = current ? faceOf(current) : null;

  const answer = (g: Grade) => {
    if (!current) return;
    grade(current.id, current.kind, g);
    if (g !== 'again') clearWeak(current.id);
    log({ reviews: 1, xp: g === 'again' ? 3 : 8, minutes: 0.25 });
    setReviewed((n) => n + 1);
    mic.reset();
    setFlipped(false);

    // Thẻ "Quên" được đẩy xuống cuối hàng đợi để gặp lại ngay trong phiên
    if (g === 'again' && queue) {
      const rest = [...queue];
      const [c] = rest.splice(idx, 1);
      rest.push(c);
      setQueue(rest);
      return;
    }
    setIdx((i) => i + 1);
  };

  /* ------------------------------ màn chờ ------------------------------ */
  if (!queue) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="animate-fade-up flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber/12 text-amber">
            <Repeat2 size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Ôn tập bằng miệng</h1>
            <p className="text-sm text-muted">
              Nhìn gợi ý tiếng Việt → nói ra tiếng Anh trước khi lật thẻ.
            </p>
          </div>
        </div>

        {total === 0 ? (
          <Empty
            emoji="🌱"
            title="Bộ ôn của bạn còn trống"
            desc="Thẻ được thêm tự động khi bạn làm bài phản xạ hoặc hoàn thành tình huống. Bạn cũng có thể tự chọn cụm trong Thư viện."
            action={
              <Link to="/chunks" className="btn-primary">
                Mở thư viện cụm <ArrowRight size={15} />
              </Link>
            }
          />
        ) : due.length === 0 ? (
          <Card className="text-center">
            <div className="text-4xl">✅</div>
            <h2 className="mt-2 text-lg font-bold text-ink">Hôm nay không còn thẻ nào tới hạn</h2>
            <p className="mt-1 text-sm text-muted">
              Bạn có {total} thẻ trong bộ.{' '}
              {nextDue > Date.now() && (
                <>
                  Thẻ tiếp theo tới hạn sau{' '}
                  {describeInterval(Math.ceil((nextDue - Date.now()) / 86400000))}.
                </>
              )}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setQueue(
                    Object.values(srs)
                      .sort((a, b) => a.due - b.due)
                      .slice(0, 15),
                  );
                  setIdx(0);
                  setReviewed(0);
                }}
                className="btn-ghost"
              >
                <Sparkles size={15} /> Ôn sớm 15 thẻ
              </button>
              <Link to="/drill" className="btn-primary">
                Sang luyện phản xạ <ArrowRight size={15} />
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="text-center">
            <div className="text-4xl">🔁</div>
            <h2 className="mt-2 text-2xl font-extrabold text-ink">{due.length} thẻ tới hạn</h2>
            <p className="mt-1 text-sm text-muted">
              Khoảng {Math.ceil(due.length * 0.25)} phút. Nhớ NÓI THÀNH TIẾNG trước khi lật.
            </p>
            <button type="button" onClick={start} className="btn-primary mt-5 px-6 py-3">
              <Repeat2 size={17} /> Bắt đầu ôn
            </button>
          </Card>
        )}

        {total > 0 && (
          <div>
            <SectionHeader title="Bộ thẻ của bạn" desc={`${total} thẻ đang được theo dõi`} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Tới hạn" value={due.length} tone="amber" />
              <MiniStat
                label="Đang học"
                value={Object.values(srs).filter((c) => c.intervalDays < 7).length}
                tone="violet"
              />
              <MiniStat
                label="Nhớ khá"
                value={
                  Object.values(srs).filter((c) => c.intervalDays >= 7 && c.intervalDays < 21)
                    .length
                }
                tone="sky"
              />
              <MiniStat
                label="Đã thuộc"
                value={Object.values(srs).filter((c) => c.intervalDays >= 21).length}
                tone="mint"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------ hết hàng đợi ------------------------------ */
  if (!current || !face) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="animate-fade-up text-center">
          <div className="text-4xl">🎉</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink">Xong {reviewed} thẻ</h1>
          <p className="mt-1 text-sm text-muted">
            Mỗi lần bạn kéo được cụm ra khỏi miệng, nó nằm lại lâu hơn một chút.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setQueue(null)} className="btn-ghost">
              Quay lại
            </button>
            <Link to="/drill" className="btn-primary">
              Luyện phản xạ <ArrowRight size={15} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------------------ đang ôn ------------------------------ */
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-faint">
          {reviewed + 1} / {queue.length}
        </span>
        <ProgressBar value={reviewed} max={queue.length} height={5} tone="amber" />
        <button type="button" onClick={() => setQueue(null)} className="btn-quiet px-2 py-1 text-xs">
          Dừng
        </button>
      </div>

      <Card className="!p-0">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-3">
          <Chip tone="amber">{face.tag}</Chip>
          <span className="flex items-center gap-1 text-[11px] text-faint">
            <Clock size={11} /> đang cách {describeInterval(current.intervalDays)}
          </span>
        </div>

        <div className="px-5 py-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-faint">
            {face.cueSub}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-balance text-xl font-bold leading-snug text-ink">
            {face.cue}
          </p>
        </div>

        {!flipped ? (
          <div className="flex flex-col items-center gap-4 border-t border-line/70 px-5 py-6">
            <MicButton
              state={mic.state}
              size="md"
              level={mic.level}
              resumed={mic.resumed}
              onStart={() => void mic.start()}
              onStop={async () => {
                await mic.finish();
                setFlipped(true);
              }}
              hint={mic.state === 'listening' ? 'Đang nghe…' : 'Nói rồi lật thẻ'}
            />
            {mic.transcript && (
              <p className="rounded-xl bg-raised/60 px-4 py-2 text-center text-sm text-ink">
                {mic.transcript}
              </p>
            )}
            <button type="button" onClick={() => setFlipped(true)} className="btn-ghost">
              Lật thẻ <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="animate-fade-up border-t border-line/70 px-5 py-6">
            {mic.transcript && (
              <div className="mb-3">
                <div className="label">Bạn đã nói</div>
                <p className="rounded-xl bg-raised/60 px-4 py-2.5 text-sm text-ink">
                  {mic.transcript}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-mint/25 bg-mint/[.06] p-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-mint">
                  Đáp án
                </span>
                <SpeakButton text={face.example ?? face.answer} variant="icon" />
              </div>
              <p className="text-lg font-bold leading-snug text-ink">{face.answer}</p>
              <p className="mt-1 text-xs text-muted">{face.answerVi}</p>
              {face.example && (
                <div className="mt-3 border-t border-mint/20 pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm italic text-ink">{face.example}</p>
                    <button
                      type="button"
                      onClick={() => say(face.example!)}
                      aria-label="Nghe ví dụ"
                      className="shrink-0 text-faint transition hover:text-mint"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-faint">{face.exampleVi}</p>
                </div>
              )}
            </div>

            {/* Đây là khoảnh khắc quý nhất để nhồi mẹo nhớ: bạn vừa cố lôi cụm
                ra khỏi trí nhớ, nên não đang mở sẵn để nhận thêm móc bám. */}
            {current.kind === 'chunk' && <MemoryAid chunkId={current.id} />}

            <p className="mt-4 text-center text-xs text-faint">
              Bạn kéo nó ra khỏi miệng dễ hay khó?
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {GRADES.map((g) => {
                const preview = gradeCard(current, g.value);
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => answer(g.value)}
                    className={cn(
                      'rounded-xl px-3 py-2.5 text-center transition active:scale-[.97]',
                      g.tone,
                    )}
                  >
                    <span className="block text-sm font-bold">{g.label}</span>
                    <span className="block text-[10px] opacity-80">
                      {describeInterval(preview.intervalDays)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-faint sm:grid-cols-4">
              {GRADES.map((g) => (
                <span key={g.value} className="text-center">
                  {g.hint}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'mint' | 'violet' | 'amber' | 'sky';
}) {
  const tones = {
    mint: 'text-mint',
    violet: 'text-violet',
    amber: 'text-amber',
    sky: 'text-sky',
  };
  return (
    <Card className="!p-3.5 text-center">
      <div className={cn('font-mono text-xl font-bold', tones[tone])}>{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
    </Card>
  );
}
