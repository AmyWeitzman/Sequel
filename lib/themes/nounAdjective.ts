import type { ThemeDefinition } from './types';
import { NOUNS } from './data/nouns';
import { ADJECTIVES } from './data/adjectives';

const ADJ_TO_NOUNS: Record<string, string[]> = Object.fromEntries(
  ADJECTIVES.map((adj) => [adj.id, adj.matchIds])
);

// Each adjective gets its own color (evenly spaced around the hue wheel);
// its 2 exclusive nouns inherit that same hue, so a colored board cell tells
// you at a glance which hand card it matches, without reading either card.
const HUE_STEP = 360 / ADJECTIVES.length;
const ADJ_HUE: Record<string, number> = Object.fromEntries(
  ADJECTIVES.map((adj, i) => [adj.id, Math.round(i * HUE_STEP)])
);
const NOUN_HUE: Record<string, number> = {};
for (const adj of ADJECTIVES) {
  for (const nounId of adj.matchIds) {
    NOUN_HUE[nounId] = ADJ_HUE[adj.id];
  }
}

export const nounAdjectiveTheme: ThemeDefinition = {
  id: 'noun-adjective',
  name: 'Adjectives',
  description: 'Match descriptive words to the nouns they fit.',
  boardItems: NOUNS.map((noun) => ({
    id: noun.id,
    display: { primary: noun.name },
    hue: NOUN_HUE[noun.id],
  })),
  handCards: ADJECTIVES.map((adj) => {
    const nounNames = adj.matchIds.map(
      (nounId) => NOUNS.find((n) => n.id === nounId)!.name
    );
    return {
      id: adj.id,
      display: { primary: adj.name, label: nounNames.join(' · ') },
      matchIds: adj.matchIds,
      copies: 4,
      hue: ADJ_HUE[adj.id],
    };
  }),
  wildcards: [
    { kind: 'wild-place', count: 4, label: 'Remarkable', art: {} },
    { kind: 'wild-remove', count: 4, label: 'Ruined', art: {} },
  ],
  isValidPlacement(adjId, nounId) {
    return ADJ_TO_NOUNS[adjId]?.includes(nounId) ?? false;
  },
  isCardEverPlayable(adjId, board) {
    const nounIds = ADJ_TO_NOUNS[adjId] ?? [];
    return board.some((cell) => cell.itemId !== null && nounIds.includes(cell.itemId) && !cell.occupied);
  },
};
