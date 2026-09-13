import type { ThemeDefinition } from './types';
import { SPACE_ITEMS } from './data/spaceItems';

export const spaceTheme: ThemeDefinition = {
  id: 'space',
  name: 'Space',
  description: 'An outer-space theme with planets, moons, and more.',
  boardItems: SPACE_ITEMS.map((item) => ({
    id: item.id,
    display: { primary: item.name },
  })),
  handCards: SPACE_ITEMS.map((item) => ({
    id: item.id,
    display: { primary: item.name },
  })),
  wildcards: [
    { kind: 'wild-place', count: 4, label: 'Wormhole', art: { emoji: '🌀' } },
    { kind: 'wild-remove', count: 4, label: 'Supernova Strike', art: { emoji: '💥' } },
  ],
  isValidPlacement(handCardId, boardItemId) {
    return handCardId === boardItemId;
  },
  isCardEverPlayable(handCardId, board) {
    return board.some((cell) => cell.itemId === handCardId && !cell.occupied);
  },
};
