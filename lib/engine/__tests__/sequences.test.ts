import { describe, expect, it } from 'vitest';
import type { BoardCell, ChipColor } from '@/types/game';
import { findNewSequences, getAllWindows } from '../sequences';
import { FREE_CORNERS } from '../board';

function makeEmptyBoard(): BoardCell[] {
  const board: BoardCell[] = [];
  for (let i = 0; i < 100; i++) {
    const isFreeCorner = (FREE_CORNERS as readonly number[]).includes(i);
    board.push({ index: i, itemId: isFreeCorner ? null : 'x', isFreeCorner, chip: null, sequenceIds: [] });
  }
  return board;
}

function setChips(board: BoardCell[], indexes: number[], color: ChipColor): BoardCell[] {
  const copy = board.map((c) => ({ ...c }));
  for (const idx of indexes) {
    copy[idx].chip = color;
  }
  return copy;
}

describe('getAllWindows', () => {
  it('produces every in-bounds 5-cell run in all 4 directions', () => {
    const windows = getAllWindows();
    // rows: 10*6, cols: 10*6, diag-down: 6*6, diag-up: 6*6
    expect(windows.length).toBe(60 + 60 + 36 + 36);
    for (const w of windows) {
      expect(w.cellIndexes).toHaveLength(5);
      for (const idx of w.cellIndexes) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(100);
      }
    }
  });
});

describe('findNewSequences', () => {
  it('detects a row sequence', () => {
    const board = setChips(makeEmptyBoard(), [50, 51, 52, 53, 54], 'red');
    const found = findNewSequences(board, 'red', [], 1);
    expect(found).toHaveLength(1);
    expect(found[0].direction).toBe('row');
    expect(found[0].cellIndexes.slice().sort((a, b) => a - b)).toEqual([50, 51, 52, 53, 54]);
  });

  it('detects a column sequence', () => {
    const board = setChips(makeEmptyBoard(), [5, 15, 25, 35, 45], 'blue');
    const found = findNewSequences(board, 'blue', [], 1);
    expect(found).toHaveLength(1);
    expect(found[0].direction).toBe('col');
  });

  it('detects a diagonal-down (\\) sequence', () => {
    const board = setChips(makeEmptyBoard(), [11, 22, 33, 44, 55], 'green');
    const found = findNewSequences(board, 'green', [], 1);
    expect(found).toHaveLength(1);
    expect(found[0].direction).toBe('diag-down');
  });

  it('detects a diagonal-up (/) sequence', () => {
    const board = setChips(makeEmptyBoard(), [8, 17, 26, 35, 44], 'red');
    const found = findNewSequences(board, 'red', [], 1);
    expect(found).toHaveLength(1);
    expect(found[0].direction).toBe('diag-up');
  });

  it('treats free corners as filled for any color', () => {
    // Row 0, cols 0-4: index 0 is a free corner, 1-4 are red chips.
    const board = setChips(makeEmptyBoard(), [1, 2, 3, 4], 'red');
    const found = findNewSequences(board, 'red', [], 1);
    expect(found.some((s) => s.cellIndexes.slice().sort((a, b) => a - b).join(',') === '0,1,2,3,4')).toBe(
      true
    );
  });

  it('does not false-positive on a 4-run', () => {
    const board = setChips(makeEmptyBoard(), [60, 61, 62, 63], 'blue');
    const found = findNewSequences(board, 'blue', [], 1);
    expect(found).toHaveLength(0);
  });

  it('allows a new sequence that shares exactly 1 cell with an already-recorded sequence', () => {
    // Row 5, cols 0-4 (indexes 50-54) and column 4, rows 1-5 (14,24,34,44,54)
    // share exactly cell 54.
    let board = makeEmptyBoard();
    board = setChips(board, [50, 51, 52, 53, 54], 'red');
    board = setChips(board, [14, 24, 34, 44], 'red');
    const found = findNewSequences(board, 'red', [], 1);
    expect(found).toHaveLength(2);
  });

  it('rejects a candidate line that shares more than 1 cell with an already-recorded sequence', () => {
    // Row 5, cols 0-7 (indexes 50-57): windows 50-54, 51-55, 52-56, 53-57 are
    // all "complete", but each later window overlaps the first by >= 2
    // cells, so only the first should count.
    const board = setChips(makeEmptyBoard(), [50, 51, 52, 53, 54, 55, 56, 57], 'red');
    const found = findNewSequences(board, 'red', [], 1);
    expect(found).toHaveLength(1);
    expect(found[0].cellIndexes.slice().sort((a, b) => a - b)).toEqual([50, 51, 52, 53, 54]);
  });

  it('does not re-detect a sequence already present in `existing`', () => {
    const board = setChips(makeEmptyBoard(), [50, 51, 52, 53, 54], 'red');
    const first = findNewSequences(board, 'red', [], 1);
    const second = findNewSequences(board, 'red', first, 2);
    expect(second).toHaveLength(0);
  });
});
