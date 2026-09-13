import type { ThemeDefinition } from './types';
import { EMOJI_ITEMS } from './data/emojiItems';

export const emojiTheme: ThemeDefinition = {
  id: 'emoji',
  name: 'Emoji Match',
  description: 'Classic Sequence with 48 emoji faces — play the matching emoji from your hand.',
  boardItems: EMOJI_ITEMS.map((emoji) => ({
    id: emoji,
    display: { primary: emoji },
  })),
  handCards: EMOJI_ITEMS.map((emoji) => ({
    id: emoji,
    display: { primary: emoji },
  })),
  wildcards: [
    { kind: 'wild-place', count: 4, label: 'Wild', art: { emoji: '🃏' } },
    { kind: 'wild-remove', count: 4, label: 'Remove', art: { emoji: '🚫' } },
  ],
  isValidPlacement(handCardId, boardItemId) {
    return handCardId === boardItemId;
  },
  isCardEverPlayable(handCardId, board) {
    return board.some((cell) => cell.itemId === handCardId && !cell.occupied);
  },
};
