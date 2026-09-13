import type { ChipColor, ThemeId } from '@/types/game';

export interface ChipPalette {
  bg: string;
  border: string;
}

const DEFAULT: Record<ChipColor, ChipPalette> = {
  red: { bg: 'bg-red-500', border: 'border-red-700' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-700' },
  green: { bg: 'bg-green-500', border: 'border-green-700' },
};

// The Space theme's dark aurora background makes the default blue chip hard
// to spot, so on-screen (never in game logic - `ChipColor` itself never
// changes) it renders as yellow instead, with green lightened too for a bit
// more separation from the background's teal/green highlights.
const SPACE: Record<ChipColor, ChipPalette> = {
  red: { bg: 'bg-red-500', border: 'border-red-700' },
  blue: { bg: 'bg-yellow-400', border: 'border-yellow-600' },
  green: { bg: 'bg-green-300', border: 'border-green-500' },
};

export function getChipPalette(color: ChipColor, themeId: ThemeId): ChipPalette {
  return themeId === 'space' ? SPACE[color] : DEFAULT[color];
}
