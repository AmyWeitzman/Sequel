import type { BoardCell, ChipColor, Sequence } from '@/types/game';
import { BOARD_SIZE } from './board';

const RUN_LENGTH = 5;

export interface SequenceWindow {
  direction: Sequence['direction'];
  cellIndexes: number[];
}

/** Every in-bounds 5-cell run across all 4 directions on the 10x10 board. */
export function getAllWindows(): SequenceWindow[] {
  const windows: SequenceWindow[] = [];
  const last = BOARD_SIZE - RUN_LENGTH; // 5

  // Rows (left -> right)
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c <= last; c++) {
      windows.push({
        direction: 'row',
        cellIndexes: Array.from({ length: RUN_LENGTH }, (_, k) => r * BOARD_SIZE + (c + k)),
      });
    }
  }

  // Columns (top -> bottom)
  for (let c = 0; c < BOARD_SIZE; c++) {
    for (let r = 0; r <= last; r++) {
      windows.push({
        direction: 'col',
        cellIndexes: Array.from({ length: RUN_LENGTH }, (_, k) => (r + k) * BOARD_SIZE + c),
      });
    }
  }

  // Diagonal down (\, row increases, col increases)
  for (let r = 0; r <= last; r++) {
    for (let c = 0; c <= last; c++) {
      windows.push({
        direction: 'diag-down',
        cellIndexes: Array.from({ length: RUN_LENGTH }, (_, k) => (r + k) * BOARD_SIZE + (c + k)),
      });
    }
  }

  // Diagonal up (/, row increases, col decreases)
  for (let r = 0; r <= last; r++) {
    for (let c = RUN_LENGTH - 1; c < BOARD_SIZE; c++) {
      windows.push({
        direction: 'diag-up',
        cellIndexes: Array.from({ length: RUN_LENGTH }, (_, k) => (r + k) * BOARD_SIZE + (c - k)),
      });
    }
  }

  return windows;
}

function sameCells(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((idx) => setB.has(idx));
}

function sharedCellCount(a: number[], b: number[]): number {
  const setB = new Set(b);
  return a.filter((idx) => setB.has(idx)).length;
}

/** Deterministic id: a given (color, direction, cells) triple can only ever
 * form one sequence, since a completed sequence's chips can never be removed
 * (wild-remove is blocked from targeting them). */
function sequenceId(color: ChipColor, window: SequenceWindow): string {
  return `${color}:${window.direction}:${window.cellIndexes.join(',')}`;
}

/**
 * Finds newly-completed sequences of `color` on `board` that aren't already
 * in `existing`. A candidate line counts only if it shares at most 1 cell
 * with every already-recorded sequence of that color (including ones found
 * earlier in this same call).
 */
export function findNewSequences(
  board: BoardCell[],
  color: ChipColor,
  existing: Sequence[],
  turnNumber: number
): Sequence[] {
  const windows = getAllWindows();
  const recorded = existing.filter((seq) => seq.color === color);
  const newSequences: Sequence[] = [];

  for (const window of windows) {
    const isComplete = window.cellIndexes.every((idx) => {
      const cell = board[idx];
      return cell.isFreeCorner || cell.chip === color;
    });
    if (!isComplete) continue;

    const alreadyRecorded = recorded.some((seq) => sameCells(seq.cellIndexes, window.cellIndexes));
    if (alreadyRecorded) continue;

    const overlapOk = recorded.every((seq) => sharedCellCount(seq.cellIndexes, window.cellIndexes) <= 1);
    if (!overlapOk) continue;

    const sequence: Sequence = {
      id: sequenceId(color, window),
      color,
      cellIndexes: window.cellIndexes,
      direction: window.direction,
      createdAtTurn: turnNumber,
    };
    newSequences.push(sequence);
    recorded.push(sequence);
  }

  return newSequences;
}
