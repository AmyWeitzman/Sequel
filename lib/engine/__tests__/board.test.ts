import { describe, expect, it } from 'vitest';
import { generateBoard, FREE_CORNERS } from '../board';
import { createSeededRng } from '../rng';
import { emojiTheme } from '../../themes/emoji';

describe('generateBoard', () => {
  it('produces 100 cells with corners exactly [0, 9, 90, 99] as free spaces', () => {
    const board = generateBoard(emojiTheme.boardItems, createSeededRng(1));
    expect(board).toHaveLength(100);

    const freeCornerIndexes = board.filter((c) => c.isFreeCorner).map((c) => c.index);
    expect(freeCornerIndexes.sort((a, b) => a - b)).toEqual([...FREE_CORNERS]);

    for (const idx of FREE_CORNERS) {
      expect(board[idx].itemId).toBeNull();
      expect(board[idx].isFreeCorner).toBe(true);
    }
  });

  it('places each of the 48 board items exactly twice among the 96 non-corner cells, across many seeded runs', () => {
    for (let seed = 0; seed < 25; seed++) {
      const board = generateBoard(emojiTheme.boardItems, createSeededRng(seed));
      const nonCorner = board.filter((c) => !c.isFreeCorner);
      expect(nonCorner).toHaveLength(96);

      const counts = new Map<string, number>();
      for (const cell of nonCorner) {
        expect(cell.itemId).not.toBeNull();
        const id = cell.itemId as string;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }

      expect(counts.size).toBe(48);
      for (const item of emojiTheme.boardItems) {
        expect(counts.get(item.id)).toBe(2);
      }
    }
  });

  it('initializes every cell with a null chip and no sequences', () => {
    const board = generateBoard(emojiTheme.boardItems, createSeededRng(2));
    for (const cell of board) {
      expect(cell.chip).toBeNull();
      expect(cell.sequenceIds).toEqual([]);
    }
  });

  it('throws if not given exactly 48 board items', () => {
    expect(() => generateBoard(emojiTheme.boardItems.slice(0, 10))).toThrow();
  });
});
