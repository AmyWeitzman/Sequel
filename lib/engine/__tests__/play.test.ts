import { describe, expect, it } from 'vitest';
import type { BoardCell, HandCard, Player } from '@/types/game';
import { generateBoard, FREE_CORNERS } from '../board';
import { validatePlay, applyPlay, isCardDead, validateDiscard, discardDeadCard } from '../play';
import { createSeededRng } from '../rng';
import { emojiTheme } from '../../themes/emoji';

function makeBoard(): BoardCell[] {
  return generateBoard(emojiTheme.boardItems, createSeededRng(42));
}

function firstNonCornerIndexWithItem(board: BoardCell[], itemId: string): number {
  const cell = board.find((c) => !c.isFreeCorner && c.itemId === itemId);
  if (!cell) throw new Error(`no cell for item ${itemId}`);
  return cell.index;
}

function makePlayer(id: string, color: Player['color'], hand: HandCard[]): Player {
  return {
    id,
    name: id,
    color,
    hand,
    handSize: hand.length,
    isActive: true,
    joinedAt: { seconds: 0, nanoseconds: 0 },
    completedSequenceCount: 0,
  };
}

describe('validatePlay', () => {
  it('rejects a play from the wrong turn', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p2', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell }
    );
    expect(result).toEqual({ ok: false, error: 'NOT_YOUR_TURN' });
  });

  it('rejects a card not in hand', () => {
    const board = makeBoard();
    const players = [makePlayer('p1', 'red', []), makePlayer('p2', 'blue', [])];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'missing', targetCellIndex: 1 }
    );
    expect(result).toEqual({ ok: false, error: 'CARD_NOT_IN_HAND' });
  });

  it('rejects targeting a free corner', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: FREE_CORNERS[0] }
    );
    expect(result).toEqual({ ok: false, error: 'CELL_IS_FREE_CORNER' });
  });

  it('rejects an occupied target cell for a normal card', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    board[cell] = { ...board[cell], chip: 'blue' };
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell }
    );
    expect(result).toEqual({ ok: false, error: 'CELL_OCCUPIED' });
  });

  it('rejects a mismatched item for a normal card', () => {
    const board = makeBoard();
    const itemA = emojiTheme.boardItems[0].id;
    const itemB = emojiTheme.boardItems[1].id;
    const cellForB = firstNonCornerIndexWithItem(board, itemB);
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: itemA, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cellForB }
    );
    expect(result).toEqual({ ok: false, error: 'ITEM_MISMATCH' });
  });

  it('rejects wild-remove on an empty cell', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: 'wild-remove', kind: 'wild-remove' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell }
    );
    expect(result).toEqual({ ok: false, error: 'CELL_EMPTY' });
  });

  it('rejects wild-remove targeting your own chip', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    board[cell] = { ...board[cell], chip: 'red' };
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: 'wild-remove', kind: 'wild-remove' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell }
    );
    expect(result).toEqual({ ok: false, error: 'CANNOT_REMOVE_OWN_CHIP' });
  });

  it('rejects wild-remove targeting a chip that is part of a completed sequence', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    board[cell] = { ...board[cell], chip: 'blue', sequenceIds: ['seq-1'] };
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: 'wild-remove', kind: 'wild-remove' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell }
    );
    expect(result).toEqual({ ok: false, error: 'CHIP_PROTECTED_BY_SEQUENCE' });
  });

  it('accepts a legal normal placement', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = validatePlay(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell }
    );
    expect(result).toEqual({ ok: true });
  });
});

