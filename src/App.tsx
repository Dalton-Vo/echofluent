import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import { PinGate } from '@/components/PinGate';
import { AchievementToast } from '@/components/shared/AchievementToast';
import { useStore } from '@/store/useStore';
import { Dashboard } from '@/pages/Dashboard';
import { ReflexDrill } from '@/pages/ReflexDrill';
import { ListeningGym } from '@/pages/ListeningGym';
import { Shadowing } from '@/pages/Shadowing';
import { Scenarios } from '@/pages/Scenarios';
import { ScenarioPlayer } from '@/pages/ScenarioPlayer';
import { ChunkLibrary } from '@/pages/ChunkLibrary';
import { Review } from '@/pages/Review';
import { Progress } from '@/pages/Progress';
import { Settings } from '@/pages/Settings';
import { Onboarding } from '@/pages/Onboarding';

export default function App() {
  const theme = useStore((s) => s.settings.theme);
  const onboarded = useStore((s) => s.onboarded);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <PinGate>
      {!onboarded ? (
        <Onboarding />
      ) : (
        <>
          <Shell>
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
          </Shell>
          <AchievementToast />
        </>
      )}
    </PinGate>
  );
}
