import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Headphones,
  Volume2,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Gauge,
  Lightbulb,
  Trophy,
} from 'lucide-react';
import { Card, Chip, ProgressBar, SectionHeader, Segmented } from '@/components/ui/primitives';
import { useSpeaker } from '@/hooks/useSpeech';
import { useStore } from '@/store/useStore';
import { LISTENING } from '@/data/listening';
import { shuffle } from '@/lib/match';
import { FOCUS_LABEL, type ListenFocus, type ListeningItem } from '@/types';
import { cn, sample } from '@/lib/utils';

/* ============================================================================
 *  LISTENING GYM — chữa đúng cái bệnh "nghe không kịp"
 *
 *  Bạn không thiếu từ vựng. Bạn thiếu khả năng nhận ra từ đã biết khi nó bị
 *  nuốt, nối, rút gọn. Bài tập ở đây cho nghe TỐC ĐỘ THẬT trước, chỉ khi bí
 *  mới hạ tốc — vì nghe chậm mãi thì tai không bao giờ quen tốc độ thật.
 * ========================================================================== */

type Phase = 'setup' | 'playing' | 'summary';

const FOCUS_OPTIONS: (ListenFocus | 'all')[] = [
  'all',
  'reduction',
  'linking',
  'contraction',
  'weak-form',
  'number',
  'phrasal',
  'idiom',
  'chunking',
];

interface Round {
  item: ListeningItem;
  options: string[];
}

