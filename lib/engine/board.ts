import type { BoardCell } from '@/types/game';
import type { BoardItem } from '../themes/types';
import { shuffle, type Rng } from './rng';

export const BOARD_SIZE = 10;
export const FREE_CORNERS = [0, 9, 90, 99] as const;

/**
 * Builds a fresh 10x10 board: the 4 corners are free spaces (itemId: null),
 * and the other 96 cells get a Fisher-Yates-shuffled pool of each of the 48
 * board item ids, each appearing exactly twice.
 */
export function generateBoard(boardItems: BoardItem[], rng: Rng = Math.random): BoardCell[] {
  if (boardItems.length !== 48) {
    throw new Error(`generateBoard requires exactly 48 board items, got ${boardItems.length}`);
  }

  const pool = shuffle(
    boardItems.flatMap((item) => [item.id, item.id]),
    rng
  );

  const cells: BoardCell[] = [];
  let poolIndex = 0;
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    if ((FREE_CORNERS as readonly number[]).includes(i)) {
      cells.push({ index: i, itemId: null, isFreeCorner: true, chip: null, sequenceIds: [] });
    } else {
      cells.push({
        index: i,
        itemId: pool[poolIndex++],
        isFreeCorner: false,
        chip: null,
        sequenceIds: [],
      });
    }
  }
  return cells;
}
