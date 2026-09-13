import { describe, expect, it } from 'vitest';
import { nounAdjectiveTheme } from '../nounAdjective';
import { NOUNS } from '../data/nouns';
import { ADJECTIVES } from '../data/adjectives';

describe('Noun/Adjective content — 24 -> 48 partition validator', () => {
  it('has exactly 48 unique board nouns', () => {
    expect(NOUNS).toHaveLength(48);
    expect(new Set(NOUNS.map((n) => n.id)).size).toBe(48);
  });

  it('has exactly 24 unique adjectives, each with exactly 2 matchIds', () => {
    expect(ADJECTIVES).toHaveLength(24);
    expect(new Set(ADJECTIVES.map((a) => a.id)).size).toBe(24);
    for (const adj of ADJECTIVES) {
      expect(adj.matchIds).toHaveLength(2);
    }
  });

  it('covers all 48 nouns exactly once across all adjectives (clean partition, no repeats)', () => {
    const allMatchIds = ADJECTIVES.flatMap((a) => a.matchIds);
    expect(allMatchIds).toHaveLength(48);
    expect(new Set(allMatchIds).size).toBe(48);

    const nounIds = new Set(NOUNS.map((n) => n.id));
    for (const id of allMatchIds) {
      expect(nounIds.has(id)).toBe(true);
    }
    // Every noun is claimed by exactly one adjective.
    const claimCounts = new Map<string, number>();
    for (const id of allMatchIds) {
      claimCounts.set(id, (claimCounts.get(id) ?? 0) + 1);
    }
    for (const noun of NOUNS) {
      expect(claimCounts.get(noun.id)).toBe(1);
    }
  });

  it('theme definition: 48 board items, 24 hand cards (4 copies each), wildcards sum to 8', () => {
    expect(nounAdjectiveTheme.boardItems).toHaveLength(48);
    expect(nounAdjectiveTheme.handCards).toHaveLength(24);
    for (const card of nounAdjectiveTheme.handCards) {
      expect(card.copies).toBe(4);
      expect(card.matchIds).toHaveLength(2);
    }
    const total = nounAdjectiveTheme.wildcards.reduce((sum, wc) => sum + wc.count, 0);
    expect(total).toBe(8);
  });

  it('each hand card prints its matching nouns as a visible label', () => {
    for (const card of nounAdjectiveTheme.handCards) {
      expect(card.display.label).toBeTruthy();
      const nounNames = card.matchIds!.map((id) => NOUNS.find((n) => n.id === id)!.name);
      expect(card.display.label).toBe(nounNames.join(' · '));
    }
  });

  it('isValidPlacement only accepts a card on one of its 2 matching nouns', () => {
    const fluffy = ADJECTIVES.find((a) => a.id === 'fluffy')!;
    expect(nounAdjectiveTheme.isValidPlacement('fluffy', fluffy.matchIds[0])).toBe(true);
    expect(nounAdjectiveTheme.isValidPlacement('fluffy', fluffy.matchIds[1])).toBe(true);
    expect(nounAdjectiveTheme.isValidPlacement('fluffy', 'diamond')).toBe(false);
  });

  it('isCardEverPlayable is true if either matching noun has an open cell', () => {
    const fluffy = ADJECTIVES.find((a) => a.id === 'fluffy')!;
    const [nounA, nounB] = fluffy.matchIds;
    const board = [
      { itemId: nounA, occupied: true },
      { itemId: nounA, occupied: true },
      { itemId: nounB, occupied: true },
      { itemId: nounB, occupied: false },
    ];
    expect(nounAdjectiveTheme.isCardEverPlayable('fluffy', board)).toBe(true);

    const deadBoard = board.map((c) => ({ ...c, occupied: true }));
    expect(nounAdjectiveTheme.isCardEverPlayable('fluffy', deadBoard)).toBe(false);
  });
});
