import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Repeat2,
  Volume2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Gauge,
  Check,
  Trophy,
  Info,
  Sparkles,
} from 'lucide-react';
import { Card, Chip, ProgressBar, SectionHeader, Segmented } from '@/components/ui/primitives';
import { MicButton } from '@/components/shared/MicButton';
import { useMic, useSpeaker } from '@/hooks/useSpeech';
import { useAiCoach } from '@/hooks/useAiCoach';
import { PronunciationCard } from '@/components/shared/PronunciationCard';
import type { Recording } from '@/lib/audio';
import { useStore } from '@/store/useStore';
import { SHADOW_PACKS, parseShadowLine, plainShadowText } from '@/data/shadowing';
import { shadowAccuracy } from '@/lib/match';
import { DOMAIN_LABEL, type ShadowPack } from '@/types';
import { withinLevel } from '@/lib/level';
import { asset, cn } from '@/lib/utils';

/* ============================================================================
 *  SHADOWING — nói ĐÈ lên giọng mẫu, chậm hơn khoảng nửa giây.
 *
 *  Đây là bài tập đổi "nhạc tính" của tiếng Anh trong miệng bạn: chỗ nào nhấn,
 *  chỗ nào lướt, ngắt hơi ở đâu. Người Việt hay nói đều đều từng chữ — shadowing
 *  chữa đúng bệnh đó.
 * ========================================================================== */

export function Shadowing() {
  const [packId, setPackId] = useState<string | null>(null);
  const pack = SHADOW_PACKS.find((p) => p.id === packId) ?? null;

  if (!pack) return <PackPicker onPick={setPackId} />;
  return <PackPlayer pack={pack} onExit={() => setPackId(null)} />;
}

/* ------------------------------ chọn bộ ------------------------------ */

