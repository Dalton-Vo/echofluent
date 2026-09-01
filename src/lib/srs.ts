import type { Grade, SrsCard } from '@/types';

/* ============================================================================
 *  Lặp lại ngắt quãng (SM-2 rút gọn)
 *
 *  Khác với Anki: ở đây bạn ôn bằng CÁCH NÓI, không phải gõ. Nên "again" khá
 *  phổ biến và không đáng sợ — mục tiêu là kéo cụm từ ra khỏi trí nhớ bằng
 *  miệng, không phải nhớ mặt chữ.
 * ========================================================================== */

const DAY = 24 * 60 * 60 * 1000;

export function newCard(id: string, kind: SrsCard['kind']): SrsCard {
  return {
    id,
    kind,
    ease: 2.5,
    intervalDays: 0,
    due: Date.now(),
    reps: 0,
    lapses: 0,
    streak: 0,
  };
}

export function gradeCard(card: SrsCard, grade: Grade): SrsCard {
  const next: SrsCard = { ...card, reps: card.reps + 1 };

  if (grade === 'again') {
    next.lapses += 1;
    next.streak = 0;
    next.ease = Math.max(1.3, card.ease - 0.2);
    next.intervalDays = 0;
    next.due = Date.now() + 6 * 60 * 1000; // gặp lại sau 6 phút
    return next;
  }

  next.streak = card.streak + 1;

  if (grade === 'hard') next.ease = Math.max(1.3, card.ease - 0.15);
  if (grade === 'easy') next.ease = Math.min(3.2, card.ease + 0.15);

  const mult = grade === 'hard' ? 1.2 : grade === 'easy' ? next.ease * 1.35 : next.ease;

  if (next.streak === 1) next.intervalDays = grade === 'easy' ? 3 : 1;
  else if (next.streak === 2) next.intervalDays = grade === 'easy' ? 7 : 3;
  else next.intervalDays = Math.round(Math.max(1, card.intervalDays * mult));

  next.intervalDays = Math.min(next.intervalDays, 365);
  next.due = Date.now() + next.intervalDays * DAY;
  return next;
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  return card.due <= now;
}

/** Thẻ được coi là "đã thuộc" khi khoảng cách ôn vượt 21 ngày */
export function isMastered(card: SrsCard): boolean {
  return card.intervalDays >= 21;
}

export function dueCards(cards: Record<string, SrsCard>, now = Date.now()): SrsCard[] {
  return Object.values(cards)
    .filter((c) => isDue(c, now))
    .sort((a, b) => a.due - b.due);
}

export function describeInterval(days: number): string {
  if (days <= 0) return 'vài phút';
  if (days === 1) return '1 ngày';
  if (days < 30) return `${days} ngày`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 tháng' : `${months} tháng`;
}
