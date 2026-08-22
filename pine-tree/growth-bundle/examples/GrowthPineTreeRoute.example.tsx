import { useCallback, useState } from 'react';
import type { PineDay } from '../src';
import { PineTreePracticeScreen } from '../src';

type HapticLevel = 'off' | 'subtle' | 'on';

type PineJourneyRecord = {
  activeDay: PineDay;
  completedDays: PineDay[];
};

type GrowthPineTreeRouteProps = {
  initialJourney: PineJourneyRecord;
  initialSoundEnabled: boolean;
  initialReducedMotion: boolean;
  initialHapticLevel: HapticLevel;
  persistJourney: (journey: PineJourneyRecord) => Promise<void>;
  setGlobalSoundPreference: (enabled: boolean) => void;
  openGrowthJourneyMenu: () => void;
  closePineTreeRoute: () => void;
};

/**
 * Example host-owned route. The Growth app replaces this sample's local state
 * with its own store, database, navigation, safe-area shell, and analytics.
 */
export function GrowthPineTreeRoute({
  initialJourney,
  initialSoundEnabled,
  initialReducedMotion,
  initialHapticLevel,
  persistJourney,
  setGlobalSoundPreference,
  openGrowthJourneyMenu,
  closePineTreeRoute,
}: GrowthPineTreeRouteProps) {
  const [journey, setJourney] = useState(initialJourney);
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);

  const completeDay = useCallback(async (completedDay: PineDay) => {
    const completedDays = Array.from(new Set([...journey.completedDays, completedDay])).sort() as PineDay[];
    const nextDay = Math.min(9, completedDay + 1) as PineDay;
    const nextJourney = { activeDay: nextDay, completedDays };
    setJourney(nextJourney);
    await persistJourney(nextJourney);
  }, [journey, persistJourney]);

  const updateSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    setGlobalSoundPreference(enabled);
  }, [setGlobalSoundPreference]);

  return (
    <PineTreePracticeScreen
      isActive
      activeDay={journey.activeDay}
      completedDays={journey.completedDays}
      soundEnabled={soundEnabled}
      reducedMotion={initialReducedMotion}
      hapticLevel={initialHapticLevel}
      onDayComplete={completeDay}
      onRecenterRequest={openGrowthJourneyMenu}
      onSoundStateChange={updateSound}
      onExitRequest={closePineTreeRoute}
    />
  );
}
