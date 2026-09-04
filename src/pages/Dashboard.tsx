import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Headphones,
  Repeat2,
  Theater,
  Library,
  Flame,
  Timer,
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Check,
  ShieldCheck,
  LifeBuoy,
  Flag,
} from 'lucide-react';
import { useStore, selectTodayLog, selectMasteredCount, BLANK_DAY } from '@/store/useStore';
import { Card, Chip, ProgressBar, SectionHeader, Stat } from '@/components/ui/primitives';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { CHUNKS } from '@/data/chunks';
import { missionsForWeek, levelFromXp } from '@/data/gamify';
import { dueCards } from '@/lib/srs';
import { FN_LABEL } from '@/types';
import { cn, formatMs, greeting, todayKey, weekKey, WEEKDAYS_VI, dateFromKey } from '@/lib/utils';
import { WARMUP_DAYS, isWarmupOn, isWarmupOver, startWarmup, warmupDaysLeft } from '@/lib/warmup';

/* Trang chính: trả lời đúng một câu hỏi — "hôm nay tôi nên làm gì?" */

const MODES = [
  {
    to: '/drill',
    icon: Zap,
    tone: 'mint' as const,
    title: 'Phản xạ nhanh',
    desc: 'Nghe câu hỏi → bật ra câu trả lời trong vài giây. Bài tập cốt lõi.',
    time: '5–8 phút',
  },
  {
    to: '/listen',
    icon: Headphones,
    tone: 'sky' as const,
    title: 'Luyện nghe hiểu liền',
    desc: 'Nuốt âm, nối âm, nói nhanh — tập nhận ra dạng NÓI THẬT chứ không phải dạng viết.',
    time: '5 phút',
  },
  {
    to: '/shadow',
    icon: Repeat2,
    tone: 'violet' as const,
    title: 'Nói đuổi (shadowing)',
    desc: 'Nói đè lên giọng mẫu để đổi nhịp điệu và trọng âm của bạn.',
    time: '6 phút',
  },
  {
    to: '/scenarios',
    icon: Theater,
    tone: 'amber' as const,
    title: 'Nhập vai tình huống',
    desc: '12 hoàn cảnh thật: standup, phỏng vấn, bác sĩ, sân bay, khiếu nại hoá đơn.',
    time: '5–7 phút',
  },
];

