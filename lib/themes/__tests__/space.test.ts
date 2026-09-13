import { describe, expect, it } from 'vitest';
import { spaceTheme } from '../space';

describe('spaceTheme', () => {
  it('has exactly 48 unique board items and 48 unique hand cards, 1:1 matched', () => {
    expect(spaceTheme.boardItems).toHaveLength(48);
    expect(spaceTheme.handCards).toHaveLength(48);
    expect(new Set(spaceTheme.boardItems.map((i) => i.id)).size).toBe(48);
    expect(new Set(spaceTheme.handCards.map((c) => c.id)).size).toBe(48);

    const boardIds = new Set(spaceTheme.boardItems.map((i) => i.id));
    const handIds = new Set(spaceTheme.handCards.map((c) => c.id));
    expect(boardIds).toEqual(handIds);
  });

  it('wildcard counts sum to 8 and use ids distinct from the Supernova board item', () => {
    const total = spaceTheme.wildcards.reduce((sum, wc) => sum + wc.count, 0);
    expect(total).toBe(8);
    for (const wc of spaceTheme.wildcards) {
      expect(spaceTheme.boardItems.some((i) => i.id === wc.kind)).toBe(false);
    }
  });

  it('isValidPlacement is an identical-id match', () => {
    const id = spaceTheme.boardItems[0].id;
    expect(spaceTheme.isValidPlacement(id, id)).toBe(true);
    expect(spaceTheme.isValidPlacement(id, spaceTheme.boardItems[1].id)).toBe(false);
  });
});
