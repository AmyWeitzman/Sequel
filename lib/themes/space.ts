import type { ThemeDefinition } from './types';
import { SPACE_ITEMS } from './data/spaceItems';

function displayFor(item: { name: string; emoji?: string }) {
  return { primary: item.emoji ? `${item.emoji} ${item.name}` : item.name };
}

export const spaceTheme: ThemeDefinition = {
  id: 'space',
  name: 'Space',
  description: 'Planets, moons, stars, and sci-fi staples — 48 real space words, matched 1:1.',
  boardItems: SPACE_ITEMS.map((item) => ({
    id: item.id,
    display: displayFor(item),
  })),
  handCards: SPACE_ITEMS.map((item) => ({
    id: item.id,
    display: displayFor(item),
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
