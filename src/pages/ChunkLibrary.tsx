import { useMemo, useState } from 'react';
import { Library, Search, Plus, Check, Volume2, Sparkles } from 'lucide-react';
import { Card, Chip, ProgressBar, SectionHeader } from '@/components/ui/primitives';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { MemoryAid } from '@/components/shared/MemoryAid';
import { useSpeaker } from '@/hooks/useSpeech';
import { useStore } from '@/store/useStore';
import { CHUNKS } from '@/data/chunks';
import { isMastered } from '@/lib/srs';
import { DOMAIN_LABEL, FN_LABEL, type Domain, type FunctionTag } from '@/types';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  THƯ VIỆN CỤM — tra cứu theo TÌNH HUỐNG GIAO TIẾP, không theo chủ đề từ vựng.
 *  Bạn không tìm "từ về nhà hàng" mà tìm "làm sao phản đối lịch sự".
 * ========================================================================== */

const FN_GROUPS: { label: string; fns: FunctionTag[] }[] = [
  { label: 'Giữ mạch hội thoại', fns: ['thinking', 'clarify', 'turn-taking', 'reacting'] },
  { label: 'Bày tỏ quan điểm', fns: ['opinion', 'agree', 'disagree', 'softening'] },
  { label: 'Trong công việc', fns: ['status', 'feedback', 'planning', 'problem', 'asking', 'phone'] },
  { label: 'Ngoài đời sống', fns: ['smalltalk', 'service', 'travel', 'health', 'closing'] },
];