export function Dashboard() {
  const settings = useStore((s) => s.settings);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const totals = useStore((s) => s.totals);
  const history = useStore((s) => s.history);
  const srs = useStore((s) => s.srs);
  const week = useStore((s) => s.week);
  const lastBackupAt = useStore((s) => s.lastBackupAt);
  const today = useStore(selectTodayLog) ?? BLANK_DAY;
  const mastered = useStore(selectMasteredCount);

  const lv = levelFromXp(xp);
  const due = dueCards(srs).length;

  // Nhắc sao lưu khi đã có ít nhất 3 ngày học và chưa sao lưu trong 3 tuần
  const needsBackup =
    history.length >= 3 &&
    (lastBackupAt === null || Date.now() - lastBackupAt > 21 * 86400000);
  const missions = useMemo(() => missionsForWeek(weekKey()), []);
  const wkTotals = week.key === weekKey() ? week.totals : null;

  const todayMinutes = today.minutes;
  const goalPct = Math.min(100, (todayMinutes / settings.dailyGoalMin) * 100);

  const chunkOfDay = useMemo(() => {
    const seed = todayKey()
      .split('-')
      .reduce((a, b) => a + Number(b), 0);
    return CHUNKS[seed % CHUNKS.length];
  }, []);

  const name = settings.name ? `, ${settings.name}` : '';

  return (
    <div className="space-y-8">
      <WarmupBanner />

      {/* ---------------- Lời chào + tiến độ hôm nay ---------------- */}
      <section className="animate-fade-up">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-[28px]">
            {greeting()}
            {name}
          </h1>
          {streak > 0 && (
            <Chip tone="amber">
              <Flame size={12} /> chuỗi {streak} ngày
            </Chip>
          )}
        </div>
        <p className="text-sm text-muted">
          {todayMinutes === 0
            ? 'Chưa bắt đầu hôm nay. Mở miệng 5 phút thôi cũng tính.'
            : goalPct >= 100
              ? 'Đạt mục tiêu hôm nay rồi. Làm thêm thì chỉ có lợi.'
              : `Còn ${Math.max(1, Math.ceil(settings.dailyGoalMin - todayMinutes))} phút nữa là đủ mục tiêu hôm nay.`}
        </p>

        <Card className="mt-4 overflow-hidden !p-0">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="text-sm font-bold text-ink">Mục tiêu hôm nay</span>
                <span className="font-mono text-xs text-muted">
                  {Math.round(todayMinutes)} / {settings.dailyGoalMin} phút
                </span>
              </div>
              <ProgressBar value={todayMinutes} max={settings.dailyGoalMin} height={10} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip>{today.drills} phản xạ</Chip>
                <Chip>{today.listens} bài nghe</Chip>
                <Chip>{today.shadowLines} câu shadow</Chip>
                {today.reviews > 0 && <Chip tone="violet">{today.reviews} thẻ ôn</Chip>}
              </div>
            </div>
            <Link to="/drill" className="btn-primary shrink-0 px-5 py-3 text-[15px]">
              <Zap size={17} />
              Vào luyện ngay
            </Link>
          </div>
          <div className="h-1 w-full bg-line/60">
            <div
              className="h-full bg-mint transition-none"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </Card>
      </section>

      {/* ---------------- Số liệu nhanh ---------------- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Cấp độ"
          value={lv.level}
          sub={lv.title}
          icon={<Sparkles size={18} />}
          tone="mint"
        />
        <Stat
          label="Phản xạ TB"
          value={formatMs(averageMs(history))}
          sub={today.msSamples ? `${today.msSamples} câu hôm nay` : 'chưa có dữ liệu'}
          icon={<Timer size={18} />}
          tone="sky"
        />
        <Stat
          label="Cụm đã thuộc"
          value={mastered}
          sub={`trên ${CHUNKS.length} cụm`}
          icon={<Library size={18} />}
          tone="violet"
        />
        <Stat
          label="Tổng câu đã nói"
          value={totals.drills + totals.shadowLines}
          sub={`${Math.round(totals.minutes)} phút luyện`}
          icon={<TrendingUp size={18} />}
          tone="amber"
        />
      </section>

      {/* ---------------- Thẻ ôn tới hạn ---------------- */}
      {due > 0 && (
        <Link
          to="/review"
          className="card card-hover flex items-center gap-4 border-amber/30 bg-amber/[.06] p-5"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber/15 text-amber">
            <Repeat2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-ink">
              {due} cụm đang chờ bạn ôn lại bằng miệng
            </div>
            <p className="text-xs text-muted">
              Ôn đúng lúc sắp quên là cách rẻ nhất để cụm từ nằm lại trong đầu.
            </p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-amber" />
        </Link>
      )}

      {/* ---------------- Nhắc sao lưu ----------------
       * Tiến độ chỉ nằm trong trình duyệt. Người ta không bao giờ tự nhớ sao lưu
       * cho tới lúc mất sạch, nên app phải chủ động nhắc khi đã có gì để mất. */}
      {needsBackup && (
        <Link
          to="/settings"
          className="card card-hover flex items-center gap-4 border-sky/30 bg-sky/[.06] p-5"
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky/15 text-sky">
            <ShieldCheck size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-ink">
              {history.length} ngày học đang chỉ nằm trong trình duyệt này
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Xoá dữ liệu duyệt web, đổi máy, hay dùng Safari trên iPhone mà nghỉ một tuần — là
              mất hết. Tải file sao lưu mất 5 giây.
            </p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-sky" />
        </Link>
      )}

      {/* ---------------- Kế hoạch buổi học ---------------- */}
      <section>
        <SectionHeader
          title="Buổi học hôm nay"
          desc="Công thức 15 phút trong hướng dẫn. Làm theo thứ tự, khỏi phải nghĩ hôm nay tập gì."
        />
        <TodayPlan today={today} due={due} />
      </section>

      {/* ---------------- Các chế độ luyện ---------------- */}
      <section>
        <SectionHeader
          title="Hoặc tự chọn kiểu luyện"
          desc="Mỗi chế độ đánh vào một điểm nghẽn khác nhau."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m, i) => (
            <Link
              key={m.to}
              to={m.to}
              className="card card-hover group animate-fade-up p-5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    'grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-current',
                    {
                      mint: 'bg-mint/12 text-mint',
                      sky: 'bg-sky/12 text-sky',
                      violet: 'bg-violet/12 text-violet',
                      amber: 'bg-amber/12 text-amber',
                    }[m.tone],
                  )}
                >
                  <m.icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-ink">{m.title}</h3>
                    <span className="text-[11px] text-faint">{m.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{m.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Cụm của ngày ---------------- */}
      <section>
        <SectionHeader
          title="Cụm của hôm nay"
          desc="Ép mình dùng nó ít nhất một lần trong ngày — nói với ai cũng được, kể cả nói một mình."
          action={
            <Link to="/chunks" className="btn-quiet text-xs">
              Xem cả thư viện <ArrowRight size={13} />
            </Link>
          }
        />
        <Card className="border-violet/25 bg-violet/[.05]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Chip tone="violet">{FN_LABEL[chunkOfDay.fn]}</Chip>
              <p className="mt-2.5 text-xl font-bold leading-snug text-ink">“{chunkOfDay.en}”</p>
              <p className="mt-1 text-sm text-muted">{chunkOfDay.vi}</p>
              <div className="mt-3 rounded-xl border border-line/70 bg-bg/40 p-3">
                <p className="text-sm italic text-ink">{chunkOfDay.example}</p>
                <p className="mt-1 text-xs text-faint">{chunkOfDay.exampleVi}</p>
              </div>
              {chunkOfDay.say && (
                <p className="mt-2 text-xs text-violet">💡 {chunkOfDay.say}</p>
              )}
            </div>
            <SpeakButton text={chunkOfDay.example} variant="ghost" />
          </div>
        </Card>
      </section>

      {/* ---------------- Nhiệm vụ tuần ---------------- */}
      <section>
        <SectionHeader
          title="Nhiệm vụ tuần này"
          desc="Đổi mới mỗi thứ Hai. Làm xong cả ba là một tuần rất ổn."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {missions.map((m) => {
            const cur = wkTotals ? wkTotals[m.metric] : 0;
            const done = cur >= m.target;
            return (
              <Card
                key={m.id}
                className={cn('p-4', done && 'border-mint/40 bg-mint/[.06]')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{m.emoji}</span>
                  <span className="flex-1 text-sm font-bold text-ink">{m.title}</span>
                  {done && <Chip tone="mint">xong</Chip>}
                </div>
                <p className="mt-1 text-xs text-muted">{m.desc}</p>
                <div className="mt-3">
                  <ProgressBar
                    value={Math.min(cur, m.target)}
                    max={m.target}
                    height={6}
                    tone={done ? 'mint' : 'violet'}
                  />
                  <div className="mt-1.5 flex justify-between text-[11px] text-faint">
                    <span>
                      {Math.min(cur, m.target)} / {m.target}
                    </span>
                    <span>+{m.xp} XP</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---------------- Nhịp 14 ngày ---------------- */}
      <section>
        <SectionHeader title="14 ngày gần nhất" desc="Đều đặn quan trọng hơn dài hơi." />
        <Card>
          <MiniHeat history={history} goal={settings.dailyGoalMin} />
        </Card>
      </section>

      <p className="pb-2 text-center text-xs text-faint">
        <Target size={12} className="mr-1 inline" />
        Mục tiêu không phải nói đúng ngữ pháp — mà là nghe hiểu liền và đáp lại được ngay.
      </p>
    </div>
  );
}

/* ------------------------------ kế hoạch trong ngày ------------------------------
 * Bốn bước theo đúng công thức trong HUONG_DAN.md. Bước tiếp theo được làm nổi
 * bật, các bước đã xong tự đánh dấu — người học không phải tự nhớ mình đang ở đâu.
 */
function TodayPlan({
  today,
  due,
}: {
  today: { reviews: number; drills: number; listens: number; shadowLines: number };
  due: number;
}) {
  const steps = [
    {
      to: '/review',
      emoji: '♻️',
      title: 'Dọn thẻ tới hạn',
      desc: due > 0 ? `${due} thẻ đang chờ` : 'không còn thẻ nào tới hạn',
      done: due === 0 || today.reviews >= Math.min(due + today.reviews, 5),
      minutes: 3,
    },
    {
      to: '/drill',
      emoji: '⚡',
      title: 'Phản xạ 10 câu',
      desc: 'bài chính — làm lúc não còn tươi',
      done: today.drills >= 10,
      progress: `${Math.min(today.drills, 10)}/10`,
      minutes: 5,
    },
    {
      to: '/listen',
      emoji: '🎧',
      title: 'Luyện nghe 8 bài',
      desc: 'đổi kênh, cho miệng nghỉ, cho tai làm việc',
      done: today.listens >= 8,
      progress: `${Math.min(today.listens, 8)}/8`,
      minutes: 4,
    },
    {
      to: '/shadow',
      emoji: '🗣️',
      title: 'Shadow một bộ',
      desc: 'kết buổi bằng cảm giác nói trôi chảy',
      done: today.shadowLines >= 6,
      progress: `${Math.min(today.shadowLines, 6)}/6`,
      minutes: 3,
    },
  ];

  const nextIdx = steps.findIndex((s) => !s.done);
  const allDone = nextIdx === -1;

  return (
    <Card className="!p-0">
      {allDone && (
        <div className="flex items-center gap-2 border-b border-line/70 bg-mint/[.07] px-4 py-2.5 text-sm font-semibold text-mint">
          <Check size={15} /> Xong cả buổi hôm nay. Làm thêm chỉ có lợi.
        </div>
      )}
      <ol>
        {steps.map((s, i) => {
          const isNext = i === nextIdx;
          return (
            <li key={s.to} className={i > 0 ? 'border-t border-line/60' : ''}>
              <Link
                to={s.to}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 transition-colors',
                  isNext ? 'bg-mint/[.06]' : 'hover:bg-raised/40',
                )}
              >
                <span
                  className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm transition-colors',
                    s.done
                      ? 'bg-mint text-[#04120c]'
                      : isNext
                        ? 'bg-mint/15 text-mint ring-1 ring-mint/40'
                        : 'bg-raised text-faint',
                  )}
                >
                  {s.done ? <Check size={15} strokeWidth={3} /> : s.emoji}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm font-bold',
                      s.done ? 'text-muted line-through decoration-line' : 'text-ink',
                    )}
                  >
                    {s.title}
                  </span>
                  <span className="block truncate text-xs text-muted">{s.desc}</span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {!s.done && s.progress && (
                    <span className="font-mono text-[11px] text-faint">{s.progress}</span>
                  )}
                  <span className="text-[11px] text-faint">{s.minutes}′</span>
                  {isNext && <ArrowRight size={15} className="text-mint" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function averageMs(history: { avgMs: number; msSamples: number }[]): number {
  let total = 0;
  let n = 0;
  for (const h of history.slice(-14)) {
    total += h.avgMs * h.msSamples;
    n += h.msSamples;
  }
  return n ? total / n : 0;
}

function MiniHeat({
  history,
  goal,
}: {
  history: { date: string; minutes: number; xp: number }[];
  goal: number;
}) {
  const days: { key: string; minutes: number }[] = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayKey(d);
    days.push({ key, minutes: history.find((h) => h.date === key)?.minutes ?? 0 });
  }

  return (
    <div className="flex items-end justify-between gap-1.5">
      {days.map((d) => {
        const pct = Math.min(1, d.minutes / Math.max(1, goal));
        const dow = dateFromKey(d.key).getDay();
        return (
          <div key={d.key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div
              className="flex w-full items-end bg-line"
              style={{ height: 56 }}
              title={`${d.key} — ${Math.round(d.minutes)} phút`}
            >
              <div
                className="w-full bg-mint"
                style={{ height: Math.ceil(pct * 14) * 4 }}
              />
            </div>
            <span className="text-[10px] text-faint">{WEEKDAYS_VI[dow]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ chế độ làm quen ------------------------------ */

/**
 * Dải nhắc ở đầu trang chính.
 *
 * Hiện khi đang trong giai đoạn làm quen (đếm ngày lùi), và hiện lại lúc hết
 * hạn để hỏi một câu. Đặt ở đây chứ không giấu trong Cài đặt vì nó cần được
 * nhìn thấy mỗi ngày: cái phao mà quên mất là mình đang cầm thì nó thành nạng.
 *
 * Không có gì thì không chiếm chỗ — đây là trang trả lời "hôm nay làm gì", một
 * dải trống nằm trên cùng chỉ làm loãng câu trả lời đó.
 */
function WarmupBanner() {
  const until = useStore((s) => s.settings.warmupUntil);
  const setSettings = useStore((s) => s.setSettings);

  if (isWarmupOn(until)) {
    const left = warmupDaysLeft(until);
    return (
      <Card className="animate-fade-up border-sky/30 bg-sky/[.06] !p-4">
        <div className="flex flex-wrap items-center gap-3">
          <LifeBuoy size={18} className="shrink-0 text-sky" />
          <p className="min-w-0 flex-1 text-sm text-muted">
            <strong className="text-ink">Đang làm quen — còn {left} ngày.</strong> Câu mẫu hiện
            sẵn trước khi bạn nói. Cứ nhại theo cho quen miệng đã.
          </p>
          <button
            type="button"
            className="btn-quiet text-xs"
            onClick={() => setSettings({ warmupUntil: null })}
          >
            <Flag size={13} /> Quay lại đường đua
          </button>
        </div>
      </Card>
    );
  }

  if (isWarmupOver(until)) {
    return (
      <Card className="animate-fade-up border-amber/30 bg-amber/[.06] !p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Flag size={18} className="shrink-0 text-amber" />
          <p className="min-w-0 flex-1 text-sm text-muted">
            <strong className="text-ink">Hết {WARMUP_DAYS} ngày làm quen rồi.</strong> Quay lại
            đường đua, hay cần thêm một đợt nữa? Gia hạn không phải là thua.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary px-3 py-1.5 text-xs"
              onClick={() => setSettings({ warmupUntil: null })}
            >
              Tôi sẵn sàng
            </button>
            <button
              type="button"
              className="btn-quiet text-xs"
              onClick={() => setSettings({ warmupUntil: startWarmup() })}
            >
              Thêm {WARMUP_DAYS} ngày
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