describe('applyPlay', () => {
  it('places the chip, discards the played card, and redraws a replacement', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    const drawPile: HandCard[] = [{ cardId: 'draw-1', itemId: 'z', kind: 'normal' }];
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
    ];
    const result = applyPlay(
      { board, sequences: [], players, drawPile, discardPile: [], turnNumber: 1, sequencesToWin: 2 },
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell },
      createSeededRng(1)
    );

    expect(result.board[cell].chip).toBe('red');
    const p1 = result.players.find((p) => p.id === 'p1')!;
    expect(p1.hand).toHaveLength(1);
    expect(p1.hand[0].cardId).toBe('draw-1');
    expect(result.discardPile.map((c) => c.cardId)).toEqual(['c1']);
    expect(result.drawPile).toHaveLength(0);
    expect(result.lastAction).toMatchObject({ playerId: 'p1', type: 'place', cellIndex: cell });
  });

  it('advances the turn to the next active player, wrapping around', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const cell = firstNonCornerIndexWithItem(board, item);
    const players = [
      makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }]),
      makePlayer('p2', 'blue', []),
      { ...makePlayer('p3', 'green', []), isActive: false },
    ];
    const result = applyPlay(
      { board, sequences: [], players, drawPile: [], discardPile: [], turnNumber: 1, sequencesToWin: 2 },
      { playerId: 'p1', cardId: 'c1', targetCellIndex: cell },
      createSeededRng(1)
    );
    // p3 is inactive, so turn should skip straight to p2.
    expect(result.currentPlayerId).toBe('p2');
    expect(result.turnNumber).toBe(2);
  });

  it('fires a win once the player reaches sequencesToWin', () => {
    let board = makeBoard();
    // Pre-fill row 5 cols 0-3 with red; the play below completes col 4.
    const indexesAlreadyRed = [50, 51, 52, 53];
    board = board.map((c) => (indexesAlreadyRed.includes(c.index) ? { ...c, chip: 'red' as const } : c));
    const item = emojiTheme.boardItems[0].id;
    // Force cell 54's item to match the card we're about to play.
    board[54] = { ...board[54], itemId: item, chip: null };

    const existingSequence = {
      id: 'seq-existing',
      color: 'red' as const,
      cellIndexes: [0, 10, 20, 30, 40],
      direction: 'col' as const,
      createdAtTurn: 1,
    };
    const players = [
      { ...makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' as const }]), completedSequenceCount: 1 },
      makePlayer('p2', 'blue', []),
    ];

    const result = applyPlay(
      {
        board,
        sequences: [existingSequence],
        players,
        drawPile: [],
        discardPile: [],
        turnNumber: 5,
        sequencesToWin: 2,
      },
      { playerId: 'p1', cardId: 'c1', targetCellIndex: 54 },
      createSeededRng(1)
    );

    expect(result.winnerId).toBe('p1');
    // Game over: turn stays with the winner rather than advancing.
    expect(result.currentPlayerId).toBe('p1');
  });
});

describe('isCardDead / discardDeadCard', () => {
  it('a normal card is dead once both its board copies are occupied', () => {
    let board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    board = board.map((c) => (c.itemId === item ? { ...c, chip: 'blue' as const } : c));
    const card: HandCard = { cardId: 'c1', itemId: item, kind: 'normal' };
    expect(isCardDead(card, board, emojiTheme)).toBe(true);
  });

  it('a normal card is alive while at least one copy is open', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const card: HandCard = { cardId: 'c1', itemId: item, kind: 'normal' };
    expect(isCardDead(card, board, emojiTheme)).toBe(false);
  });

  it('wild-remove is never dead, even on turn one with no chips on the board yet', () => {
    const board = makeBoard();
    const card: HandCard = { cardId: 'c1', itemId: 'wild-remove', kind: 'wild-remove' };
    expect(isCardDead(card, board, emojiTheme)).toBe(false);
  });

  it('discardDeadCard does not consume the turn (only touches hand/piles)', () => {
    let board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    board = board.map((c) => (c.itemId === item ? { ...c, chip: 'blue' as const } : c));
    const drawPile: HandCard[] = [{ cardId: 'draw-1', itemId: 'z', kind: 'normal' }];
    const players = [makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }])];

    const validation = validateDiscard(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1' }
    );
    expect(validation).toEqual({ ok: true });

    const result = discardDeadCard(
      { players, drawPile, discardPile: [] },
      { playerId: 'p1', cardId: 'c1' },
      createSeededRng(1)
    );
    expect(result.players[0].hand.map((c) => c.cardId)).toEqual(['draw-1']);
    expect(result.discardPile.map((c) => c.cardId)).toEqual(['c1']);
  });

  it('validateDiscard rejects a card that is not actually dead', () => {
    const board = makeBoard();
    const item = emojiTheme.boardItems[0].id;
    const players = [makePlayer('p1', 'red', [{ cardId: 'c1', itemId: item, kind: 'normal' }])];
    const validation = validateDiscard(
      { status: 'active', currentPlayerId: 'p1', players, board, winnerId: null },
      emojiTheme,
      { playerId: 'p1', cardId: 'c1' }
    );
    expect(validation).toEqual({ ok: false, error: 'CARD_NOT_DEAD' });
  });
});
