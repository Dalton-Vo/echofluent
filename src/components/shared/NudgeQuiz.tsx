import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Zap, X, SkipForward, Check, Sparkles, ArrowRight } from 'lucide-react';
import { MicButton } from '@/components/shared/MicButton';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { PronunciationCard } from '@/components/shared/PronunciationCard';
import { useMic, useSpeaker } from '@/hooks/useSpeech';
import { useAiCoach } from '@/hooks/useAiCoach';
import { useNudge, popNotification } from '@/hooks/useNudge';
import { useStore } from '@/store/useStore';
import { withinLevel } from '@/lib/level';
import { isWarmupOn } from '@/lib/warmup';
import { WarmupModel } from '@/components/shared/WarmupModel';
import { REFLEX } from '@/data/reflex';
import { looksLikeEcho, scoreAnswer, type MatchResult } from '@/lib/match';
import type { Recording } from '@/lib/audio';
import type { ReflexPrompt } from '@/types';
import { cn, formatMs } from '@/lib/utils';

/* ============================================================================
 *  BẢNG HỎI BẤT CHỢT
 * ============================================================================
 *
 *  Cứ N phút một lần, một câu nhảy ra giữa màn hình và chờ bạn nói. Ý đồ là ép
 *  phản xạ ở đúng trạng thái khó nhất: đang làm việc khác, đầu chưa hề ở chế độ
 *  tiếng Anh. Ngồi vào bàn học tử tế 30 phút thì não đã kịp "khởi động" — mà
 *  trong cuộc họp thật thì chẳng ai cho mình khoảng khởi động đó.
 *
 *  Trả lời xong là đóng lại ngay. Đây không phải một phiên học, chỉ là một câu.
 * ========================================================================== */

