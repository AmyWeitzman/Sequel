import { describe, expect, it } from 'vitest';
import { emojiTheme } from '../emoji';

describe('emojiTheme', () => {
  it('has exactly 48 unique board items and 48 unique hand cards, 1:1 matched', () => {
    expect(emojiTheme.boardItems).toHaveLength(48);
    expect(emojiTheme.handCards).toHaveLength(48);
    expect(new Set(emojiTheme.boardItems.map((i) => i.id)).size).toBe(48);
    expect(new Set(emojiTheme.handCards.map((c) => c.id)).size).toBe(48);

    const boardIds = new Set(emojiTheme.boardItems.map((i) => i.id));
    const handIds = new Set(emojiTheme.handCards.map((c) => c.id));
    expect(boardIds).toEqual(handIds);
  });

  it('wildcard counts sum to 8', () => {
    const total = emojiTheme.wildcards.reduce((sum, wc) => sum + wc.count, 0);
    expect(total).toBe(8);
  });

  it('isValidPlacement is an identical-id match', () => {
    const id = emojiTheme.boardItems[0].id;
    expect(emojiTheme.isValidPlacement(id, id)).toBe(true);
    expect(emojiTheme.isValidPlacement(id, emojiTheme.boardItems[1].id)).toBe(false);
  });
});
