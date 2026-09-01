import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Eye,
  EyeOff,
  SkipForward,
  Timer,
  Trophy,
  Repeat2,
  Mic,
  Square,
  Volume2,
} from 'lucide-react';
import { Card, Chip, ProgressBar, Segmented, SectionHeader } from '@/components/ui/primitives';
import { MicButton } from '@/components/shared/MicButton';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { CountdownRing } from '@/components/shared/CountdownRing';
import { useMic, useSpeaker } from '@/hooks/useSpeech';
import { useStore } from '@/store/useStore';
import { REFLEX } from '@/data/reflex';
import { scoreAnswer, shadowAccuracy, shuffle, type MatchResult } from '@/lib/match';
import { DOMAIN_LABEL, type ReflexPrompt, type ReflexType } from '@/types';
import { cn, formatMs, sample } from '@/lib/utils';

/* ============================================================================
 *  REFLEX DRILL — bài tập cốt lõi của cả app
 *
 *  Luật chơi: câu hỏi hiện ra → đồng hồ chạy → bạn PHẢI nói. Câu xấu mà nhanh
 *  ăn đứt câu đẹp mà chậm. Điểm số đo hai thứ: bạn nói được gì, và mất bao lâu
 *  để dám mở miệng.
 * ========================================================================== */

type Phase = 'setup' | 'prompt' | 'answering' | 'result' | 'summary';

const TYPE_OPTIONS: { value: ReflexType | 'all'; label: string }[] = [
  { value: 'all', label: 'Trộn hết' },
  { value: 'respond', label: 'Trả lời' },
  { value: 'translate', label: 'Việt→Anh' },
  { value: 'expand', label: 'Khai triển' },
  { value: 'react', label: 'Phản ứng' },
];

const TYPE_HINT: Record<ReflexType, string> = {
  respond: 'Nghe câu hỏi rồi trả lời ngay bằng 1–2 câu.',
  translate: 'Đọc câu tiếng Việt và bật ra tiếng Anh. Đừng dịch từng chữ.',
  expand: 'Từ mấy chữ gợi ý, phình thành câu đủ ý: sự việc + lý do + kết quả.',
  react: 'Phản ứng như người bản xứ: đừng im, đừng chỉ nói "ok".',
};

interface Attempt {
  prompt: ReflexPrompt;
  result: MatchResult | null;
  reactionMs: number;
  skipped: boolean;
}

