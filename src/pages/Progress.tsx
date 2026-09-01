import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Flame, Timer, Zap, Trophy, Lock, ArrowRight } from 'lucide-react';
import { Card, Chip, ProgressBar, SectionHeader, Stat, Empty } from '@/components/ui/primitives';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { useStore, selectMasteredCount } from '@/store/useStore';
import { ACHIEVEMENTS, levelFromXp } from '@/data/gamify';
import { REFLEX_BY_ID } from '@/data/reflex';
import { CHUNK_BY_ID } from '@/data/chunks';
import type { DayLog } from '@/types';
import { cn, formatMinutes, formatMs, todayKey, dateFromKey, WEEKDAYS_VI } from '@/lib/utils';

/* Trang tiến độ — cho thấy hai thứ quan trọng nhất: đều đặn, và tốc độ phản xạ. */

export function Progress() {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const bestStreak = useStore((s) => s.bestStreak);
  const totals = useStore((s) => s.totals);
  const history = useStore((s) => s.history);
  const achievements = useStore((s) => s.achievements);
  const bestReactionMs = useStore((s) => s.bestReactionMs);
  const weakIds = useStore((s) => s.weakIds);
  const mastered = useStore(selectMasteredCount);

  const lv = levelFromXp(xp);

  const speedSeries = useMemo(() => {
    const days: { key: string; ms: number }[] = [];
    for (let i = 20; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = todayKey(d);
      const h = history.find((x) => x.date === key);
      days.push({ key, ms: h?.msSamples ? h.avgMs : 0 });
    }
    return days;
  }, [history]);

  const weakList = useMemo(
    () =>
      Object.entries(weakIds)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id, times]) => ({ id, times, item: REFLEX_BY_ID.get(id), chunk: CHUNK_BY_ID.get(id) }))
        .filter((x) => x.item || x.chunk),
    [weakIds],
  );

  return (
    <div className="space-y-8">
      <div className="animate-fade-up flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky/12 text-sky">
          <BarChart3 size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Tiến độ</h1>
          <p className="text-sm text-muted">Đều đặn và tốc độ — hai chỉ số duy nhất đáng theo dõi.</p>
        </div>
      </div>

      {/* cấp độ */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-faint">Cấp độ</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink">{lv.level}</span>
              <span className="text-sm font-semibold text-mint">{lv.title}</span>
            </div>
          </div>
          <span className="font-mono text-xs text-muted">
            {lv.into} / {lv.need} XP tới cấp {lv.level + 1}
          </span>
        </div>
        <ProgressBar value={lv.into} max={lv.need} height={9} className="mt-3" />
        <div className="mt-2 text-xs text-faint">Tổng {xp.toLocaleString('vi-VN')} XP</div>
      </Card>

      {/* số liệu */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Chuỗi hiện tại"
          value={`${streak} ngày`}
          sub={`kỷ lục ${bestStreak} ngày`}
          icon={<Flame size={18} />}
          tone="amber"
        />
        <Stat
          label="Phản xạ nhanh nhất"
          value={formatMs(bestReactionMs)}
          sub={`${totals.fastAnswers} câu dưới 3 giây`}
          icon={<Zap size={18} />}
          tone="mint"
        />
        <Stat
          label="Tổng thời gian"
          value={formatMinutes(totals.minutes)}
          sub={`${totals.daysActive} ngày có mặt`}
          icon={<Timer size={18} />}
          tone="sky"
        />
        <Stat
          label="Cụm đã thuộc"
          value={mastered}
          sub={`${totals.scenarios} tình huống đã diễn`}
          icon={<Trophy size={18} />}
          tone="violet"
        />
      </div>

      {/* lịch nhiệt */}
      <section>
        <SectionHeader title="12 tuần gần nhất" desc="Ô càng sáng nghĩa là hôm đó bạn luyện càng nhiều." />
        <Card className="overflow-x-auto">
          <Heatmap history={history} />
        </Card>
      </section>

      {/* biểu đồ tốc độ */}
      <section>
        <SectionHeader
          title="Tốc độ bật ra câu trả lời"
          desc="Thời gian trung bình từ lúc nghe xong câu hỏi tới lúc bạn cất tiếng. Xuống là tốt."
        />
        <Card>
          <SpeedChart series={speedSeries} />
        </Card>
      </section>

      {/* điểm yếu */}
      <section>
        <SectionHeader
          title="Những câu bạn hay hụt"
          desc="Được ghi lại tự động khi bạn bí hoặc trả lời quá xa câu mẫu."
        />
        {weakList.length === 0 ? (
          <Empty
            emoji="✨"
            title="Chưa có điểm yếu nào được ghi nhận"
            desc="Làm vài phiên phản xạ, app sẽ tự chỉ ra chỗ bạn hay vấp."
            action={
              <Link to="/drill" className="btn-primary">
                Luyện phản xạ <ArrowRight size={15} />
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {weakList.map(({ id, times, item, chunk }) => (
              <Card key={id} className="flex items-start gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Chip tone="rose">hụt {times} lần</Chip>
                  </div>
                  <p className="text-sm font-semibold text-ink">
                    {item ? item.model : chunk?.en}
                  </p>
                  <p className="text-xs text-muted">{item ? item.modelVi : chunk?.vi}</p>
                </div>
                <SpeakButton text={item ? item.model : (chunk?.en ?? '')} variant="icon" />
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* huy hiệu */}
      <section>
        <SectionHeader
          title="Huy hiệu"
          desc={`Đã mở ${achievements.length}/${ACHIEVEMENTS.length}`}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a) => {
            const got = achievements.includes(a.id);
            return (
              <Card
                key={a.id}
                className={cn(
                  '!p-4 text-center transition',
                  got ? 'border-mint/30 bg-mint/[.05]' : 'opacity-55',
                )}
              >
                <div className="text-2xl">{got ? a.emoji : <Lock size={20} className="mx-auto text-faint" />}</div>
                <div className="mt-1.5 text-sm font-bold text-ink">{a.title}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-muted">{a.desc}</div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------ lịch nhiệt ------------------------------ */

function Heatmap({ history }: { history: DayLog[] }) {
  const byDate = new Map(history.map((h) => [h.date, h]));
  const weeks: { key: string; minutes: number }[][] = [];

  const end = new Date();
  // lùi về Chủ nhật gần nhất trước 12 tuần
  const start = new Date(end);
  start.setDate(start.getDate() - 83 - end.getDay());

  const cursor = new Date(start);
  for (let w = 0; w < 13; w += 1) {
    const week: { key: string; minutes: number }[] = [];
    for (let d = 0; d < 7; d += 1) {
      const key = todayKey(cursor);
      week.push({ key, minutes: byDate.get(key)?.minutes ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const level = (m: number) => {
    if (m <= 0) return 0;
    if (m < 5) return 1;
    if (m < 12) return 2;
    if (m < 25) return 3;
    return 4;
  };
  const bg = [
    'bg-raised',
    'bg-mint/25',
    'bg-mint/45',
    'bg-mint/70',
    'bg-mint',
  ];

  const today = todayKey();

  return (
    <div className="min-w-[300px]">
      <div className="flex gap-2">
        <div className="flex flex-col justify-around py-[3px] text-[9px] text-faint">
          {WEEKDAYS_VI.map((d, i) => (
            <span key={d} className={i % 2 === 0 ? '' : 'opacity-0'}>
              {d}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.key}
                  title={`${day.key} — ${Math.round(day.minutes)} phút`}
                  className={cn(
                    'h-3.5 w-3.5 rounded-[3px] transition-colors',
                    bg[level(day.minutes)],
                    day.key === today && 'ring-1 ring-mint ring-offset-1 ring-offset-surface',
                    dateFromKey(day.key) > new Date() && 'opacity-25',
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 pl-6 text-[10px] text-faint">
        <span>ít</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={cn('h-3 w-3 rounded-[3px]', bg[l])} />
        ))}
        <span>nhiều</span>
        <span className="ml-auto">ô viền xanh là hôm nay</span>
      </div>
    </div>
  );
}

/* ------------------------------ biểu đồ tốc độ ------------------------------ */

function SpeedChart({ series }: { series: { key: string; ms: number }[] }) {
  const values = series.filter((s) => s.ms > 0).map((s) => s.ms);
  if (values.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Cần ít nhất hai ngày có dữ liệu để vẽ đường tốc độ. Làm thêm vài phiên phản xạ nhé.
      </p>
    );
  }

  const max = Math.max(...values) * 1.15;
  const min = 0;
  const w = 640;
  const h = 160;
  const pad = 8;

  const points = series.map((s, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = s.ms > 0 ? h - pad - ((s.ms - min) / (max - min)) * (h - pad * 2) : NaN;
    return { x, y, ...s };
  });

  const path = points
    .filter((p) => !Number.isNaN(p.y))
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const first = values[0];
  const last = values[values.length - 1];
  const delta = first - last;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-2xl font-bold text-ink">{formatMs(last)}</span>
        <Chip tone={delta > 0 ? 'mint' : delta < 0 ? 'amber' : 'default'}>
          {delta > 0
            ? `nhanh hơn ${formatMs(Math.abs(delta))} so với đầu kỳ`
            : delta < 0
              ? `chậm hơn ${formatMs(Math.abs(delta))}`
              : 'giữ nguyên'}
        </Chip>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="speedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--c-mint))" stopOpacity="0.28" />
            <stop offset="100%" stopColor="rgb(var(--c-mint))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + f * (h - pad * 2)}
            y2={pad + f * (h - pad * 2)}
            className="stroke-line"
            strokeDasharray="3 5"
            strokeWidth={1}
          />
        ))}
        {path && (
          <>
            <path
              d={`${path} L${points[points.length - 1].x},${h - pad} L${points.find((p) => !Number.isNaN(p.y))!.x},${h - pad} Z`}
              fill="url(#speedFill)"
            />
            <path d={path} fill="none" className="stroke-mint" strokeWidth={2.5} strokeLinejoin="round" />
          </>
        )}
        {points
          .filter((p) => !Number.isNaN(p.y))
          .map((p) => (
            <circle key={p.key} cx={p.x} cy={p.y} r={3} className="fill-mint" />
          ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-faint">
        <span>{series[0].key.slice(5)}</span>
        <span>{series[series.length - 1].key.slice(5)}</span>
      </div>
    </div>
  );
}
