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
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line/70 bg-surface/40 px-3 py-5 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-lg text-[#04120c]">
            🗣️
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight text-ink">EchoFluent</div>
            <div className="text-[11px] text-faint">Phản xạ, không phải ngữ pháp</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-mint/12 text-mint'
                    : 'text-muted hover:bg-raised/60 hover:text-ink',
                )
              }
            >
              <item.icon size={17} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge === 'due' && due > 0 && (
                <span className="rounded-full bg-amber px-1.5 py-0.5 text-[10px] font-bold text-[#1a1000]">
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
              className="grid h-8 w-8 place-items-center rounded-lg bg-raised/60 text-muted transition hover:text-ink"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <NavLink
              to="/settings"
              aria-label="Cài đặt"
              className={cn(
                'grid h-8 w-8 place-items-center rounded-lg bg-raised/60 transition hover:text-ink',
                pathname === '/settings' ? 'text-mint' : 'text-muted',
              )}
            >
              <SettingsIcon size={15} />
            </NavLink>
          </div>
        </div>
      </aside>

      {/* ---------------- Nội dung ---------------- */}
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">
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
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line/70 bg-bg/85 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2">
        <span className="text-lg">🗣️</span>
        <span className="text-sm font-extrabold tracking-tight text-ink">EchoFluent</span>
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
          className="grid h-8 w-8 place-items-center rounded-lg bg-raised/60 text-muted"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}

const MOBILE_NAV = [
  { to: '/', label: 'Chính', icon: Home, end: true },
  { to: '/drill', label: 'Phản xạ', icon: Zap },
  { to: '/listen', label: 'Nghe', icon: Headphones },
  { to: '/scenarios', label: 'Nhập vai', icon: Theater },
  { to: '/review', label: 'Ôn', icon: Repeat2 },
];

function MobileNav({ due }: { due: number }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line/70 bg-bg/90 px-1 py-1.5 backdrop-blur-xl lg:hidden">
      {MOBILE_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'relative flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold transition-colors',
              isActive ? 'text-mint' : 'text-faint',
            )
          }
        >
          <item.icon size={19} />
          {item.label}
          {item.to === '/review' && due > 0 && (
            <span className="absolute right-[22%] top-0.5 h-1.5 w-1.5 rounded-full bg-amber" />
          )}
        </NavLink>
      ))}
    </nav>
  );
}
