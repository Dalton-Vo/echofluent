import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Home,
  Zap,
  Headphones,
  Repeat2,
  Theater,
  Library,
  BarChart3,
  Settings as SettingsIcon,
  Flame,
  Moon,
  Sun,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { levelFromXp } from '@/data/gamify';
import { dueCards } from '@/lib/srs';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/primitives';

const NAV = [
  { to: '/', label: 'Trang chính', icon: Home, end: true },
  { to: '/drill', label: 'Phản xạ', icon: Zap },
  { to: '/listen', label: 'Luyện nghe', icon: Headphones },
  { to: '/shadow', label: 'Nói đuổi', icon: Repeat2 },
  { to: '/scenarios', label: 'Nhập vai', icon: Theater },
  { to: '/chunks', label: 'Thư viện cụm', icon: Library },
  { to: '/review', label: 'Ôn tập', icon: Repeat2, badge: 'due' as const },
  { to: '/progress', label: 'Tiến độ', icon: BarChart3 },
];

export function Shell({ children }: { children: ReactNode }) {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const srs = useStore((s) => s.srs);
  const theme = useStore((s) => s.settings.theme);
  const setSettings = useStore((s) => s.setSettings);
  const { pathname } = useLocation();

  const lv = levelFromXp(xp);
  const due = dueCards(srs).length;

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setSettings({ theme: next });
    document.documentElement.dataset.theme = next;
  };

  return (
    <div className="flex min-h-screen bg-bg">
      {/* ---------------- Sidebar (desktop) ---------------- */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col overflow-y-auto border-r-2 border-line bg-surface px-3 py-4 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="leading-tight">
            <div className="font-pixel text-base leading-8 text-mint">EchoFluent</div>
            <div className="mt-1 text-xs leading-5 text-muted">Phản xạ, không phải ngữ pháp</div>
          </div>
        </div>

        <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex min-h-12 items-center gap-3 border-2 px-3 py-2 text-sm font-semibold transition-none',
                  isActive
                    ? 'border-mint bg-surface text-mint'
                    : 'border-transparent text-muted hover:border-line hover:text-ink',
                )
              }
            >
              <item.icon size={24} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge === 'due' && due > 0 && (
                <span className="bg-amber px-1 py-1 text-xs font-bold text-bg">
                  {due > 99 ? '99+' : due}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-3 border-t border-line/70 px-2 pt-4">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-xs font-bold text-ink">Cấp {lv.level}</span>
              <span className="text-[11px] text-faint">
                {lv.into}/{lv.need} XP
              </span>
            </div>
            <ProgressBar value={lv.into} max={lv.need} height={6} />
            <div className="mt-1.5 text-[11px] text-muted">{lv.title}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-raised/60 px-2.5 py-1.5">
              <Flame size={14} className={streak > 0 ? 'text-amber' : 'text-faint'} />
              <span className="text-xs font-bold text-ink">{streak}</span>
              <span className="text-[11px] text-faint">ngày</span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Đổi giao diện sáng/tối"
              className="grid h-11 w-11 place-items-center border-2 border-line bg-surface text-muted hover:text-ink"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <NavLink
              to="/settings"
              aria-label="Cài đặt"
              className={cn(
                'grid h-11 w-11 place-items-center border-2 border-line bg-surface hover:text-ink',
                pathname === '/settings' ? 'text-mint' : 'text-muted',
              )}
            >
              <SettingsIcon size={15} />
            </NavLink>
          </div>
        </div>
      </aside>

      {/* ---------------- Nội dung ---------------- */}
      <main className="min-w-0 flex-1 pb-[calc(112px+env(safe-area-inset-bottom))] lg:pb-0">
        <MobileTop streak={streak} level={lv.level} onToggleTheme={toggleTheme} theme={theme} />
        <div className="mx-auto w-full max-w-[1100px] px-4 py-5 sm:px-6 sm:py-8">{children}</div>
      </main>

      <MobileNav due={due} />
    </div>
  );
}

function MobileTop({
  streak,
  level,
  theme,
  onToggleTheme,
}: {
  streak: number;
  level: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b-2 border-line bg-bg px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <span className="font-pixel text-base leading-8 text-mint">EchoFluent</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="chip">Cấp {level}</span>
        <span className="chip gap-1">
          <Flame size={12} className={streak > 0 ? 'text-amber' : ''} />
          {streak}
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Đổi giao diện"
          className="grid h-11 w-11 place-items-center border-2 border-line bg-surface text-muted"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <details className="relative">
          <summary className="grid min-h-11 cursor-pointer list-none place-items-center border-2 border-line bg-surface px-2 text-xs font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Các mục
          </summary>
          <nav aria-label="Tất cả màn hình" className="absolute right-0 top-full z-40 mt-2 w-60 border-2 border-line bg-surface p-2 shadow-soft">
            {[...NAV, { to: '/settings', label: 'Cài đặt', icon: SettingsIcon }].map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}
                className={({ isActive }) => cn('flex min-h-12 items-center gap-3 border-2 px-3 py-2 text-sm font-semibold', isActive ? 'border-mint text-mint' : 'border-transparent text-ink hover:border-line')}>
                <item.icon size={16} />{item.label}
              </NavLink>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}

const MOBILE_NAV = [
  { to: '/', label: 'Trang chính', icon: Home, end: true },
  { to: '/drill', label: 'Phản xạ', icon: Zap },
  { to: '/listen', label: 'Luyện nghe', icon: Headphones },
  { to: '/scenarios', label: 'Nhập vai', icon: Theater },
  { to: '/review', label: 'Ôn tập', icon: Repeat2 },
];

function MobileNav({ due }: { due: number }) {
  return (
    <nav aria-label="Điều hướng nhanh" className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-line bg-bg px-1 pt-2 lg:hidden" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      {MOBILE_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'relative flex min-h-16 min-w-0 flex-1 flex-col items-center gap-1 border-t-2 px-1 py-2 text-center text-xs font-semibold leading-5 transition-none',
              isActive ? 'border-mint text-mint' : 'border-transparent text-muted',
            )
          }
        >
          <item.icon size={24} />
          {item.label}
          {item.to === '/review' && due > 0 && (
            <span className="absolute right-2 top-1 h-2 w-2 bg-amber" />
          )}
        </NavLink>
      ))}
    </nav>
  );
}
