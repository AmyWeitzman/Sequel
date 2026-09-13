import type { ChipColor, Player } from '@/types/game';
import type { Rng } from './rng';

const ROOM_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const COLOR_ORDER: ChipColor[] = ['red', 'blue', 'green'];

/** Generate a random 6-character room code (doc id). Uniqueness against
 * existing docs is checked by the caller (API route), same as
 * apples-to-oranges' generateGameCode. */
export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += ROOM_CODE_CHARS.charAt(Math.floor(Math.random() * ROOM_CODE_CHARS.length));
  }
  return code;
}

export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

/** Cycles red -> blue -> green as players join. Throws past 3 players. */
export function assignNextColor(players: Player[]): ChipColor {
  const used = new Set(players.map((p) => p.color));
  const next = COLOR_ORDER.find((c) => !used.has(c));
  if (!next) {
    throw new Error('No colors left to assign (max 3 players)');
  }
  return next;
}

/** Next active player in join order, wrapping around and skipping inactive
 * (left) players. */
export function getNextPlayer(currentPlayerId: string, players: Player[]): string {
  const activePlayers = players.filter((p) => p.isActive);
  if (activePlayers.length === 0) {
    return currentPlayerId;
  }
  const currentIndex = activePlayers.findIndex((p) => p.id === currentPlayerId);
  if (currentIndex === -1) {
    return activePlayers[0].id;
  }
  const nextIndex = (currentIndex + 1) % activePlayers.length;
  return activePlayers[nextIndex].id;
}

export function selectRandomStartingPlayer(players: Player[], rng: Rng = Math.random): string {
  const activePlayers = players.filter((p) => p.isActive);
  if (activePlayers.length === 0) {
    throw new Error('Cannot select a starting player with no active players');
  }
  const idx = Math.floor(rng() * activePlayers.length);
  return activePlayers[idx].id;
}

/** 2 players -> hand of 7; 3 players -> hand of 6. */
export function handSizeForPlayerCount(playerCount: number): number {
  return playerCount === 2 ? 7 : 6;
}

/** 2 players -> need 2 sequences; 3 players -> need 1 sequence. */
export function sequencesToWinForPlayerCount(playerCount: number): number {
  return playerCount === 2 ? 2 : 1;
}
