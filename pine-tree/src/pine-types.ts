export type PineDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type GestureKind =
  | 'press-hold'
  | 'downward-drag'
  | 'soft-brush'
  | 'upward-trace'
  | 'spiral-up'
  | 'pinch-circle'
  | 'outward-sweep'
  | 'wind-brush'
  | 'feature-touch'
  | 'landscape-release';

export type HapticLevel = 'off' | 'subtle' | 'on';
export type PineQualityTier = 'high' | 'standard' | 'low';
export type ContactPhase = 'begin' | 'move' | 'end' | 'cancel';

export type PineContact = {
  id: number;
  phase: ContactPhase;
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
  durationMs: number;
  radius?: number;
  pressure?: number;
  timestampMs: number;
};

export type PineDayConfig = {
  day: PineDay;
  stage: string;
  title: string;
  emotionalIntent: string;
  instruction: string;
  contemplation: string;
  gesture: GestureKind;
  image: string;
  light: 'sunrise' | 'daylight' | 'mist';
  material: 'soil' | 'root' | 'shoot' | 'bark' | 'branch' | 'canopy' | 'forest';
  haptic: 'anchorage' | 'fibre' | 'air' | 'release';
  accessibilityInstruction: string;
};

export type PineTreePracticeProps = {
  isActive: boolean;
  activeDay: PineDay;
  completedDays: PineDay[];
  soundEnabled: boolean;
  reducedMotion?: boolean;
  hapticLevel?: HapticLevel;
  onFirstMeaningfulTouch?: () => void;
  onDayComplete?: (day: PineDay) => void;
  onRecenterRequest?: () => void;
  onSoundStateChange?: (enabled: boolean) => void;
  onExitRequest?: () => void;
};

export type PineSimulationSnapshot = {
  activeDay: PineDay;
  progress: number;
  contactCount: number;
  soilSettle: number;
  rootDepth: number;
  barkIndent: number;
  boughTension: number;
  needleMotion: number;
  wind: number;
  completed: boolean;
};

export const PINE_DAYS: PineDay[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function isPineDay(value: number): value is PineDay {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}
