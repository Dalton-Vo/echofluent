import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Theater, Clock, Check, Search } from 'lucide-react';
import { Card, Chip, SectionHeader } from '@/components/ui/primitives';
import { useStore } from '@/store/useStore';
import { SCENARIOS } from '@/data/scenarios';
import { DOMAIN_LABEL, type Domain } from '@/types';
import { withinLevel } from '@/lib/level';
import { asset, cn, gradientFor } from '@/lib/utils';

/* Danh sách 12 tình huống. Ảnh minh hoạ là tuỳ chọn — thiếu thì tự vẽ gradient. */

const FILTERS: { value: Domain | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'work', label: DOMAIN_LABEL.work },
  { value: 'tech', label: DOMAIN_LABEL.tech },
  { value: 'daily', label: DOMAIN_LABEL.daily },
  { value: 'social', label: DOMAIN_LABEL.social },
];

export function Scenarios() {
  const done = useStore((s) => s.scenarioDone);
  const level = useStore((s) => s.settings.level);
  const [filter, setFilter] = useState<Domain | 'all'>('all');
  const [q, setQ] = useState('');
  /* Đây là trang để DUYỆT, không phải hàng bài tự sinh — nên lọc theo trình độ
   * làm mặc định, chứ không giấu hẳn. Giấu mà không nói thì lần sau người dùng
   * đi tìm một tình huống họ nhớ là có, và tưởng app mất bài. */
  const [showAll, setShowAll] = useState(false);
  const inRange = SCENARIOS.filter((s) => withinLevel(s.level, level));
  const overLevel = SCENARIOS.length - inRange.length;
  /* Lọc tới mức không còn bài nào thì bỏ lọc luôn. Một lưới trống trông y như
   * app hỏng, và người dùng không có cách nào đoán ra là do trình độ. */
  const base = showAll || inRange.length === 0 ? SCENARIOS : inRange;

  const list = base.filter((s) => {
    if (filter !== 'all' && s.domain !== filter) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      s.title.toLowerCase().includes(needle) ||
      s.titleVi.toLowerCase().includes(needle) ||
      s.contextVi.toLowerCase().includes(needle)
    );
  });

  const completed = Object.keys(done).length;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber/12 text-amber">
          <Theater size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Nhập vai tình huống</h1>
          <p className="text-sm text-muted">
            Đối thoại thật, có nhiệm vụ từng lượt. Đã xong {completed}/{SCENARIOS.length} tình huống.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-xl border px-3.5 py-2 text-sm font-semibold transition',
              filter === f.value
                ? 'border-amber/50 bg-amber/10 text-amber'
                : 'border-line bg-raised/40 text-muted hover:text-ink',
            )}
          >
            {f.label}
          </button>
        ))}
        {overLevel > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-pressed={showAll}
            title={`Trình độ đang đặt: ${level}`}
            className={cn(
              'rounded-xl border px-3.5 py-2 text-sm font-semibold transition',
              showAll
                ? 'border-sky/50 bg-sky/10 text-sky'
                : 'border-line bg-raised/40 text-muted hover:text-ink',
            )}
          >
            {showAll ? `Đang hiện cả ${overLevel} bài trên ${level}` : `Hiện thêm ${overLevel} bài trên ${level}`}
          </button>
        )}
        <div className="relative ml-auto min-w-[180px] flex-1 sm:flex-none">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            className="input pl-9"
            placeholder="Tìm tình huống…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s, i) => {
          const progress = done[s.id];
          return (
            <Link
              key={s.id}
              to={`/scenarios/${s.id}`}
              className="card card-hover animate-fade-up overflow-hidden !p-0"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <div
                className="relative flex h-24 items-end justify-between overflow-hidden p-4"
                style={{ background: gradientFor(s.id + s.title) }}
              >
                {s.image && (
                  <img
                    src={asset(s.image)}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="relative text-3xl drop-shadow">{s.emoji}</span>
                {progress && (
                  <span className="relative rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-[#04120c]">
                    <Check size={10} className="mr-0.5 inline" />
                    {progress.best}%
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold leading-tight text-ink">{s.titleVi}</h3>
                <p className="text-xs text-faint">{s.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {s.contextVi}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Chip>{DOMAIN_LABEL[s.domain]}</Chip>
                  <Chip>{s.level}</Chip>
                  <Chip>
                    <Clock size={11} /> {s.minutes}′
                  </Chip>
                  <Chip>{s.turns.filter((t) => t.speaker === 'you').length} lượt nói</Chip>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {list.length === 0 && (
        <Card className="text-center text-sm text-muted">
          Không tìm thấy tình huống nào khớp. Thử bỏ bớt bộ lọc xem sao.
        </Card>
      )}

      <SectionHeader
        title="Muốn thêm tình huống của riêng bạn?"
        desc="Mở src/data/scenarios.ts và thêm một object mới — cấu trúc đã có sẵn chú thích tiếng Việt."
      />
    </div>
  );
}
