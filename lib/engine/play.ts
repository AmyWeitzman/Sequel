import type { BoardCell, GameDoc, HandCard, Player } from '@/types/game';
import type { ThemeDefinition } from '../themes/types';
import { drawCard } from './deck';
import { findNewSequences } from './sequences';
import { getNextPlayer } from './gameLogic';
import type { Rng } from './rng';

export type PlayErrorCode =
  | 'GAME_NOT_ACTIVE'
  | 'GAME_ALREADY_WON'
  | 'NOT_YOUR_TURN'
  | 'PLAYER_NOT_FOUND'
  | 'PLAYER_INACTIVE'
  | 'CARD_NOT_IN_HAND'
  | 'INVALID_CELL'
  | 'CELL_IS_FREE_CORNER'
  | 'CELL_OCCUPIED'
  | 'CELL_EMPTY'
  | 'ITEM_MISMATCH'
  | 'CANNOT_REMOVE_OWN_CHIP'
  | 'CHIP_PROTECTED_BY_SEQUENCE';

export interface PlayValidationResult {
  ok: boolean;
  error?: PlayErrorCode;
}

export interface PlayParams {
  playerId: string;
  cardId: string;
  targetCellIndex: number;
}

/** Pure validation: checks turn order, card ownership, and per-kind target
 * legality. Never mutates `game`. The server (API route) is always
 * authoritative — the client's own legality check is UI feedback only. */
export function validatePlay(
  game: Pick<GameDoc, 'status' | 'currentPlayerId' | 'players' | 'board' | 'winnerId'>,
  theme: ThemeDefinition,
  params: PlayParams
): PlayValidationResult {
  if (game.status !== 'active') {
    return { ok: false, error: 'GAME_NOT_ACTIVE' };
  }
  if (game.winnerId) {
    return { ok: false, error: 'GAME_ALREADY_WON' };
  }
  if (game.currentPlayerId !== params.playerId) {
    return { ok: false, error: 'NOT_YOUR_TURN' };
  }

  const player = game.players.find((p) => p.id === params.playerId);
  if (!player) {
    return { ok: false, error: 'PLAYER_NOT_FOUND' };
  }
  if (!player.isActive) {
    return { ok: false, error: 'PLAYER_INACTIVE' };
  }

  const card = player.hand.find((c) => c.cardId === params.cardId);
  if (!card) {
    return { ok: false, error: 'CARD_NOT_IN_HAND' };
  }

  const cell = game.board[params.targetCellIndex];
  if (!cell) {
    return { ok: false, error: 'INVALID_CELL' };
  }
  if (cell.isFreeCorner) {
    return { ok: false, error: 'CELL_IS_FREE_CORNER' };
  }

  if (card.kind === 'normal') {
    if (cell.chip !== null) {
      return { ok: false, error: 'CELL_OCCUPIED' };
    }
    if (!theme.isValidPlacement(card.itemId, cell.itemId as string)) {
      return { ok: false, error: 'ITEM_MISMATCH' };
    }
  } else if (card.kind === 'wild-place') {
    if (cell.chip !== null) {
      return { ok: false, error: 'CELL_OCCUPIED' };
    }
  } else if (card.kind === 'wild-remove') {
    if (cell.chip === null) {
      return { ok: false, error: 'CELL_EMPTY' };
    }
    if (cell.chip === player.color) {
      return { ok: false, error: 'CANNOT_REMOVE_OWN_CHIP' };
    }
    if (cell.sequenceIds.length > 0) {
      return { ok: false, error: 'CHIP_PROTECTED_BY_SEQUENCE' };
    }
  }

  return { ok: true };
}

export interface ApplyPlayResult {
  board: BoardCell[];
  sequences: GameDoc['sequences'];
  players: Player[];
  drawPile: HandCard[];
  discardPile: HandCard[];
  currentPlayerId: string;
  turnNumber: number;
  winnerId: string | null;
  lastAction: NonNullable<GameDoc['lastAction']>;
}

/**
 * Applies an already-validated play: places/removes the chip, discards the
 * played card and draws a replacement, detects newly-completed sequences,
 * checks for a win, and advances the turn (skipping inactive players, with
 * wraparound) unless the game has just been won.
 */
