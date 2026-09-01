import { useEffect, useState } from 'react';
import { Lightbulb, TriangleAlert, Scale, PenLine, Check, X } from 'lucide-react';
import { MEMORY_HOOKS } from '@/data/memoryHooks';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

/* ============================================================================
 *  MEMORY AID — phần biến "hiểu" thành "nhớ"
 *
 *  Ba loại móc, xếp theo mức hữu ích tăng dần:
 *    💡 mẹo nhớ    — bẻ nghĩa đen hoặc liên tưởng, để cụm có chỗ bám trong đầu
 *    ⚠️ lỗi hay mắc — cảnh báo đúng cái bẫy mà người Việt hay rơi vào
 *    ⚖️ dễ nhầm với — phân biệt với cụm gần giống
 *    ✍️ ghi chú của bạn — mạnh nhất, vì nó do chính bạn viết
 * ========================================================================== */

export function MemoryAid({
  chunkId,
  compact = false,
}: {
  chunkId: string;
  compact?: boolean;
}) {
  const hook = MEMORY_HOOKS[chunkId];
  const note = useStore((s) => s.notes[chunkId]);
  const setNote = useStore((s) => s.setNote);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? '');

  useEffect(() => setDraft(note ?? ''), [note, chunkId]);

  if (!hook && !note && compact) return null;

  return (
    <div className={cn('space-y-1.5', compact ? 'mt-2' : 'mt-3')}>
      {hook?.hook && (
        <Row icon={<Lightbulb size={13} />} tone="violet" label="Mẹo nhớ">
          {hook.hook}
        </Row>
      )}
      {hook?.pitfall && (
        <Row icon={<TriangleAlert size={13} />} tone="amber" label="Hay mắc lỗi">
          {hook.pitfall}
        </Row>
      )}
      {hook?.contrast && (
        <Row icon={<Scale size={13} />} tone="sky" label="Dễ nhầm với">
          {hook.contrast}
        </Row>
      )}

      {/* ghi chú cá nhân */}
      {editing ? (
        <div className="rounded-xl border border-mint/40 bg-mint/[.06] p-2.5">
          <textarea
            className="input min-h-[64px] resize-y text-sm"
            placeholder="Viết bằng lời của bạn: khi nào bạn sẽ dùng cụm này? Nhớ tới ai, tới tình huống nào?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="btn-primary px-3 py-1.5 text-xs"
              onClick={() => {
                setNote(chunkId, draft);
                setEditing(false);
              }}
            >
              <Check size={13} /> Lưu
            </button>
            <button
              type="button"
              className="btn-quiet px-3 py-1.5 text-xs"
              onClick={() => {
                setDraft(note ?? '');
                setEditing(false);
              }}
            >
              <X size={13} /> Huỷ
            </button>
          </div>
        </div>
      ) : note ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex w-full items-start gap-2 rounded-xl border border-mint/30 bg-mint/[.07] px-2.5 py-2 text-left transition hover:border-mint/50"
        >
          <span className="mt-0.5 shrink-0 text-mint">
            <PenLine size={13} />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-mint">
              Ghi chú của bạn
            </span>
            <span className="block text-xs leading-relaxed text-ink">{note}</span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-semibold text-faint transition hover:text-mint"
        >
          <PenLine size={12} /> Thêm ghi chú của riêng bạn
        </button>
      )}
    </div>
  );
}

function Row({
  icon,
  tone,
  label,
  children,
}: {
  icon: React.ReactNode;
  tone: 'violet' | 'amber' | 'sky';
  label: string;
  children: React.ReactNode;
}) {
  const tones = {
    violet: 'border-violet/25 bg-violet/[.07] text-violet',
    amber: 'border-amber/25 bg-amber/[.07] text-amber',
    sky: 'border-sky/25 bg-sky/[.07] text-sky',
  };
  return (
    <div className={cn('flex items-start gap-2 rounded-xl border px-2.5 py-2', tones[tone])}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">
          {label}
        </span>
        <span className="block text-xs leading-relaxed text-ink">{children}</span>
      </span>
    </div>
  );
}