export function ListeningGym() {
  const settings = useStore((s) => s.settings);
  const log = useStore((s) => s.log);

  const [phase, setPhase] = useState<Phase>('setup');
  const [focus, setFocus] = useState<ListenFocus | 'all'>('all');
  const [count, setCount] = useState(10);
  const [speed, setSpeed] = useState(1.05);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ item: ListeningItem; ok: boolean }[]>([]);
  const [plays, setPlays] = useState(0);

  const { say } = useSpeaker();
  const current = rounds[idx];
  const autoPlayed = useRef<string | null>(null);

  const start = () => {
    let pool = LISTENING;
    if (focus !== 'all') pool = pool.filter((l) => l.focus === focus);
    const picks = sample(pool, Math.min(count, pool.length));
    setRounds(
      picks.map((item) => ({ item, options: shuffle(item.options, item.id.charCodeAt(2) * 977) })),
    );
    setIdx(0);
    setPicked(null);
    setAnswers([]);
    setPlays(0);
    autoPlayed.current = null;
    setPhase('playing');
  };

  const play = useCallback(
    (rate = speed) => {
      if (!current) return;
      setPlays((p) => p + 1);
      say(current.item.spoken, { rate });
    },
    [current, say, speed],
  );

  /* Tự phát lần đầu khi sang câu mới */
  useEffect(() => {
    if (phase !== 'playing' || !current) return;
    if (autoPlayed.current === current.item.id) return;
    autoPlayed.current = current.item.id;
    const t = window.setTimeout(() => play(speed), 320);
    return () => window.clearTimeout(t);
  }, [phase, current, play, speed]);

  const choose = (opt: string) => {
    if (picked || !current) return;
    setPicked(opt);
    const ok = opt === current.item.options[0];
    // Nghe một lần đúng ngay được thưởng nhiều hơn
    const bonus = ok ? (plays <= 1 ? 8 : plays <= 2 ? 4 : 0) : 0;
    log({ listens: ok ? 1 : 0, xp: ok ? 10 + bonus : 3, minutes: 0.3 });
    setAnswers((a) => [...a, { item: current.item, ok }]);
  };

  const next = () => {
    if (idx + 1 >= rounds.length) {
      setPhase('summary');
      return;
    }
    setIdx(idx + 1);
    setPicked(null);
    setPlays(0);
  };

  /* ------------------------------ giao diện ------------------------------ */

  if (phase === 'setup') {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="animate-fade-up mb-2 flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky/12 text-sky">
            <Headphones size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Luyện nghe hiểu liền</h1>
            <p className="text-sm text-muted">
              Nghe dạng NÓI THẬT, không phải dạng viết trong sách.
            </p>
          </div>
        </div>

        <Card className="space-y-6">
          <div>
            <label className="label">Tập trung vào</label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFocus(f)}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                    focus === f
                      ? 'border-sky/50 bg-sky/10 text-sky'
                      : 'border-line bg-raised/40 text-muted hover:text-ink',
                  )}
                >
                  {f === 'all' ? 'Trộn hết' : FOCUS_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <label className="label">Số câu</label>
              <Segmented
                value={String(count)}
                onChange={(v) => setCount(Number(v))}
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: '15', label: '15' },
                ]}
              />
            </div>
            <div>
              <label className="label">Tốc độ nói</label>
              <Segmented
                value={String(speed)}
                onChange={(v) => setSpeed(Number(v))}
                options={[
                  { value: '0.9', label: 'Chậm' },
                  { value: '1.05', label: 'Thật' },
                  { value: '1.25', label: 'Nhanh' },
                ]}
              />
            </div>
          </div>

          <button type="button" onClick={start} className="btn-primary w-full py-3 text-[15px]">
            <Headphones size={17} /> Bắt đầu nghe
          </button>
        </Card>

        <Card className="border-sky/25 bg-sky/[.05]">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Lightbulb size={15} className="text-sky" /> Vì sao bạn nghe không kịp?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Không phải vì thiếu từ. Trong sách viết là <em>“What do you want to do?”</em>, nhưng
            người bản xứ nói <strong className="text-ink">“Whaddaya wanna do?”</strong> — cùng một
            câu, khác hoàn toàn về âm. Bài tập này dạy tai bạn nhận ra dạng nói thật đó.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Nguyên tắc: <strong className="text-ink">luôn nghe tốc độ thật trước</strong>. Chỉ hạ
            tốc khi thật sự bí, và sau đó nghe lại tốc độ thật một lần nữa.
          </p>
        </Card>
      </div>
    );
  }

  if (phase === 'summary') {
    const correct = answers.filter((a) => a.ok).length;
    const wrong = answers.filter((a) => !a.ok);
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Card className="animate-fade-up text-center">
          <div className="text-4xl">
            {correct / Math.max(1, answers.length) >= 0.8 ? '👂' : correct / Math.max(1, answers.length) >= 0.5 ? '💪' : '🌱'}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink">
            {correct}/{answers.length} câu đúng
          </h1>
          <p className="mt-1 text-sm text-muted">
            {correct === answers.length
              ? 'Tai bạn đang bắt kịp tốc độ thật rồi.'
              : 'Những câu sai bên dưới chính là chỗ tai bạn còn hổng — nghe lại vài lần.'}
          </p>
        </Card>

        {wrong.length > 0 && (
          <div>
            <SectionHeader title="Nghe lại những câu bị hụt" desc="Bấm loa và nhại theo." />
            <div className="space-y-2">
              {wrong.map(({ item }) => (
                <ReviewRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={start} className="btn-primary flex-1">
            <RotateCcw size={16} /> Nghe bộ nữa
          </button>
          <Link to="/drill" className="btn-ghost flex-1">
            Sang luyện phản xạ <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  if (!current) return null;
  const correctAnswer = current.item.options[0];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-faint">
          {idx + 1} / {rounds.length}
        </span>
        <ProgressBar value={idx + (picked ? 1 : 0)} max={rounds.length} height={5} tone="sky" />
        <button type="button" onClick={() => setPhase('summary')} className="btn-quiet px-2 py-1 text-xs">
          Kết thúc
        </button>
      </div>

      <Card className="!p-0">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-3">
          <Chip tone="sky">{FOCUS_LABEL[current.item.focus]}</Chip>
          <span className="text-[11px] text-faint">
            {plays === 0 ? 'đang phát…' : `đã nghe ${plays} lần`}
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 px-5 py-8">
          <button
            type="button"
            onClick={() => play(speed)}
            className="grid h-20 w-20 place-items-center rounded-full bg-sky text-white shadow-[0_0_40px_-10px_rgb(var(--c-sky)/.9)] transition active:scale-95"
            aria-label="Nghe lại"
          >
            <Volume2 size={30} />
          </button>
          <p className="text-sm text-muted">Người đó vừa nói gì?</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => play(0.7)} className="btn-quiet text-xs">
              <Gauge size={14} /> Nghe chậm
            </button>
            <button type="button" onClick={() => play(1.3)} className="btn-quiet text-xs">
              <Gauge size={14} /> Nghe nhanh
            </button>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {current.options.map((opt) => {
          const isCorrect = opt === correctAnswer;
          const isPicked = picked === opt;
          const reveal = picked !== null;
          return (
            <button
              key={opt}
              type="button"
              disabled={reveal}
              onClick={() => choose(opt)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition',
                !reveal && 'border-line bg-surface hover:border-sky/40 hover:bg-raised/60',
                reveal && isCorrect && 'border-mint/50 bg-mint/10 text-ink',
                reveal && isPicked && !isCorrect && 'border-rose/50 bg-rose/10 text-ink',
                reveal && !isCorrect && !isPicked && 'border-line/50 bg-surface/50 text-faint',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
                  reveal && isCorrect
                    ? 'border-mint bg-mint text-[#04120c]'
                    : reveal && isPicked
                      ? 'border-rose bg-rose text-white'
                      : 'border-line',
                )}
              >
                {reveal && isCorrect && <Check size={12} strokeWidth={3} />}
                {reveal && isPicked && !isCorrect && <X size={12} strokeWidth={3} />}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {picked && (
        <Card className="animate-fade-up space-y-3 border-sky/25 bg-sky/[.05]">
          <div>
            <div className="label">Câu đầy đủ</div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-semibold text-ink">{current.item.written}</p>
              <button
                type="button"
                onClick={() => say(current.item.written, { rate: 0.85 })}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-raised text-muted hover:text-sky"
                aria-label="Nghe câu chuẩn"
              >
                <Volume2 size={15} />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">{current.item.vi}</p>
          </div>

          <div className="rounded-xl border border-line/70 bg-bg/40 p-3">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-sky">
              Nghe ra như thế nào
            </div>
            <p className="font-mono text-sm text-ink">“{current.item.spoken}”</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{current.item.note}</p>
          </div>

          <button type="button" onClick={next} className="btn-primary w-full py-3">
            {idx + 1 >= rounds.length ? (
              <>
                <Trophy size={16} /> Xem tổng kết
              </>
            ) : (
              <>
                Câu tiếp <ArrowRight size={16} />
              </>
            )}
          </button>
        </Card>
      )}
    </div>
  );
}

function ReviewRow({ item }: { item: ListeningItem }) {
  const { say } = useSpeaker();
  return (
    <Card className="flex items-start gap-3 py-4">
      <button
        type="button"
        onClick={() => say(item.spoken, { rate: 1.05 })}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky/12 text-sky"
        aria-label="Nghe lại"
      >
        <Volume2 size={16} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm text-ink">“{item.spoken}”</p>
        <p className="mt-0.5 text-xs text-muted">{item.written}</p>
        <p className="mt-1 text-xs text-faint">{item.note}</p>
      </div>
    </Card>
  );
}
