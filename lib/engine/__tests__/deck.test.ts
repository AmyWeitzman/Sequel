import { describe, expect, it } from 'vitest';
import { buildDeck, dealHands, drawCard, DECK_SIZE } from '../deck';
import { createSeededRng } from '../rng';
import { THEME_LIST } from '../../themes';

describe('buildDeck', () => {
  it.each(THEME_LIST)('builds a 104-card deck for theme "$id"', (theme) => {
    const deck = buildDeck(theme, createSeededRng(7));
    expect(deck).toHaveLength(DECK_SIZE);

    const cardIds = new Set(deck.map((c) => c.cardId));
    expect(cardIds.size).toBe(DECK_SIZE); // every card instance has a unique id

    const normalCards = deck.filter((c) => c.kind === 'normal');
    const wildCards = deck.filter((c) => c.kind !== 'normal');
    expect(normalCards).toHaveLength(96);
    expect(wildCards).toHaveLength(8);

    // Each hand-card face appears exactly `copies` (default 2) times.
    const counts = new Map<string, number>();
    for (const card of normalCards) {
      counts.set(card.itemId, (counts.get(card.itemId) ?? 0) + 1);
    }
    for (const handCard of theme.handCards) {
      expect(counts.get(handCard.id)).toBe(handCard.copies ?? 2);
    }

    const wildSum = theme.wildcards.reduce((sum, wc) => sum + wc.count, 0);
    expect(wildSum).toBe(8);
  });
});

describe('dealHands', () => {
  it('deals no duplicate cards and leaves the remainder in the draw pile', () => {
    const theme = THEME_LIST[0];
    const deck = buildDeck(theme, createSeededRng(3));
    const { hands, drawPile } = dealHands(deck, 3, 6);

    expect(hands).toHaveLength(3);
    for (const hand of hands) {
      expect(hand).toHaveLength(6);
    }

    const allDealtIds = hands.flat().map((c) => c.cardId);
    expect(new Set(allDealtIds).size).toBe(allDealtIds.length);
    expect(drawPile).toHaveLength(deck.length - 18);

    // No overlap between dealt cards and what's left in the draw pile.
    const remainingIds = new Set(drawPile.map((c) => c.cardId));
    for (const id of allDealtIds) {
      expect(remainingIds.has(id)).toBe(false);
    }
  });

  it('throws if there are not enough cards to deal', () => {
    const theme = THEME_LIST[0];
    const deck = buildDeck(theme, createSeededRng(4)).slice(0, 5);
    expect(() => dealHands(deck, 3, 6)).toThrow();
  });
});

describe('drawCard', () => {
  it('draws from the top of the draw pile', () => {
    const theme = THEME_LIST[0];
    const deck = buildDeck(theme, createSeededRng(5));
    const result = drawCard(deck, []);
    expect(result.card).toEqual(deck[0]);
    expect(result.drawPile).toHaveLength(deck.length - 1);
  });

  it('reshuffles the discard pile back into the draw pile when empty', () => {
    const theme = THEME_LIST[0];
    const deck = buildDeck(theme, createSeededRng(6));
    const result = drawCard([], deck, createSeededRng(1));
    expect(result.card).not.toBeNull();
    expect(result.discardPile).toHaveLength(0);
    expect(result.drawPile).toHaveLength(deck.length - 1);
  });

  it('returns a null card when both piles are exhausted', () => {
    const result = drawCard([], []);
    expect(result.card).toBeNull();
    expect(result.drawPile).toEqual([]);
    expect(result.discardPile).toEqual([]);
  });
});
