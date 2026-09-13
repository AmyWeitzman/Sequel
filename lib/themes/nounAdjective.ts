import type { ThemeDefinition } from './types';
import { NOUNS } from './data/nouns';
import { ADJECTIVES } from './data/adjectives';

const ADJ_TO_NOUNS: Record<string, string[]> = Object.fromEntries(
  ADJECTIVES.map((adj) => [adj.id, adj.matchIds])
);

export const nounAdjectiveTheme: ThemeDefinition = {
  id: 'noun-adjective',
  name: 'Noun/Adjective',
  description:
    '24 adjectives, each matching exactly 2 board nouns (printed right on the card) — 4 valid cells per draw.',
  boardItems: NOUNS.map((noun) => ({
    id: noun.id,
    display: { primary: noun.name },
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