export function ChunkLibrary() {
  const srs = useStore((s) => s.srs);
  const ensureCards = useStore((s) => s.ensureCards);
  const { say } = useSpeaker();

  const [q, setQ] = useState('');
  const [fn, setFn] = useState<FunctionTag | 'all'>('all');
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [onlyNew, setOnlyNew] = useState(false);

  const list = useMemo(
    () =>
      CHUNKS.filter((c) => {
        if (fn !== 'all' && c.fn !== fn) return false;
        if (domain !== 'all' && c.domain !== domain) return false;
        if (onlyNew && srs[c.id]) return false;
        if (!q.trim()) return true;
        const n = q.toLowerCase();
        return (
          c.en.toLowerCase().includes(n) ||
          c.vi.toLowerCase().includes(n) ||
          c.example.toLowerCase().includes(n)
        );
      }),
    [q, fn, domain, onlyNew, srs],
  );

  const inDeck = CHUNKS.filter((c) => srs[c.id]).length;
  const mastered = CHUNKS.filter((c) => srs[c.id] && isMastered(srs[c.id])).length;

  const addAll = () => ensureCards(list.map((c) => c.id), 'chunk');

  return (
    <div className="space-y-6">
      <div className="animate-fade-up flex items-center gap-2.5">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet/12 text-violet">
          <Library size={21} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Thư viện cụm phản xạ</h1>
          <p className="text-sm text-muted">
            {CHUNKS.length} cụm, sắp theo <em>tình huống giao tiếp</em> chứ không theo chủ đề từ vựng.
          </p>
        </div>
      </div>

      <Card className="!p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-bold text-ink">Tiến độ thư viện</span>
          <span className="font-mono text-xs text-muted">
            {mastered} thuộc · {inDeck} đang ôn · {CHUNKS.length} tổng
          </span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-raised">
          <div
            className="absolute inset-y-0 left-0 bg-violet/50 transition-[width] duration-500"
            style={{ width: `${(inDeck / CHUNKS.length) * 100}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-mint transition-[width] duration-500"
            style={{ width: `${(mastered / CHUNKS.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* bộ lọc */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              className="input pl-9"
              placeholder="Tìm cụm, nghĩa tiếng Việt, hoặc ví dụ…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setOnlyNew((v) => !v)}
            className={cn(
              'rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition',
              onlyNew
                ? 'border-violet/50 bg-violet/10 text-violet'
                : 'border-line bg-raised/40 text-muted hover:text-ink',
            )}
          >
            <Sparkles size={14} className="mr-1 inline" />
            Chỉ cụm chưa học
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <FilterPill active={fn === 'all'} onClick={() => setFn('all')}>
            Tất cả chức năng
          </FilterPill>
          {FN_GROUPS.map((g) => (
            <div key={g.label} className="flex flex-wrap gap-1.5">
              {g.fns.map((f) => (
                <FilterPill key={f} active={fn === f} onClick={() => setFn(f)}>
                  {FN_LABEL[f]}
                </FilterPill>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <FilterPill active={domain === 'all'} onClick={() => setDomain('all')} tone="sky">
            Mọi bối cảnh
          </FilterPill>
          {(['work', 'tech', 'daily', 'social'] as Domain[]).map((d) => (
            <FilterPill key={d} active={domain === d} onClick={() => setDomain(d)} tone="sky">
              {DOMAIN_LABEL[d]}
            </FilterPill>
          ))}
          <button type="button" onClick={addAll} className="btn-quiet ml-auto text-xs">
            <Plus size={14} /> Thêm {list.length} cụm vào bộ ôn
          </button>
        </div>
      </div>

      <SectionHeader title={`${list.length} cụm`} desc="Bấm loa để nghe câu ví dụ, rồi nhại lại thành tiếng." />

      <div className="grid gap-2.5">
        {list.map((c) => {
          const card = srs[c.id];
          const done = card && isMastered(card);
          return (
            <Card key={c.id} className="!p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <Chip tone="violet">{FN_LABEL[c.fn]}</Chip>
                    <Chip>{DOMAIN_LABEL[c.domain]}</Chip>
                    <Chip>{c.level}</Chip>
                    {c.register === 'casual' && <Chip tone="amber">thân mật</Chip>}
                    {c.register === 'formal' && <Chip tone="sky">trang trọng</Chip>}
                    {done && (
                      <Chip tone="mint">
                        <Check size={11} /> đã thuộc
                      </Chip>
                    )}
                  </div>

                  <p className="text-[17px] font-bold leading-snug text-ink">{c.en}</p>
                  <p className="mt-0.5 text-sm text-muted">{c.vi}</p>

                  <div className="mt-2.5 rounded-xl border border-line/70 bg-raised/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm italic text-ink">{c.example}</p>
                      <button
                        type="button"
                        onClick={() => say(c.example)}
                        aria-label="Nghe ví dụ"
                        className="shrink-0 text-faint transition hover:text-violet"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-faint">{c.exampleVi}</p>
                  </div>

                  {c.say && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
                      <Volume2 size={13} className="mt-0.5 shrink-0 text-faint" />
                      {c.say}
                    </p>
                  )}

                  <MemoryAid chunkId={c.id} />
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2">
                  <SpeakButton text={c.en} variant="icon" />
                  {!card && (
                    <button
                      type="button"
                      onClick={() => ensureCards([c.id], 'chunk')}
                      aria-label="Thêm vào bộ ôn"
                      className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-raised/60 text-muted transition hover:border-violet/40 hover:text-violet"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                  {card && (
                    <div className="w-9 text-center">
                      <ProgressBar
                        value={Math.min(card.intervalDays, 21)}
                        max={21}
                        height={4}
                        tone={done ? 'mint' : 'violet'}
                      />
                      <span className="mt-1 block text-[10px] text-faint">
                        {card.intervalDays}d
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {list.length === 0 && (
        <Card className="text-center text-sm text-muted">
          Không có cụm nào khớp bộ lọc. Thử xoá từ khoá hoặc chọn “Tất cả chức năng”.
        </Card>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  tone = 'violet',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'violet' | 'sky';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
        active
          ? tone === 'violet'
            ? 'border-violet/50 bg-violet/10 text-violet'
            : 'border-sky/50 bg-sky/10 text-sky'
          : 'border-line bg-raised/40 text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