export function ReflexDrill() {
  const settings = useStore((s) => s.settings);
  const log = useStore((s) => s.log);
  const ensureCards = useStore((s) => s.ensureCards);
  const markWeak = useStore((s) => s.markWeak);
  const srs = useStore((s) => s.srs);
  const weakIds = useStore((s) => s.weakIds);

  const [phase, setPhase] = useState<Phase>('setup');
  const [type, setType] = useState<ReflexType | 'all'>('all');
  const [count, setCount] = useState(10);
  const [queue, setQueue] = useState<ReflexPrompt[]>([]);
  const [idx, setIdx] = useState(0);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [expired, setExpired] = useState(false);

  const { say, stop: stopSay } = useSpeaker();
  const mic = useMic();

  const promptReadyAt = useRef(0);
  const reactionRef = useRef(0);
  const sessionStart = useRef(0);

  const current = queue[idx];

  /* ------------------------- tạo bộ câu hỏi -------------------------
   * Không lấy ngẫu nhiên thuần. Một phiên tốt phải trộn ba loại:
   *   ~40% câu tới hạn ôn  → chống quên đúng lúc sắp quên
   *   ~30% câu bạn hay hụt → vá đúng chỗ thủng
   *   phần còn lại là câu mới → vẫn có cảm giác khám phá
   * Trộn lẫn (interleaving) hiệu quả hơn hẳn học dồn từng loại một. */
  const buildQueue = useCallback(() => {
    const levelOrder = ['A2', 'B1', 'B2', 'C1'];
    const maxLevel = levelOrder.indexOf(settings.level) + 1;
    let pool = REFLEX.filter(
      (r) =>
        levelOrder.indexOf(r.level) <= maxLevel && settings.focusDomains.includes(r.domain),
    );
    if (type !== 'all') pool = pool.filter((r) => r.type === type);
    if (pool.length < count) {
      const extra = REFLEX.filter((r) => !pool.includes(r) && (type === 'all' || r.type === type));
      pool = [...pool, ...extra];
    }
    if (!pool.length) return [];

    const now = Date.now();
    const dueSet = new Set(pool.filter((r) => srs[r.id] && srs[r.id].due <= now).map((r) => r.id));
    const weakSet = new Set(
      pool.filter((r) => !dueSet.has(r.id) && weakIds[r.id]).map((r) => r.id),
    );

    const takeDue = sample(
      pool.filter((r) => dueSet.has(r.id)),
      Math.ceil(count * 0.4),
    );
    const takeWeak = sample(
      pool.filter((r) => weakSet.has(r.id)),
      Math.ceil(count * 0.3),
    );
    const chosen = new Set([...takeDue, ...takeWeak].map((r) => r.id));
    const takeRest = sample(
      pool.filter((r) => !chosen.has(r.id)),
      Math.max(0, count - chosen.size),
    );

    return shuffle([...takeDue, ...takeWeak, ...takeRest]).slice(0, count);
  }, [settings.level, settings.focusDomains, type, count, srs, weakIds]);

  const start = () => {
    const q = buildQueue();
    if (!q.length) return;
    setQueue(q);
    setIdx(0);
    setAttempts([]);
    sessionStart.current = Date.now();
    goToPrompt(q[0]);
  };

  /* ------------------------- vòng đời một câu ------------------------- */
  const goToPrompt = useCallback(
    (p: ReflexPrompt) => {
      setResult(null);
      setShowModel(false);
      setExpired(false);
      setTimerOn(false);
      mic.reset();
      setPhase('prompt');

      const begin = () => {
        promptReadyAt.current = performance.now();
        reactionRef.current = 0;
        setPhase('answering');
        setTimerOn(settings.strictTimer);
        if (settings.useMic && mic.supported) mic.start();
      };

      // Với bài dịch Việt→Anh thì không đọc gì, vào thẳng.
      if (p.type === 'translate') {
        window.setTimeout(begin, 260);
      } else if (settings.autoPlay) {
        say(p.cue, { onEnd: begin });
      } else {
        begin();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.autoPlay, settings.strictTimer, settings.useMic, say],
  );

  /* Ghi nhận thời điểm bạn thật sự bật ra tiếng */
  useEffect(() => {
    if (phase === 'answering' && mic.transcript && reactionRef.current === 0) {
      reactionRef.current = performance.now() - promptReadyAt.current;
    }
  }, [mic.transcript, phase]);

  const finishAnswer = useCallback(
    (spokenRaw: string, skipped = false) => {
      if (!current) return;
      mic.stop();
      stopSay();
      setTimerOn(false);

      const reaction =
        reactionRef.current > 0 ? reactionRef.current : performance.now() - promptReadyAt.current;
      const spoken = spokenRaw.trim();
      const r = skipped || !spoken ? null : scoreAnswer(spoken, current.targets, current.model);

      setResult(r);
      setPhase('result');
      setShowModel(true);

      const fast = reaction < 3000 && !skipped && (r?.score ?? 0) >= 50;
      const xpGain = skipped
        ? 2
        : 8 + Math.round((r?.score ?? 0) / 12) + (fast ? 6 : 0);

      log({
        drills: 1,
        xp: xpGain,
        minutes: 0.35,
        fastAnswers: fast ? 1 : 0,
        reactionMs: skipped ? 0 : reaction,
      });

      ensureCards([current.id], 'reflex');
      if (skipped || (r?.score ?? 0) < 45) markWeak(current.id);

      setAttempts((a) => [
        ...a,
        { prompt: current, result: r, reactionMs: skipped ? 0 : reaction, skipped },
      ]);

      if (settings.autoPlay) window.setTimeout(() => say(current.model), 350);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, log, ensureCards, markWeak, settings.autoPlay, say, stopSay],
  );

  const next = () => {
    stopSay();
    if (idx + 1 >= queue.length) {
      const mins = Math.max(1, (Date.now() - sessionStart.current) / 60000);
      log({ minutes: Math.min(mins, 30) * 0.15 });
      setPhase('summary');
      return;
    }
    const n = idx + 1;
    setIdx(n);
    goToPrompt(queue[n]);
  };

  const onExpire = useCallback(() => {
    setExpired(true);
    // Hết giờ không phải là thất bại — cứ nói nốt, app chỉ nhắc là bạn đã chậm.
  }, []);

  useEffect(() => () => stopSay(), [stopSay]);

  /* ------------------------------ giao diện ------------------------------ */

  if (phase === 'setup') {
    return (
      <SetupScreen
        type={type}
        setType={setType}
        count={count}
        setCount={setCount}
        onStart={start}
      />
    );
  }

  if (phase === 'summary') {
    return <Summary attempts={attempts} onAgain={start} />;
  }

  if (!current) return null;

  const answering = phase === 'answering';
  const showing = phase === 'result';
  /* Không có micro (không hỗ trợ hoặc bị chặn) → vẫn luyện được, chỉ là tự chấm */
  const manualMode = !mic.supported || mic.state === 'denied';

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* tiến độ phiên */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-faint">
          {idx + 1} / {queue.length}
        </span>
        <ProgressBar value={idx + (showing ? 1 : 0)} max={queue.length} height={5} />
        <button
          type="button"
          onClick={() => setPhase('summary')}
          className="btn-quiet px-2 py-1 text-xs"
        >
          Kết thúc
        </button>
      </div>

      {/* thẻ câu hỏi */}
      <Card className="relative overflow-hidden !p-0">
        <div className="flex items-center justify-between gap-2 border-b border-line/70 px-5 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip tone={current.type === 'translate' ? 'violet' : 'mint'}>
              {TYPE_OPTIONS.find((t) => t.value === current.type)?.label}
            </Chip>
            <Chip>{DOMAIN_LABEL[current.domain]}</Chip>
            <Chip>{current.level}</Chip>
          </div>
          {current.type !== 'translate' && <SpeakButton text={current.cue} variant="icon" />}
        </div>

        <div className="px-5 py-7 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-faint">
            {current.type === 'translate'
              ? 'Nói câu này bằng tiếng Anh'
              : current.type === 'expand'
                ? 'Khai triển từ hạt nhân này'
                : 'Nghe và trả lời ngay'}
          </p>
          <p
            className={cn(
              'mx-auto mt-3 max-w-xl text-balance font-bold leading-snug text-ink',
              current.type === 'expand' ? 'font-mono text-2xl tracking-tight' : 'text-2xl',
            )}
          >
            {current.type === 'expand' ? `“${current.cue}”` : current.cue}
          </p>
          {current.type !== 'translate' && settings.showVi && (
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{current.cueVi}</p>
          )}
          {current.type === 'expand' && (
            <p className="mt-2 text-xs text-faint">{current.cueVi}</p>
          )}
          <p className="mt-4 text-xs text-faint">{TYPE_HINT[current.type]}</p>
        </div>
      </Card>

      {/* khu vực trả lời */}
      {answering && (
        <Card className="flex flex-col items-center gap-4 py-7">
          {settings.strictTimer && (
            <Countdown
              seconds={current.seconds}
              running={timerOn}
              onExpire={onExpire}
              expired={expired}
            />
          )}

          <MicButton
            state={mic.state}
            onStart={() => mic.start()}
            onStop={() => finishAnswer(mic.transcript)}
            hint={
              mic.state === 'listening'
                ? 'Đang nghe… nói xong bấm để chấm'
                : manualMode
                  ? 'Nói ra miệng rồi bấm nút bên dưới'
                  : 'Bấm rồi nói'
            }
          />

          {mic.transcript && (
            <p className="max-w-lg rounded-xl bg-raised/60 px-4 py-2.5 text-center text-sm text-ink">
              {mic.transcript}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {manualMode && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => finishAnswer('', false)}
              >
                <Check size={15} /> Tôi đã nói xong
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={() => finishAnswer('', true)}>
              <SkipForward size={15} /> Bí rồi, xem đáp án
            </button>
            <button
              type="button"
              className="btn-quiet text-xs"
              onClick={() => setShowModel((v) => !v)}
            >
              {showModel ? <EyeOff size={14} /> : <Eye size={14} />}
              {showModel ? 'Ẩn gợi ý' : 'Hé gợi ý'}
            </button>
          </div>

          {showModel && !showing && (
            <p className="max-w-lg rounded-xl border border-dashed border-line px-4 py-2.5 text-center text-sm text-muted">
              Gợi ý cụm khoá: {current.targets.slice(0, 3).map((t) => `“${t}”`).join(', ')}
            </p>
          )}
        </Card>
      )}

      {/* kết quả */}
      {showing && (
        <ResultCard
          key={current.id}
          prompt={current}
          result={result}
          transcript={mic.transcript}
          reactionMs={reactionRef.current}
          onNext={next}
          isLast={idx + 1 >= queue.length}
        />
      )}
    </div>
  );
}

/* ------------------------------ màn chuẩn bị ------------------------------ */

function SetupScreen({
  type,
  setType,
  count,
  setCount,
  onStart,
}: {
  type: ReflexType | 'all';
  setType: (t: ReflexType | 'all') => void;
  count: number;
  setCount: (n: number) => void;
  onStart: () => void;
}) {
  const strictTimer = useStore((s) => s.settings.strictTimer);
  const setSettings = useStore((s) => s.setSettings);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-up">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint/12 text-mint">
            <Zap size={21} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">Phản xạ nhanh</h1>
            <p className="text-sm text-muted">Câu xấu mà nhanh &gt; câu đẹp mà chậm.</p>
          </div>
        </div>
      </div>

      <Card className="space-y-6">
        <div>
          <label className="label">Kiểu bài</label>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setType(o.value)}
                className={cn(
                  'rounded-xl border px-3.5 py-2 text-sm font-semibold transition',
                  type === o.value
                    ? 'border-mint/50 bg-mint/10 text-mint'
                    : 'border-line bg-raised/40 text-muted hover:text-ink',
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Số câu</label>
          <Segmented
            value={String(count)}
            onChange={(v) => setCount(Number(v))}
            options={[
              { value: '5', label: '5 câu · 3′' },
              { value: '10', label: '10 câu · 6′' },
              { value: '20', label: '20 câu · 12′' },
            ]}
          />
        </div>

        <div className="rounded-xl border border-line/70 bg-raised/40 p-4">
          <button
            type="button"
            onClick={() => setSettings({ strictTimer: !strictTimer })}
            className="flex w-full items-center justify-between gap-4 text-left"
          >
            <span>
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <Timer size={15} /> Đồng hồ ép phản xạ
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                Bật để có áp lực thật. Tắt nếu hôm nay bạn muốn tập trung vào chất lượng câu.
              </span>
            </span>
            <span
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                strictTimer ? 'bg-mint' : 'bg-line',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
                  strictTimer ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </span>
          </button>
        </div>

        <button type="button" onClick={onStart} className="btn-primary w-full py-3 text-[15px]">
          <Zap size={17} /> Bắt đầu
        </button>
      </Card>

      <Card className="border-violet/25 bg-violet/[.05]">
        <h3 className="text-sm font-bold text-ink">Cách luyện cho hiệu quả</h3>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
          <li>• Nói THÀNH TIẾNG, đừng nói trong đầu. Cơ miệng cũng cần tập.</li>
          <li>• Đừng sửa giữa chừng. Nói sai thì kệ, nói tiếp cho hết câu.</li>
          <li>• Điểm thấp mà nhanh vẫn hơn điểm cao mà mất 10 giây suy nghĩ.</li>
          <li>• Đừng bỏ bước “nhại lại” ở cuối mỗi câu — đó là bước làm cụm đọng lại.</li>
        </ul>
        <p className="mt-3 border-t border-line/60 pt-3 text-xs leading-relaxed text-faint">
          Bộ câu không lấy ngẫu nhiên: app ưu tiên câu đang tới hạn ôn và câu bạn hay hụt, rồi mới
          trộn thêm câu mới.
        </p>
      </Card>
    </div>
  );
}

/* ------------------------------ đồng hồ ------------------------------ */

function Countdown({
  seconds,
  running,
  onExpire,
  expired,
}: {
  seconds: number;
  running: boolean;
  onExpire: () => void;
  expired: boolean;
}) {
  const [ratio, setRatio] = useState(1);
  const startRef = useRef(0);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running) {
      setRatio(1);
      firedRef.current = false;
      return;
    }
    startRef.current = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const r = Math.max(0, 1 - elapsed / (seconds * 1000));
      setRatio(r);
      if (r <= 0) {
        if (!firedRef.current) {
          firedRef.current = true;
          onExpire();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, seconds, onExpire]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <CountdownRing ratio={ratio} seconds={seconds} label="giây" />
      {expired && (
        <span className="animate-pop text-xs font-semibold text-rose">
          Hết giờ — cứ nói tiếp, đừng dừng!
        </span>
      )}
    </div>
  );
}

/* ------------------------------ thẻ kết quả ------------------------------ */

function ResultCard({
  prompt,
  result,
  transcript,
  reactionMs,
  onNext,
  isLast,
}: {
  prompt: ReflexPrompt;
  result: MatchResult | null;
  transcript: string;
  reactionMs: number;
  onNext: () => void;
  isLast: boolean;
}) {
  const tone =
    !result || result.verdict === 'weak'
      ? 'rose'
      : result.verdict === 'partial'
        ? 'amber'
        : 'mint';

  const verdictText = !result
    ? 'Chưa nói được — không sao, nghe câu mẫu và nhại lại một lần.'
    : { great: 'Rất tốt!', good: 'Ổn đó!', partial: 'Được một nửa', weak: 'Còn xa câu mẫu' }[
        result.verdict
      ];

  return (
    <Card className="animate-fade-up space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'grid h-10 w-10 place-items-center rounded-xl text-lg',
              tone === 'mint'
                ? 'bg-mint/12 text-mint'
                : tone === 'amber'
                  ? 'bg-amber/12 text-amber'
                  : 'bg-rose/12 text-rose',
            )}
          >
            {result && result.verdict !== 'weak' ? <Check size={20} /> : <X size={20} />}
          </span>
          <div>
            <div className="text-sm font-bold text-ink">{verdictText}</div>
            <div className="text-xs text-muted">
              {result ? `${result.score}/100 điểm` : 'không có câu trả lời'}
              {reactionMs > 0 && ` · bật ra sau ${formatMs(reactionMs)}`}
            </div>
          </div>
        </div>
        {reactionMs > 0 && reactionMs < 3000 && (
          <Chip tone="mint">
            <Zap size={11} /> phản xạ nhanh
          </Chip>
        )}
      </div>

      {transcript && (
        <div>
          <div className="label">Bạn đã nói</div>
          <p className="rounded-xl bg-raised/60 px-4 py-2.5 text-sm text-ink">{transcript}</p>
        </div>
      )}

      {result && (result.hit.length > 0 || result.missed.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {result.hit.map((h) => (
            <Chip key={h} tone="mint">
              <Check size={11} /> {h}
            </Chip>
          ))}
          {result.missed.map((m) => (
            <Chip key={m} tone="rose">
              <X size={11} /> {m}
            </Chip>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-mint/25 bg-mint/[.06] p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-mint">
            Người bản xứ sẽ nói
          </span>
          <SpeakButton text={prompt.model} variant="icon" />
        </div>
        <p className="text-[15px] font-semibold leading-relaxed text-ink">{prompt.model}</p>
        <p className="mt-1 text-xs text-muted">{prompt.modelVi}</p>
      </div>

      <EchoStep model={prompt.model} />

      <button type="button" onClick={onNext} className="btn-primary w-full py-3">
        {isLast ? (
          <>
            <Trophy size={16} /> Xem tổng kết
          </>
        ) : (
          <>
            Câu tiếp theo <ArrowRight size={16} />
          </>
        )}
      </button>
    </Card>
  );
}

/* ------------------------------ bước nhại lại ------------------------------ */

/**
 * Đây là bước bị bỏ qua nhiều nhất và cũng là bước quan trọng nhất: chính lúc
 * bạn nhại lại câu mẫu thành tiếng, cụm từ mới chuyển từ "hiểu" sang "nói được".
 * Đọc bằng mắt rồi bấm tiếp thì gần như không đọng lại gì.
 */
function EchoStep({ model }: { model: string }) {
  const log = useStore((s) => s.log);
  const { say } = useSpeaker();
  const mic = useMic();
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const manual = !mic.supported || mic.state === 'denied';

  const done = accuracy !== null;

  const finish = (text: string) => {
    const acc = text.trim() ? shadowAccuracy(text, model) : 0;
    setAccuracy(acc);
    log({ shadowLines: 1, xp: 4 + Math.round(acc / 20), minutes: 0.15 });
  };

  return (
    <div
      className={cn(
        'rounded-xl border p-3.5 transition-colors',
        done ? 'border-mint/40 bg-mint/[.07]' : 'border-dashed border-line bg-raised/30',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-bold text-ink">
          {done ? (
            <Check size={15} className="text-mint" />
          ) : (
            <Repeat2 size={15} className="text-faint" />
          )}
          Nhại lại câu mẫu một lần
        </span>

        {done ? (
          <span
            className={cn(
              'font-mono text-xs font-bold',
              accuracy >= 70 ? 'text-mint' : accuracy >= 40 ? 'text-amber' : 'text-rose',
            )}
          >
            khớp {accuracy}%
          </span>
        ) : manual ? (
          <button
            type="button"
            className="btn-ghost px-3 py-1.5 text-xs"
            onClick={() => {
              say(model);
              window.setTimeout(() => finish(''), 200);
            }}
          >
            <Volume2 size={13} /> Nghe rồi nhại
          </button>
        ) : (
          <button
            type="button"
            className={cn('px-3 py-1.5 text-xs', mic.state === 'listening' ? 'btn-violet' : 'btn-ghost')}
            onClick={() => {
              if (mic.state === 'listening') mic.stop();
              else {
                say(model);
                window.setTimeout(() => mic.start(finish), 120);
              }
            }}
          >
            {mic.state === 'listening' ? (
              <>
                <Square size={12} /> Xong
              </>
            ) : (
              <>
                <Mic size={13} /> Nhại theo
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-1 text-xs leading-relaxed text-muted">
        {done
          ? accuracy >= 70
            ? 'Tốt — câu này đã đi qua miệng bạn, không chỉ qua mắt.'
            : 'Nghe lại và nhại thêm một lần nữa nếu bạn muốn chắc hơn.'
          : 'Bấm để nghe câu mẫu rồi nói theo. Chính bước này mới làm cụm từ đọng lại.'}
      </p>

      {mic.transcript && !done && (
        <p className="mt-2 rounded-lg bg-bg/50 px-3 py-1.5 text-xs text-ink">{mic.transcript}</p>
      )}
    </div>
  );
}

/* ------------------------------ tổng kết ------------------------------ */

function Summary({ attempts, onAgain }: { attempts: Attempt[]; onAgain: () => void }) {
  const answered = attempts.filter((a) => !a.skipped && a.result);
  const avgScore = answered.length
    ? Math.round(answered.reduce((s, a) => s + (a.result?.score ?? 0), 0) / answered.length)
    : 0;
  const reactions = attempts.filter((a) => a.reactionMs > 0).map((a) => a.reactionMs);
  const avgMs = reactions.length ? reactions.reduce((a, b) => a + b, 0) / reactions.length : 0;
  const fast = reactions.filter((r) => r < 3000).length;

  const weakest = [...answered]
    .sort((a, b) => (a.result?.score ?? 0) - (b.result?.score ?? 0))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="animate-fade-up text-center">
        <div className="text-4xl">{avgScore >= 70 ? '🔥' : avgScore >= 45 ? '💪' : '🌱'}</div>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">Xong phiên rồi!</h1>
        <p className="mt-1 text-sm text-muted">
          {avgScore >= 70
            ? 'Bạn đang bật ra câu rất tự nhiên. Giữ nhịp này.'
            : avgScore >= 45
              ? 'Đúng hướng rồi. Điều quan trọng là bạn đã nói ra được.'
              : 'Hôm nay hơi vất, nhưng đó là lúc não học nhiều nhất.'}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <SummaryStat label="Điểm TB" value={`${avgScore}`} />
          <SummaryStat label="Phản xạ TB" value={formatMs(avgMs)} />
          <SummaryStat label="Dưới 3 giây" value={`${fast}/${attempts.length}`} />
        </div>
      </Card>

      {weakest.length > 0 && (
        <div>
          <SectionHeader
            title="Ba câu đáng nhại lại"
            desc="Đọc to câu mẫu ba lần trước khi rời trang này."
          />
          <div className="space-y-2">
            {weakest.map((a) => (
              <Card key={a.prompt.id} className="flex items-start gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-faint">{a.prompt.cue}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{a.prompt.model}</p>
                  <p className="text-xs text-muted">{a.prompt.modelVi}</p>
                </div>
                <SpeakButton text={a.prompt.model} variant="icon" />
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onAgain} className="btn-primary flex-1">
          <RotateCcw size={16} /> Làm phiên nữa
        </button>
        <Link to="/listen" className="btn-ghost flex-1">
          Chuyển sang luyện nghe <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-raised/40 py-3">
      <div className="font-mono text-xl font-bold text-ink">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-faint">{label}</div>
    </div>
  );
}