export function NudgeQuiz() {
  const settings = useStore((s) => s.settings);
  /* Tính ở đây chứ không lưu sẵn: mốc là thời gian thật, và chọn ra một boolean
   * thì zustand so sánh theo giá trị nên không gây render thừa. */
  const warmup = isWarmupOn(settings.warmupUntil);
  const nudgeCfg = useStore((s) => s.nudge);
  const log = useStore((s) => s.log);
  const ensureCards = useStore((s) => s.ensureCards);
  const markWeak = useStore((s) => s.markWeak);

  const [prompt, setPrompt] = useState<ReflexPrompt | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [answered, setAnswered] = useState(false);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [busy, setBusy] = useState(false);

  const { say, stop: stopSay } = useSpeaker();
  const mic = useMic();
  const coach = useAiCoach();
  const openedAt = useRef(0);

  /* Chỉ lấy câu trong phạm vi trình độ và bối cảnh người dùng đã chọn — bị hỏi
   * bất chợt đã đủ khó rồi, không cần thêm câu ngoài tầm cho nản. */
  const pool = useMemo(() => {
    const inRange = REFLEX.filter(
      (r) => withinLevel(r.level, settings.level) && settings.focusDomains.includes(r.domain),
    );
    return inRange.length ? inRange : REFLEX;
  }, [settings.level, settings.focusDomains]);

  const fire = useCallback(() => {
    // Đang có câu chưa trả lời thì đừng chồng thêm câu nữa.
    if (prompt) return;
    const p = pool[Math.floor(Math.random() * pool.length)];
    if (!p) return;

    setPrompt(p);
    setResult(null);
    setAnswered(false);
    setRecording(null);
    coach.reset();
    openedAt.current = performance.now();

    popNotification(
      'EchoFluent — tới giờ bật ra một câu',
      p.type === 'translate' ? p.cue : p.cueVi,
    );

    if (nudgeCfg.speak && p.type !== 'translate') say(p.cue);
  }, [pool, prompt, say, nudgeCfg.speak, coach]);

  const { left } = useNudge(fire);

  const close = useCallback(() => {
    mic.reset();
    stopSay();
    coach.reset();
    setPrompt(null);
    setResult(null);
    setAnswered(false);
    setRecording(null);
  }, [mic, stopSay, coach]);

  /* Bấm Esc để đóng — đang code dở mà phải rê chuột đi tìm nút X thì lần sau
   * người ta tắt luôn tính năng này. */
  useEffect(() => {
    if (!prompt) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prompt, close]);

  const answer = useCallback(
    async (skipped = false) => {
      if (!prompt) return;
      setBusy(true);
      const { text, recording: rec } = await mic.finish();
      setRecording(rec);

      let spoken = skipped ? '' : text.trim();

      /* Micro thu lại giọng máy vừa đọc câu hỏi thì không phải câu trả lời.
       * Bảng hỏi bất chợt hay bật lên lúc đang cắm loa ngoài nên dính nhiều
       * hơn hẳn màn luyện thường. */
      if (spoken && looksLikeEcho(spoken, prompt.cue)) spoken = '';

      /* Không có chữ nhưng có ghi âm → nhờ AI chép. Cứu Brave và Firefox,
       * nơi nhận diện của trình duyệt chạy mà không bao giờ trả chữ. */
      if (!spoken && !skipped && rec && coach.ready) {
        spoken = (await coach.transcribe(rec)).trim();
      }

      const r = skipped || !spoken ? null : scoreAnswer(spoken, prompt.targets, prompt.model);
      const reaction = performance.now() - openedAt.current;

      setResult(r);
      setAnswered(true);
      setBusy(false);

      // Trả lời được lúc bị hỏi bất chợt đáng giá hơn hẳn lúc ngồi học tử tế.
      log({
        drills: 1,
        xp: skipped ? 2 : 12 + Math.round((r?.score ?? 0) / 10),
        minutes: 0.3,
        reactionMs: skipped ? 0 : reaction,
      });
      ensureCards([prompt.id], 'reflex');
      if (skipped || (r?.score ?? 0) < 45) markWeak(prompt.id);

      say(prompt.model);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prompt, mic, log, ensureCards, markWeak, say, coach.ready],
  );

  if (!nudgeCfg.on) return null;

  /* Chưa tới giờ → chỉ hiện một con số nhỏ ở góc, cho biết còn bao lâu */
  if (!prompt) {
    const mins = Math.floor(left / 60000);
    const secs = Math.floor((left % 60000) / 1000);
    return (
      <button
        type="button"
        onClick={fire}
        title="Hỏi luôn bây giờ"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-line bg-surface/90 px-3 py-1.5 font-mono text-xs text-muted shadow-lg backdrop-blur transition hover:text-ink"
      >
        <Zap size={12} className="text-mint" />
        {mins}:{String(secs).padStart(2, '0')}
      </button>
    );
  }

  const manual =
    !mic.supported || mic.state === 'denied' || mic.state === 'nomic' || mic.state === 'unsupported';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4 backdrop-blur-sm">
      {/* Cao tối đa bằng màn hình, rồi cho phần thân tự cuộn.
        * Trước đây thẻ chỉ có `overflow-hidden`: bảng chấm phát âm dài gấp
        * đôi phần còn lại nên bị cắt cụt, và không có cách nào kéo xuống —
        * người học thấy lời khuyên đứt giữa chừng mà tưởng app hỏng.
        * Dùng `dvh` vì trên di động thanh địa chỉ ăn mất một phần `vh`. */}
      <div className="animate-fade-up flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-mint/30 bg-surface shadow-2xl">
        {/* Thanh đầu đứng yên: nút đóng phải luôn với tới được, kể cả khi
          * đang cuộn giữa một bảng chấm điểm dài. */}
        <div className="flex shrink-0 items-center justify-between border-b border-line/70 px-5 py-3">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mint">
            <Zap size={13} /> Hỏi bất chợt
          </span>
          <button
            type="button"
            onClick={close}
            className="btn-quiet px-2 py-1"
            aria-label="Đóng"
          >
            <X size={15} />
          </button>
        </div>

        {/* Phần thân — chỗ duy nhất được cuộn. `overscroll-contain` để
          * cuộn hết thẻ thì dừng, không kéo lây trang phía sau. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 py-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-faint">
              {prompt.type === 'translate' ? 'Nói câu này bằng tiếng Anh' : 'Trả lời ngay'}
            </p>
            <p className="mx-auto mt-3 max-w-md text-balance text-xl font-bold leading-snug text-ink">
              {prompt.cue}
            </p>
            {prompt.type !== 'translate' && settings.showVi && (
              <p className="mt-1.5 text-sm text-muted">{prompt.cueVi}</p>
            )}
            {prompt.type !== 'translate' && (
              <div className="mt-3">
                <SpeakButton text={prompt.cue} variant="icon" />
              </div>
            )}

            {/* Trả lời xong thì khối kết quả đã có câu mẫu riêng — không hiện hai lần. */}
            {warmup && !answered && (
              <WarmupModel model={prompt.model} vi={prompt.modelVi} showVi={settings.showVi} />
            )}
          </div>

          {!answered ? (
            <div className="flex flex-col items-center gap-4 border-t border-line/70 px-5 py-6">
              <MicButton
                state={mic.state}
                level={mic.level}
                resumed={mic.resumed}
              sttSilent={mic.sttSilent}
              browserName={mic.quirks.name}
              aiReady={coach.ready}
                size="md"
                disabled={busy}
                onStart={() => void mic.start()}
                onStop={() => void answer(false)}
                hint={mic.state === 'listening' ? 'Nói xong bấm để chấm' : 'Bấm rồi nói'}
              />
              {mic.transcript && (
                <p className="max-w-md rounded-xl bg-raised/60 px-4 py-2 text-center text-sm text-ink">
                  {mic.transcript}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                {manual && (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={busy}
                    onClick={() => void answer(false)}
                  >
                    <Check size={15} /> Tôi đã nói xong
                  </button>
                )}
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={busy}
                  onClick={() => void answer(true)}
                >
                  <SkipForward size={15} /> Bỏ qua câu này
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 border-t border-line/70 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    'text-sm font-bold',
                    !result ? 'text-rose' : result.score >= 60 ? 'text-mint' : 'text-amber',
                  )}
                >
                  {result ? `${result.score}/100 điểm` : 'Chưa nói được'}
                </span>
                <span className="font-mono text-xs text-faint">
                  {formatMs(performance.now() - openedAt.current)}
                </span>
              </div>

              <div className="rounded-xl border border-mint/25 bg-mint/[.06] p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-mint">
                    Người bản xứ sẽ nói
                  </span>
                  <SpeakButton text={prompt.model} variant="icon" />
                </div>
                <p className="text-sm font-semibold leading-relaxed text-ink">{prompt.model}</p>
                <p className="mt-1 text-xs text-muted">{prompt.modelVi}</p>
              </div>

              {coach.ready && recording && !coach.report && !coach.busy && !coach.error && (
                <button
                  type="button"
                  onClick={() => void coach.review(recording, prompt.model)}
                  className="btn-violet w-full py-2 text-sm"
                >
                  <Sparkles size={14} /> Chấm phát âm
                </button>
              )}
              {(coach.busy || coach.report || coach.error) && (
                <PronunciationCard report={coach.report} busy={coach.busy} error={coach.error} />
              )}

              <button type="button" onClick={close} className="btn-primary w-full py-2.5">
                Xong, quay lại việc <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