export function applyPlay(
  game: Pick<
    GameDoc,
    'board' | 'sequences' | 'players' | 'drawPile' | 'discardPile' | 'turnNumber' | 'sequencesToWin'
  >,
  params: PlayParams,
  rng: Rng = Math.random
): ApplyPlayResult {
  const board = game.board.map((cell) => ({ ...cell, sequenceIds: [...cell.sequenceIds] }));
  const players = game.players.map((p) => ({ ...p, hand: [...p.hand] }));

  const player = players.find((p) => p.id === params.playerId)!;
  const cardIndex = player.hand.findIndex((c) => c.cardId === params.cardId);
  const [card] = player.hand.splice(cardIndex, 1);

  const cell = board[params.targetCellIndex];
  const isRemoval = card.kind === 'wild-remove';
  if (isRemoval) {
    cell.chip = null;
  } else {
    cell.chip = player.color;
  }

  let discardPile = [...game.discardPile, card];
  const drawResult = drawCard(game.drawPile, discardPile, rng);
  discardPile = drawResult.discardPile;
  const drawPile = drawResult.drawPile;
  if (drawResult.card) {
    player.hand.push(drawResult.card);
  }

  let sequences = game.sequences;
  if (!isRemoval) {
    const newSequences = findNewSequences(board, player.color, game.sequences, game.turnNumber);
    if (newSequences.length > 0) {
      sequences = [...game.sequences, ...newSequences];
      player.completedSequenceCount += newSequences.length;
      for (const seq of newSequences) {
        for (const idx of seq.cellIndexes) {
          if (!board[idx].isFreeCorner) {
            board[idx].sequenceIds = [...board[idx].sequenceIds, seq.id];
          }
        }
      }
    }
  }

  const winnerId = player.completedSequenceCount >= game.sequencesToWin ? player.id : null;
  const turnNumber = game.turnNumber + 1;
  const currentPlayerId = winnerId ? player.id : getNextPlayer(params.playerId, players);

  return {
    board,
    sequences,
    players,
    drawPile,
    discardPile,
    currentPlayerId,
    turnNumber,
    winnerId,
    lastAction: {
      playerId: params.playerId,
      type: isRemoval ? 'remove' : 'place',
      cellIndex: params.targetCellIndex,
      cardItemId: card.itemId,
      turnNumber: game.turnNumber,
    },
  };
}

/** A "normal" card is dead once neither of its matching board items has an
 * open, playable cell left — that's permanent, since occupied cells don't
 * reopen. Wild-place is dead only in the near-impossible case the entire
 * board is full. Wild-remove is never treated as dead: having no opponent
 * chip to remove right now (e.g. turn one, before anyone has played) is
 * temporary, not permanent — opponents will place chips as the game goes on,
 * so it stays in hand as a normal card you simply can't play yet, exactly
 * like a real Sequence one-eyed jack. */
export function isCardDead(card: HandCard, board: BoardCell[], theme: ThemeDefinition): boolean {
  if (card.kind === 'wild-place') {
    return !board.some((cell) => !cell.isFreeCorner && cell.chip === null);
  }
  if (card.kind === 'wild-remove') {
    return false;
  }
  const cellView = board.map((cell) => ({
    itemId: cell.itemId,
    occupied: cell.isFreeCorner || cell.chip !== null,
  }));
  return !theme.isCardEverPlayable(card.itemId, cellView);
}

export type DiscardErrorCode =
  | 'GAME_NOT_ACTIVE'
  | 'NOT_YOUR_TURN'
  | 'PLAYER_NOT_FOUND'
  | 'CARD_NOT_IN_HAND'
  | 'CARD_NOT_DEAD';

export interface DiscardValidationResult {
  ok: boolean;
  error?: DiscardErrorCode;
}

export function validateDiscard(
  game: Pick<GameDoc, 'status' | 'currentPlayerId' | 'players' | 'board' | 'winnerId'>,
  theme: ThemeDefinition,
  params: { playerId: string; cardId: string }
): DiscardValidationResult {
  if (game.status !== 'active' || game.winnerId) {
    return { ok: false, error: 'GAME_NOT_ACTIVE' };
  }
  if (game.currentPlayerId !== params.playerId) {
    return { ok: false, error: 'NOT_YOUR_TURN' };
  }
  const player = game.players.find((p) => p.id === params.playerId);
  if (!player) {
    return { ok: false, error: 'PLAYER_NOT_FOUND' };
  }
  const card = player.hand.find((c) => c.cardId === params.cardId);
  if (!card) {
    return { ok: false, error: 'CARD_NOT_IN_HAND' };
  }
  if (!isCardDead(card, game.board, theme)) {
    return { ok: false, error: 'CARD_NOT_DEAD' };
  }
  return { ok: true };
}

export interface DiscardDeadCardResult {
  players: Player[];
  drawPile: HandCard[];
  discardPile: HandCard[];
}

/** Discards a confirmed-dead card and redraws a replacement. Does NOT
 * consume the turn or touch the board/sequences. */
export function discardDeadCard(
  game: Pick<GameDoc, 'players' | 'drawPile' | 'discardPile'>,
  params: { playerId: string; cardId: string },
  rng: Rng = Math.random
): DiscardDeadCardResult {
  const players = game.players.map((p) => ({ ...p, hand: [...p.hand] }));
  const player = players.find((p) => p.id === params.playerId)!;
  const cardIndex = player.hand.findIndex((c) => c.cardId === params.cardId);
  const [card] = player.hand.splice(cardIndex, 1);

  const discardPileWithCard = [...game.discardPile, card];
  const drawResult = drawCard(game.drawPile, discardPileWithCard, rng);
  if (drawResult.card) {
    player.hand.push(drawResult.card);
  }

  return { players, drawPile: drawResult.drawPile, discardPile: drawResult.discardPile };
}
