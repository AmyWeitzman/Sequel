import type { ThemeId } from '@/types/game';

export interface BoardItem {
  id: string;
  display: { primary: string; label?: string };
  hue?: number; // Noun/Adjective only: 0-359, ties a noun's card color to its owning adjective
}

export interface HandCardDef {
  id: string;
  display: { primary: string; label?: string }; // label = visible match-hint subtext (Noun/Adjective only)
  matchIds?: string[]; // Noun/Adjective only: the exact board item ids this card may be played on
  copies?: number; // deck copies of this card; default 2 (Noun/Adjective uses 4, see below)
  hue?: number; // Noun/Adjective only: 0-359, this adjective's color
}

export interface WildcardDef {
  kind: 'wild-place' | 'wild-remove';
  count: number;
  label: string;
  art: { emoji?: string };
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  boardItems: BoardItem[]; // exactly 48
  handCards: HandCardDef[]; // exactly 48 unique ids (Noun/Adjective: 24 unique adjectives)
  wildcards: WildcardDef[]; // counts sum to 8
  isValidPlacement(handCardId: string, boardItemId: string): boolean;
  isCardEverPlayable(
    handCardId: string,
    board: { itemId: string | null; occupied: boolean }[]
  ): boolean;
}
