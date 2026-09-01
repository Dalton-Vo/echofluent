/* Tiện ích chung */

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** YYYY-MM-DD theo giờ địa phương (không dùng toISOString để tránh lệch múi giờ) */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((dateFromKey(b).getTime() - dateFromKey(a).getTime()) / 86400000);
}

/** Số tuần trong năm — dùng để chọn bộ nhiệm vụ tuần */
export function weekKey(d: Date = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return d.getFullYear() * 100 + Math.floor(days / 7);
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} phút`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function formatMs(ms: number): string {
  if (!ms || !Number.isFinite(ms)) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sample<T>(arr: T[], n: number): T[] {
  const a = [...arr];
  const out: T[] = [];
  while (out.length < n && a.length) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Ghép đường dẫn tài nguyên tĩnh với base URL của bản build.
 *
 * Khi chạy ở máy, base là '/' nên `asset('/images/a.jpg')` ra '/images/a.jpg'.
 * Khi deploy lên GitHub Pages, base là '/echofluent/' nên nó ra
 * '/echofluent/images/a.jpg'. Không đi qua đây thì ảnh 404 hết sau khi deploy.
 */
export function asset(path: string): string {
  const base = import.meta.env?.BASE_URL ?? '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * Gradient ổn định theo chuỗi seed — dùng làm nền dự phòng khi chưa có ảnh.
 * Nhân với số nguyên tố lớn để các seed gần nhau ("s01", "s02") vẫn ra màu khác hẳn.
 */
export function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 131 + seed.charCodeAt(i) * 7919) % 100003;
  }
  const hue = (h * 137) % 360;
  const hue2 = (hue + 44) % 360;
  return `linear-gradient(135deg, hsl(${hue} 58% 34%), hsl(${hue2} 52% 19%))`;
}

/** Ngày trong tuần, viết tắt tiếng Việt */
export const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}