function PackPicker({ onPick }: { onPick: (id: string) => void }) {
  const level = useStore((s) => s.settings.level);
  /* Giống trang Nhập vai: đây là chỗ để duyệt, nên lọc làm mặc định chứ không
   * giấu hẳn — giấu mà không nói thì người dùng tưởng app mất bài. */
  const [showAll, setShowAll] = useState(false);
  const inRange = SHADOW_PACKS.filter((p) => withinLevel(p.level, level));
  const overLevel = SHADOW_PACKS.length - inRange.length;
  /* Hết bài thì bỏ lọc — xem chú thích cùng lý do ở trang Nhập vai. */
  const packs = showAll || inRange.length === 0 ? SHADOW_PACKS : inRange;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet/12 text-violet">
          <Repeat2 size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Nói đuổi (shadowing)</h1>
          <p className="text-sm text-muted">
            Nói cùng lúc với giọng mẫu, chậm hơn nửa giây. Đừng chờ nghe hết mới nói.
          </p>
        </div>
      </div>

      <Card className="border-violet/25 bg-violet/[.05]">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <Info size={15} className="text-violet" /> Cách shadow đúng
        </h3>
        <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-ink">1.</strong> Nghe một lần, không nói gì. Chỉ để ý chỗ nhấn
            và chỗ ngắt.
          </li>
          <li>
            <strong className="text-ink">2.</strong> Nghe lần hai và nói ĐÈ lên — chấp nhận vấp.
          </li>
          <li>
            <strong className="text-ink">3.</strong> Thu âm lại lần ba. Nhìn phần được đánh dấu:
            <span className="mx-1 rounded bg-violet/20 px-1 font-bold text-violet">từ nhấn</span>
            phải nghe rõ hơn hẳn, còn dấu <span className="font-mono text-violet">/</span> là chỗ
            được phép lấy hơi.
          </li>
        </ol>
      </Card>

      <SectionHeader title="Chọn bộ câu" desc="Mỗi bộ 5–8 câu, khoảng 5 phút." />

      {overLevel > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
          className={cn(
            'rounded-xl border px-3.5 py-2 text-sm font-semibold transition',
            showAll
              ? 'border-sky/50 bg-sky/10 text-sky'
              : 'border-line bg-raised/40 text-muted hover:text-ink',
          )}
        >
          {showAll
            ? `Đang hiện cả ${overLevel} bộ trên ${level}`
            : `Hiện thêm ${overLevel} bộ trên ${level}`}
        </button>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {packs.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p.id)}
            className="card card-hover animate-fade-up overflow-hidden p-0 text-left"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div
              className="h-24 w-full border-b-2 border-line bg-surface bg-cover bg-center"
              style={{
                backgroundImage: `url(${asset(`/images/packs/${p.id}.jpg`)})`,
              }}
            />
            <div className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-ink">{p.titleVi}</div>
                  <div className="text-xs text-faint">{p.title}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Chip>{DOMAIN_LABEL[p.domain]}</Chip>
                    <Chip>{p.level}</Chip>
                    <Chip>{p.lines.length} câu</Chip>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ chơi một bộ ------------------------------ */

function PackPlayer({ pack, onExit }: { pack: ShadowPack; onExit: () => void }) {
  const log = useStore((s) => s.log);
  const [idx, setIdx] = useState(0);
  const [rate, setRate] = useState(pack.baseRate);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const { say } = useSpeaker();
  const mic = useMic();
  const coach = useAiCoach();
  const [recording, setRecording] = useState<Recording | null>(null);

  const line = pack.lines[idx];
  const plain = useMemo(() => plainShadowText(line.text), [line.text]);
  const groups = useMemo(() => parseShadowLine(line.text), [line.text]);

  useEffect(() => {
    setAccuracy(null);
    mic.reset();
    const t = window.setTimeout(() => say(plain, { rate }), 340);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, pack.id]);

  const handleRecordDone = (text: string) => {
    const acc = text.trim() ? shadowAccuracy(text, plain) : 0;
    setAccuracy(acc);
    setScores((s) => [...s, acc]);
    log({ shadowLines: 1, xp: 6 + Math.round(acc / 14), minutes: 0.4 });
  };

  const next = () => {
    if (idx + 1 >= pack.lines.length) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
  };

  if (done) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Card className="animate-fade-up text-center">
          <div className="text-4xl">{avg >= 75 ? '🎯' : avg >= 50 ? '💪' : '🌱'}</div>
          <h1 className="mt-2 text-2xl font-extrabold text-ink">Xong bộ “{pack.titleVi}”</h1>
          <p className="mt-1 text-sm text-muted">
            Độ khớp trung bình {avg}%.{' '}
            {avg >= 75
              ? 'Nhịp của bạn đã bám rất sát bản gốc.'
              : 'Shadow lại bộ này ngày mai — lần hai luôn tốt hơn hẳn.'}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIdx(0);
                setDone(false);
                setScores([]);
              }}
              className="btn-primary"
            >
              <RotateCcw size={16} /> Shadow lại
            </button>
            <button type="button" onClick={onExit} className="btn-ghost">
              Chọn bộ khác
            </button>
            <Link to="/scenarios" className="btn-ghost">
              Sang nhập vai <ArrowRight size={15} />
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onExit} className="btn-quiet px-2 py-1 text-xs">
          <ArrowLeft size={14} /> Bộ khác
        </button>
        <span className="font-mono text-xs text-faint">
          {idx + 1} / {pack.lines.length}
        </span>
        <ProgressBar value={idx} max={pack.lines.length} height={5} tone="violet" />
      </div>

      <Card className="!p-0">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{pack.emoji}</span>
            <span className="text-sm font-bold text-ink">{pack.titleVi}</span>
          </div>
          <Segmented
            size="sm"
            value={String(rate)}
            onChange={(v) => setRate(Number(v))}
            options={[
              { value: '0.75', label: '0.75×' },
              { value: String(pack.baseRate), label: '1×' },
              { value: '1.25', label: '1.25×' },
            ]}
          />
        </div>

        {/* Câu với nhóm nghĩa & trọng âm */}
        <div className="px-5 py-8">
          <div className="flex flex-wrap items-baseline justify-center gap-x-1 gap-y-3 text-center">
            {groups.map((g, gi) => (
              <span key={gi} className="inline-flex flex-wrap items-baseline gap-x-1.5">
                {g.words.map((w, wi) => (
                  <span
                    key={`${gi}-${wi}`}
                    className={cn(
                      'text-[22px] leading-snug transition-colors sm:text-[26px]',
                      w.stress
                        ? 'font-extrabold text-violet'
                        : 'font-medium text-ink/85',
                    )}
                  >
                    {w.w}
                  </span>
                ))}
                {gi < groups.length - 1 && (
                  <span className="mx-1.5 select-none font-mono text-xl text-line">/</span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted">{line.vi}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line/70 px-5 py-4">
          <button type="button" onClick={() => say(plain, { rate })} className="btn-primary">
            <Volume2 size={16} /> Nghe mẫu
          </button>
          <button type="button" onClick={() => say(plain, { rate: 0.68 })} className="btn-ghost">
            <Gauge size={15} /> Rất chậm
          </button>
        </div>
      </Card>

      <Card className="flex flex-col items-center gap-4 py-7">
        <p className="text-center text-sm text-muted">
          Bấm rồi nói ĐÈ lên giọng mẫu — bắt đầu ngay khi mẫu bắt đầu, đừng chờ nghe hết.
        </p>
        <MicButton
          state={mic.state}
          size="md"
          level={mic.level}
          resumed={mic.resumed}
            sttSilent={mic.sttSilent}
            browserName={mic.quirks.name}
            aiReady={false}
          onStart={async () => {
            setRecording(null);
            coach.reset();
            await mic.start();
            // Giọng mẫu chạy song song — shadowing là nói ĐÈ lên, không phải nói sau.
            say(plain, { rate });
          }}
          onStop={async () => {
            const { text, recording: rec } = await mic.finish();
            setRecording(rec);
            handleRecordDone(text);
          }}
          hint={mic.state === 'listening' ? 'Đang thu…' : 'Thu âm & so khớp'}
        />

        {mic.transcript && (
          <p className="max-w-lg rounded-xl bg-raised/60 px-4 py-2.5 text-center text-sm text-ink">
            {mic.transcript}
          </p>
        )}

        {accuracy !== null && (
          <div className="w-full max-w-sm animate-pop">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">Độ khớp với bản gốc</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  accuracy >= 75 ? 'text-mint' : accuracy >= 45 ? 'text-amber' : 'text-rose',
                )}
              >
                {accuracy}%
              </span>
            </div>
            <ProgressBar
              value={accuracy}
              tone={accuracy >= 75 ? 'mint' : accuracy >= 45 ? 'amber' : 'violet'}
              height={7}
            />
            <p className="mt-2 text-center text-xs text-faint">
              {accuracy >= 75
                ? 'Rất sát. Thử lại ở tốc độ nhanh hơn xem sao.'
                : accuracy >= 45
                  ? 'Gần rồi — nghe lại và bám vào các từ được nhấn.'
                  : 'Hạ tốc độ xuống 0.75×, shadow hai lần rồi quay lại tốc độ thật.'}
            </p>
          </div>
        )}

        {/* Chấm phát âm bằng AI — với shadowing thì đây mới là thước đo thật.
            Độ khớp chữ ở trên chỉ nói bạn đọc ĐÚNG TỪ hay không, còn nhịp và
            ngữ điệu — thứ shadowing sinh ra để rèn — thì phải nghe mới biết. */}
        {coach.ready && recording && !coach.report && !coach.busy && !coach.error && (
          <button
            type="button"
            onClick={() => void coach.review(recording, plain)}
            className="btn-violet px-4 py-2 text-sm"
          >
            <Sparkles size={15} /> Chấm phát âm từng từ
          </button>
        )}

        {(coach.busy || coach.report || coach.error) && (
          <div className="w-full max-w-lg">
            <PronunciationCard
              report={coach.report}
              busy={coach.busy}
              error={coach.error}
              onRetry={recording ? () => void coach.review(recording, plain) : undefined}
            />
          </div>
        )}

        {(!mic.supported || mic.state === 'denied' || mic.state === 'nomic') && (
          <button
            type="button"
            onClick={() => {
              log({ shadowLines: 1, xp: 6, minutes: 0.4 });
              next();
            }}
            className="btn-primary"
          >
            <Check size={16} /> Tôi đã shadow xong câu này
          </button>
        )}
      </Card>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
          className="btn-ghost"
        >
          <ArrowLeft size={15} /> Câu trước
        </button>
        <button type="button" onClick={next} className="btn-primary flex-1">
          {idx + 1 >= pack.lines.length ? (
            <>
              <Trophy size={16} /> Hoàn thành bộ
            </>
          ) : (
            <>
              Câu tiếp <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
