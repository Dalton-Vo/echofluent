import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import { PinGate } from '@/components/PinGate';
import { AchievementToast } from '@/components/shared/AchievementToast';

import { useStore } from '@/store/useStore';
import { useAutoSync } from '@/hooks/useAutoSync';
import { Dashboard } from '@/pages/Dashboard';

/* ============================================================================
 *  Nạp từng màn khi cần, thay vì gói tất cả vào một tệp
 * ============================================================================
 *
 *  Gộp hết lại thì mở app phải tải 708KB, trong đó có cả từ điển phiên âm, bộ
 *  chấm phát âm và mười bộ shadowing — những thứ một người vừa mở app lên xem
 *  streak chưa đụng tới. Trên 4G ở Việt Nam đó là mấy giây màn hình trắng.
 *
 *  Trang chính giữ lại kiểu nạp thẳng: nó là màn hiện ra đầu tiên, tách ra chỉ
 *  đổi một lần chờ này lấy một lần chờ khác.
 * ========================================================================== */
const ReflexDrill = lazy(() => import('@/pages/ReflexDrill').then((m) => ({ default: m.ReflexDrill })));
const ListeningGym = lazy(() => import('@/pages/ListeningGym').then((m) => ({ default: m.ListeningGym })));
const Shadowing = lazy(() => import('@/pages/Shadowing').then((m) => ({ default: m.Shadowing })));
const Scenarios = lazy(() => import('@/pages/Scenarios').then((m) => ({ default: m.Scenarios })));
const ScenarioPlayer = lazy(() => import('@/pages/ScenarioPlayer').then((m) => ({ default: m.ScenarioPlayer })));
const ChunkLibrary = lazy(() => import('@/pages/ChunkLibrary').then((m) => ({ default: m.ChunkLibrary })));
const Review = lazy(() => import('@/pages/Review').then((m) => ({ default: m.Review })));
const Progress = lazy(() => import('@/pages/Progress').then((m) => ({ default: m.Progress })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));
const Onboarding = lazy(() => import('@/pages/Onboarding').then((m) => ({ default: m.Onboarding })));

/* Chỉ nạp khi người dùng thật sự bật chế độ hỏi bất chợt. Nó kéo theo cả bộ
 * chấm phát âm và từ điển phiên âm — không đáng bắt mọi người tải. */
const NudgeQuiz = lazy(() => import('@/components/shared/NudgeQuiz').then((m) => ({ default: m.NudgeQuiz })));

export default function App() {
  const theme = useStore((s) => s.settings.theme);
  const onboarded = useStore((s) => s.onboarded);
  const nudgeOn = useStore((s) => s.nudge.on);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Kéo về lúc mở app, đẩy lên lúc rời app
  useAutoSync();

  return (
    <PinGate>
      {!onboarded ? (
        <Suspense fallback={<ScreenLoading />}>
          <Onboarding />
        </Suspense>
      ) : (
        <>
          <Shell>
            <Suspense fallback={<ScreenLoading />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/drill" element={<ReflexDrill />} />
                <Route path="/listen" element={<ListeningGym />} />
                <Route path="/shadow" element={<Shadowing />} />
                <Route path="/scenarios" element={<Scenarios />} />
                <Route path="/scenarios/:id" element={<ScenarioPlayer />} />
                <Route path="/chunks" element={<ChunkLibrary />} />
                <Route path="/review" element={<Review />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Suspense>
          </Shell>
          <AchievementToast />
          {nudgeOn && (
            <Suspense fallback={null}>
              <NudgeQuiz />
            </Suspense>
          )}
        </>
      )}
    </PinGate>
  );
}

/**
 * Màn chờ khi đang tải một trang.
 *
 * Cố tình đạm bạc và KHÔNG có hoạt ảnh xoay: các gói này tải xong trong vài
 * chục mili-giây, một vòng xoay nháy lên rồi tắt ngay còn khó chịu hơn là
 * khoảng lặng. Chừa sẵn chiều cao để nội dung hiện ra không làm giật trang.
 */
function ScreenLoading() {
  return <div className="min-h-[60vh]" aria-busy="true" aria-label="Đang tải" />;
}
