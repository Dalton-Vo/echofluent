import { useMemo, useState } from 'react';
import { Library, Search, Plus, Check, Volume2, Sparkles, Flame, ShieldAlert } from 'lucide-react';
import { Card, Chip, ProgressBar, SectionHeader } from '@/components/ui/primitives';
import { SpeakButton } from '@/components/shared/SpeakButton';
import { MemoryAid } from '@/components/shared/MemoryAid';
import { useSpeaker } from '@/hooks/useSpeech';
import { useStore } from '@/store/useStore';
import { ipaOf } from '@/data/phonemes';
import { CHUNKS } from '@/data/chunks';
import { isMastered } from '@/lib/srs';
import { DOMAIN_LABEL, FN_LABEL, type Domain, type FunctionTag, type Heat } from '@/types';
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
  { label: 'Nói bựa', fns: ['venting', 'banter', 'emphasis', 'dismissal'] },
];

/** Số cụm bựa — tính một lần, không đổi trong suốt vòng đời app */
const RAW_COUNT = CHUNKS.filter((c) => c.register === 'raw').length;

export function ChunkLibrary() {
  const srs = useStore((s) => s.srs);
  const ensureCards = useStore((s) => s.ensureCards);
  const { say } = useSpeaker();

  const [q, setQ] = useState('');
  const [fn, setFn] = useState<FunctionTag | 'all'>('all');
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [onlyNew, setOnlyNew] = useState(false);
  /* Bộ lọc riêng của mảng nói bựa. Tách khỏi bộ lọc chức năng vì độ nóng là
   * một CHIỀU KHÁC: "cà khịa mức 1" và "cà khịa mức 3" là hai câu khác nhau
   * hoàn toàn về chỗ dùng, dù cùng một chức năng. */
  const [rawOnly, setRawOnly] = useState(false);
  const [heat, setHeat] = useState<Heat | 'all'>('all');

  const list = useMemo(
    () =>
      CHUNKS.filter((c) => {
        if (fn !== 'all' && c.fn !== fn) return false;
        if (domain !== 'all' && c.domain !== domain) return false;
        if (onlyNew && srs[c.id]) return false;
        if (rawOnly && c.register !== 'raw') return false;
        // Chọn một mức nóng thì hiển nhiên chỉ còn cụm bựa
        if (heat !== 'all' && c.heat !== heat) return false;
        if (!q.trim()) return true;
        const n = q.toLowerCase();
        return (
          c.en.toLowerCase().includes(n) ||
          c.vi.toLowerCase().includes(n) ||
          c.example.toLowerCase().includes(n)
        );
      }),
    [q, fn, domain, onlyNew, rawOnly, heat, srs],
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
          <button
            type="button"
            onClick={() => {
              const next = !rawOnly;
              setRawOnly(next);
              if (!next) setHeat('all');
            }}
            aria-pressed={rawOnly}
            className={cn(
              'rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition',
              rawOnly
                ? 'border-rose/50 bg-rose/10 text-rose'
                : 'border-line bg-raised/40 text-muted hover:text-ink',
            )}
          >
            <Flame size={14} className="mr-1 inline" />
            Chỉ cụm bựa ({RAW_COUNT})
          </button>
        </div>

        {rawOnly && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-faint">Độ nóng</span>
            <FilterPill active={heat === 'all'} onClick={() => setHeat('all')} tone="rose">
              Mọi mức
            </FilterPill>
            {([1, 2, 3] as Heat[]).map((h) => (
              <FilterPill key={h} active={heat === h} onClick={() => setHeat(h)} tone="rose">
                {'🔥'.repeat(h)} {HEAT_LABEL[h]}
              </FilterPill>
            ))}
          </div>
        )}

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

      {rawOnly && <RedLineCard />}

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
                    {c.register === 'raw' && c.heat && (
                      <Chip tone="rose">
                        {'🔥'.repeat(c.heat)} {HEAT_LABEL[c.heat]}
                      </Chip>
                    )}
                    {done && (
                      <Chip tone="mint">
                        <Check size={11} /> đã thuộc
                      </Chip>
                    )}
                  </div>

                  <p className="text-[17px] font-bold leading-snug text-ink">{c.en}</p>
                  {/* Phiên âm tra từ điển CMU đóng sẵn — không cần mạng, không tốn lượt AI */}
                  <IpaLine text={c.en} />
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

                  {/* Chỗ dùng được, chỗ không — với cụm bựa đây là phần quan
                    * trọng hơn cả nghĩa, nên nó nằm TRƯỚC mẹo phát âm. */}
                  {c.warn && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xl border border-rose/25 bg-rose/[.06] p-2.5 text-xs leading-relaxed text-muted">
                      <ShieldAlert size={13} className="mt-0.5 shrink-0 text-rose" />
                      <span>{c.warn}</span>
                    </p>
                  )}

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
  tone?: 'violet' | 'sky' | 'rose';
}) {
  const activeTone = {
    violet: 'border-violet/50 bg-violet/10 text-violet',
    sky: 'border-sky/50 bg-sky/10 text-sky',
    rose: 'border-rose/50 bg-rose/10 text-rose',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
        active ? activeTone : 'border-line bg-raised/40 text-muted hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------ phiên âm ------------------------------ */

/**
 * Dòng phiên âm IPA dưới mỗi cụm.
 *
 * Bỏ qua lặng lẽ những từ không có trong từ điển thay vì in dấu "?" — một cụm
 * lấm chấm dấu hỏi trông như app hỏng, trong khi thiếu vài từ chẳng ảnh hưởng
 * gì tới việc đọc cả cụm.
 */
function IpaLine({ text }: { text: string }) {
  const ipa = text
    .split(/\s+/)
    .map((w) => ipaOf(w))
    .filter(Boolean)
    .join(' ');

  if (!ipa) return null;
  return <p className="mt-0.5 font-mono text-xs text-faint">/{ipa}/</p>;
}

/* ------------------------------ mảng nói bựa ------------------------------ */

const HEAT_LABEL: Record<Heat, string> = {
  1: 'nhẹ',
  2: 'vừa',
  3: 'nặng',
};

/**
 * Thẻ hiện khi bật bộ lọc cụm bựa.
 *
 * Nó trả lời câu hỏi mà người học chắc chắn sẽ có khi thấy một đống từ bậy:
 * "vậy có gì tôi tuyệt đối không được nói?". Không trả lời thì họ tự suy ra
 * rằng mọi từ nặng đều nằm chung một thang — và đó là suy luận sai nguy hiểm
 * nhất trong cả mảng này.
 */
function RedLineCard() {
  return (
    <Card className="border-rose/25 bg-rose/[.05] !p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose/12 text-rose">
          <ShieldAlert size={18} />
        </div>
        <div className="space-y-2 text-sm leading-relaxed text-muted">
          <p className="font-bold text-ink">Lằn ranh đỏ — thứ không có trong app này</p>
          <p>
            Ở đây có chửi thề, nhưng <strong className="text-ink">không có từ miệt thị</strong> nhắm
            vào chủng tộc, giới tính hay xu hướng tính dục. Đó là quyết định có chủ đích, và có test
            trong mã nguồn canh để nội dung mới không vô tình kéo chúng vào.
          </p>
          <p>
            Lý do không phải là né tránh, mà vì{' '}
            <strong className="text-ink">hai thứ đó không cùng một thang</strong>. Chửi thề sai chỗ
            làm bạn nghe thô, và người ta quên sau một tuần. Một từ miệt thị nói ra một lần là mất
            bạn, mất việc, và không có đường lùi. Nghe thấy chúng thì hiểu ngay đó là mức khác hẳn —
            đừng học theo, kể cả khi người bản xứ quanh bạn có nói.
          </p>
          <p className="text-xs text-faint">
            Về ba mức 🔥: chọn mức nào là quyền của bạn, nhưng hãy đọc dòng đỏ dưới mỗi cụm trước.
            Nguy hiểm thật sự không nằm ở chỗ không biết chửi — mà ở chỗ biết một câu rồi mang ra
            dùng sai phòng.
          </p>
        </div>
      </div>
    </Card>
  );
}
