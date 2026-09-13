import type { HandCard } from '@/types/game';
import type { ThemeDefinition } from '../themes/types';
import { shuffle, type Rng } from './rng';

export const NORMAL_CARD_COUNT = 96;
export const WILDCARD_COUNT = 8;
export const DECK_SIZE = NORMAL_CARD_COUNT + WILDCARD_COUNT;

/**
 * Builds and shuffles the 104-card deck for a theme: 96 normal cards
 * (summing each hand card's `copies`, default 2) + 8 wildcards.
 */
export function buildDeck(theme: ThemeDefinition, rng: Rng = Math.random): HandCard[] {
  let counter = 0;
  const normalCards: HandCard[] = [];
  for (const card of theme.handCards) {
    const copies = card.copies ?? 2;
    for (let i = 0; i < copies; i++) {
      normalCards.push({ cardId: `card-${counter++}`, itemId: card.id, kind: 'normal' });
    }
  }

  if (normalCards.length !== NORMAL_CARD_COUNT) {
    throw new Error(
      `Theme "${theme.id}" must produce exactly ${NORMAL_CARD_COUNT} normal cards, got ${normalCards.length}`
    );
  }

  const wildCards: HandCard[] = [];
  for (const wildcard of theme.wildcards) {
    for (let i = 0; i < wildcard.count; i++) {
      wildCards.push({ cardId: `card-${counter++}`, itemId: wildcard.kind, kind: wildcard.kind });
    }
  }

  const totalWild = theme.wildcards.reduce((sum, wc) => sum + wc.count, 0);
  if (totalWild !== WILDCARD_COUNT) {
    throw new Error(`Theme "${theme.id}" must have exactly ${WILDCARD_COUNT} wildcards, got ${totalWild}`);
  }

  return shuffle([...normalCards, ...wildCards], rng);
}

/** Deals `handSize` cards to each of `playerCount` players, round-robin. */
export function dealHands(
  drawPile: HandCard[],
  playerCount: number,
  handSize: number
): { hands: HandCard[][]; drawPile: HandCard[] } {
  const pile = drawPile.slice();
  const hands: HandCard[][] = Array.from({ length: playerCount }, () => []);

  for (let round = 0; round < handSize; round++) {
    for (let p = 0; p < playerCount; p++) {
      const card = pile.shift();
      if (!card) {
        throw new Error('Not enough cards in draw pile to deal hands');
      }
      hands[p].push(card);
    }
  }

  return { hands, drawPile: pile };
}

/**
 * Draws a single card, reshuffling the discard pile back into the draw pile
 * when the draw pile is empty. Returns `card: null` only if both piles are
 * exhausted (deck-exhaustion edge case).
 */
export function drawCard(
  drawPile: HandCard[],
  discardPile: HandCard[],
  rng: Rng = Math.random
): { card: HandCard | null; drawPile: HandCard[]; discardPile: HandCard[] } {
  let pile = drawPile.slice();
  let discard = discardPile.slice();

  if (pile.length === 0) {
    if (discard.length === 0) {
      return { card: null, drawPile: pile, discardPile: discard };
    }
    pile = shuffle(discard, rng);
    discard = [];
  }

  const [card, ...rest] = pile;
  return { card, drawPile: rest, discardPile: discard };
}
