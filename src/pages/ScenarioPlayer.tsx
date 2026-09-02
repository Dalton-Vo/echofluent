import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Volume2,
  Check,
  X,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Trophy,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react';
import { Card, Chip, ProgressBar, SectionHeader } from '@/components/ui/primitives';
import { MicButton } from '@/components/shared/MicButton';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { useMic, useSpeaker } from '@/hooks/useSpeech';
import { useStore } from '@/store/useStore';
import { SCENARIO_BY_ID } from '@/data/scenarios';
import { getChunks } from '@/data/chunks';
import { scoreAnswer, type MatchResult } from '@/lib/match';
import { FN_LABEL, type ScenarioTurn } from '@/types';
import { asset, cn, gradientFor } from '@/lib/utils';

/* ============================================================================
 *  ROLE-PLAY — chạy hội thoại theo lượt.
 *  Lượt của "họ" thì app đọc lên. Lượt của bạn thì bạn phải nói thật.
 * ========================================================================== */

interface Log {
  turn: ScenarioTurn;
  spoken: string;
  result: MatchResult | null;
}

export function ScenarioPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const scenario = id ? SCENARIO_BY_ID.get(id) : undefined;

  const settings = useStore((s) => s.settings);
  const log = useStore((s) => s.log);
  const finishScenario = useStore((s) => s.finishScenario);
  const ensureCards = useStore((s) => s.ensureCards);

  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [showAlts, setShowAlts] = useState(false);
  const [showVi, setShowVi] = useState(settings.showVi);
  const [history, setHistory] = useState<Log[]>([]);
  const [done, setDone] = useState(false);

  const { say, stop } = useSpeaker();
  const mic = useMic();
  const threadRef = useRef<HTMLDivElement>(null);
  const spokenTurn = useRef<number>(-1);

  const turn = scenario?.turns[idx];
  const chunks = useMemo(() => (scenario ? getChunks(scenario.chunkIds) : []), [scenario]);

  /* Đọc lượt của đối phương */
  useEffect(() => {
    if (!turn || done) return;
    if (turn.speaker !== 'them') return;
    if (spokenTurn.current === idx) return;
    spokenTurn.current = idx;
    if (settings.autoPlay) {
      const t = window.setTimeout(() => say(turn.text), 400);
      return () => window.clearTimeout(t);
    }
  }, [idx, turn, done, say, settings.autoPlay]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [idx, answered]);

  useEffect(() => () => stop(), [stop]);

  const advance = useCallback(() => {
    if (!scenario) return;
    stop();
    setAnswered(false);
    setResult(null);
    setShowAlts(false);
    mic.reset();
    if (idx + 1 >= scenario.turns.length) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, scenario, stop]);

  const submit = useCallback(
    async (skipped = false) => {
      if (!turn || turn.speaker !== 'you') return;
      const { text } = await mic.finish();
      const spoken = skipped ? '' : text.trim();
      const r =
        skipped || !spoken ? null : scoreAnswer(spoken, turn.targets ?? [], turn.text);
      setResult(r);
      setAnswered(true);
      setHistory((h) => [...h, { turn, spoken, result: r }]);
      log({ xp: skipped ? 3 : 10 + Math.round((r?.score ?? 0) / 12), minutes: 0.5 });
      if (settings.autoPlay) window.setTimeout(() => say(turn.text), 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [turn, log, say, settings.autoPlay],
  );

  /* Ghi nhận hoàn thành khi tới cuối */
  useEffect(() => {
    if (!done || !scenario) return;
    const scored = history.filter((h) => h.result);
    const avg = scored.length
      ? Math.round(scored.reduce((s, h) => s + (h.result?.score ?? 0), 0) / scored.length)
      : 0;
    finishScenario(scenario.id, avg);
    ensureCards(scenario.chunkIds, 'chunk');
    log({ scenarios: 1, xp: 40 + avg, minutes: scenario.minutes * 0.4 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (!scenario) {
    return (
      <Card className="text-center">
        <p className="text-sm text-muted">Không tìm thấy tình huống này.</p>
        <Link to="/scenarios" className="btn-primary mt-3 inline-flex">
          Quay lại danh sách
        </Link>
      </Card>
    );
  }

  /* ------------------------------ tổng kết ------------------------------ */
  if (done) {
    const scored = history.filter((h) => h.result);
    const avg = scored.length
      ? Math.round(scored.reduce((s, h) => s + (h.result?.score ?? 0), 0) / scored.length)
      : 0;
    const weak = [...history]
      .filter((h) => (h.result?.score ?? 0) < 60)
      .slice(0, 3);

    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Card className="animate-fade-up text-center">
          <div className="text-4xl">{avg >= 70 ? '🎭' : avg >= 45 ? '💪' : '🌱'}</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink">Hoàn thành “{scenario.titleVi}”</h1>
          <p className="mt-1 text-sm text-muted">
            Điểm trung bình {avg}/100 trên {scored.length} lượt nói.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {avg >= 70
              ? 'Bạn xử lý được hầu hết các lượt. Hãy chạy lại và cố dùng các cách nói thay thế thay vì câu mẫu.'
              : 'Chạy lại tình huống này ngày mai. Lần hai bao giờ cũng mượt hơn hẳn — đó chính là phản xạ đang hình thành.'}
          </p>
        </Card>

        {weak.length > 0 && (
          <div>
            <SectionHeader title="Những lượt cần nói lại" desc="Đọc to câu mẫu ba lần." />
            <div className="space-y-2">
              {weak.map((h, i) => (
                <Card key={i} className="flex items-start gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    {h.spoken && <p className="text-xs text-faint">Bạn nói: “{h.spoken}”</p>}
                    <p className="mt-1 text-sm font-semibold text-ink">{h.turn.text}</p>
                    <p className="text-xs text-muted">{h.turn.vi}</p>
                  </div>
                  <SpeakButton text={h.turn.text} variant="icon" />
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <SectionHeader
            title="Cụm đã dùng trong tình huống này"
            desc="Chúng vừa được thêm vào bộ ôn tập của bạn."
          />
          <div className="space-y-2">
            {chunks.map((c) => (
              <Card key={c.id} className="flex items-start gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{c.en}</p>
                  <p className="text-xs text-muted">{c.vi}</p>
                </div>
                <SpeakButton text={c.example} variant="icon" />
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setIdx(0);
              setDone(false);
              setHistory([]);
              setAnswered(false);
              spokenTurn.current = -1;
            }}
            className="btn-primary flex-1"
          >
            <RotateCcw size={16} /> Diễn lại
          </button>
          <button type="button" onClick={() => navigate('/scenarios')} className="btn-ghost flex-1">
            Tình huống khác <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------ đang chơi ------------------------------ */
  const isYou = turn?.speaker === 'you';
  const visible = scenario.turns.slice(0, idx + (isYou && !answered ? 0 : 1));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* header */}
      <div className="flex items-center gap-3">
        <Link to="/scenarios" className="btn-quiet px-2 py-1 text-xs">
          <ArrowLeft size={14} /> Thoát
        </Link>
        <ProgressBar value={idx} max={scenario.turns.length} height={5} tone="amber" />
        <button
          type="button"
          onClick={() => setShowVi((v) => !v)}
          className="btn-quiet px-2 py-1 text-xs"
        >
          {showVi ? <EyeOff size={14} /> : <Eye size={14} />} VI
        </button>
      </div>

      <Card className="!p-0">
        <div
          className="relative flex items-center gap-3 overflow-hidden p-4"
          style={{ background: gradientFor(scenario.id + scenario.title) }}
        >
          {scenario.image && (
            <img
              src={asset(scenario.image)}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-45"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/45" />
          <span className="relative text-2xl">{scenario.emoji}</span>
          <div className="relative min-w-0">
            <div className="truncate font-bold text-white">{scenario.titleVi}</div>
            <div className="truncate text-xs text-white/70">{scenario.contextVi}</div>
          </div>
        </div>

        {/* luồng hội thoại */}
        <div ref={threadRef} className="max-h-[46vh] space-y-3 overflow-y-auto px-4 py-4">
          {visible.map((t, i) => (
            <Bubble key={i} turn={t} showVi={showVi} isCurrent={i === idx} />
          ))}
          {isYou && !answered && (
            <div className="flex justify-end">
              <div className="rounded-2xl rounded-br-md border border-dashed border-mint/40 bg-mint/[.06] px-4 py-3 text-sm text-mint">
                Tới lượt bạn…
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* khu vực hành động */}
      {turn?.speaker === 'them' && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <SpeakButton text={turn.text} label="Nghe lại" variant="ghost" />
          <button type="button" onClick={advance} className="btn-primary">
            Tôi hiểu rồi <ArrowRight size={16} />
          </button>
        </div>
      )}

      {isYou && !answered && turn && (
        <Card className="flex flex-col items-center gap-4 py-6">
          {turn.task && (
            <div className="flex w-full items-start gap-2.5 rounded-xl border border-amber/25 bg-amber/[.07] p-3.5">
              <Target size={16} className="mt-0.5 shrink-0 text-amber" />
              <p className="text-sm leading-relaxed text-ink">{turn.task}</p>
            </div>
          )}

          <MicButton
            state={mic.state}
            level={mic.level}
            resumed={mic.resumed}
            onStart={() => void mic.start()}
            onStop={() => void submit(false)}
            hint={mic.state === 'listening' ? 'Đang nghe… nói xong thì bấm' : 'Bấm rồi nói'}
          />

          {mic.transcript && (
            <p className="max-w-lg rounded-xl bg-raised/60 px-4 py-2.5 text-center text-sm text-ink">
              {mic.transcript}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {(!mic.supported || mic.state === 'denied' || mic.state === 'nomic') && (
              <button type="button" className="btn-primary" onClick={() => void submit(false)}>
                <Check size={15} /> Tôi đã nói xong
              </button>
            )}
            <button type="button" className="btn-ghost" onClick={() => void submit(true)}>
              Bí rồi, xem câu mẫu
            </button>
          </div>
        </Card>
      )}

      {isYou && answered && turn && (
        <Card className="animate-fade-up space-y-4">
          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={result.score >= 60 ? 'mint' : result.score >= 35 ? 'amber' : 'rose'}>
                {result.score}/100
              </Chip>
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
                Câu mẫu
              </span>
              <SpeakButton text={turn.text} variant="icon" />
            </div>
            <p className="text-[15px] font-semibold leading-relaxed text-ink">{turn.text}</p>
            <p className="mt-1 text-xs text-muted">{turn.vi}</p>
          </div>

          {turn.alts && turn.alts.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowAlts((v) => !v)}
                className="btn-quiet w-full justify-start text-xs"
              >
                <Lightbulb size={14} className="text-amber" />
                {showAlts ? 'Ẩn' : `Xem ${turn.alts.length} cách nói khác`}
              </button>
              {showAlts && (
                <div className="mt-2 space-y-2">
                  {turn.alts.map((a, i) => (
                    <div key={i} className="rounded-xl border border-line/70 bg-raised/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{a.text}</p>
                        <SpeakButton text={a.text} variant="icon" />
                      </div>
                      <p className="mt-1 text-xs text-faint">{a.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="button" onClick={advance} className="btn-primary w-full py-3">
            {idx + 1 >= scenario.turns.length ? (
              <>
                <Trophy size={16} /> Kết thúc
              </>
            ) : (
              <>
                Tiếp tục hội thoại <ArrowRight size={16} />
              </>
            )}
          </button>
        </Card>
      )}

      {/* cụm gợi ý */}
      <details className="card group !p-0">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink">
          <Lightbulb size={14} className="mr-1.5 inline text-amber" />
          Bộ cụm dùng được trong tình huống này ({chunks.length})
        </summary>
        <div className="space-y-2 border-t border-line/70 p-4">
          {chunks.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{c.en}</p>
                <p className="text-xs text-muted">
                  <span className="text-faint">{FN_LABEL[c.fn]} · </span>
                  {c.vi}
                </p>
              </div>
              <SpeakButton text={c.en} variant="icon" />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function Bubble({
  turn,
  showVi,
  isCurrent,
}: {
  turn: ScenarioTurn;
  showVi: boolean;
  isCurrent: boolean;
}) {
  const { say } = useSpeaker();
  const them = turn.speaker === 'them';
  return (
    <div className={cn('flex', them ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 transition-all',
          them
            ? 'rounded-bl-md border border-line bg-raised/70'
            : 'rounded-br-md border border-mint/25 bg-mint/[.08]',
          isCurrent && them && 'ring-1 ring-amber/40',
        )}
      >
        <div className="flex items-start gap-2">
          <p className={cn('text-[15px] leading-relaxed', them ? 'text-ink' : 'text-ink')}>
            {turn.text}
          </p>
          <button
            type="button"
            onClick={() => say(turn.text)}
            aria-label="Nghe lại câu này"
            className="mt-0.5 shrink-0 text-faint transition hover:text-mint"
          >
            <Volume2 size={14} />
          </button>
        </div>
        {showVi && <p className="mt-1 text-xs text-muted">{turn.vi}</p>}
      </div>
    </div>
  );
}
