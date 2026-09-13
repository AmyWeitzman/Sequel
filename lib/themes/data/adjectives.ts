// 24 unique adjective hand-cards for the Noun/Adjective theme. Each adjective
// exclusively owns exactly 2 of the 48 board nouns (see nouns.ts) via
// matchIds — a clean one-to-many partition, no synonym clusters or shared
// tags. See nounAdjective.test.ts for the partition validator.
export interface AdjectiveDef {
  id: string;
  name: string;
  matchIds: [string, string];
}

export const ADJECTIVES: AdjectiveDef[] = [
  { id: 'fluffy', name: 'Fluffy', matchIds: ['cloud', 'sheep'] },
  { id: 'slippery', name: 'Slippery', matchIds: ['ice', 'eel'] },
  { id: 'spooky', name: 'Spooky', matchIds: ['graveyard', 'attic'] },
  { id: 'crunchy', name: 'Crunchy', matchIds: ['chips', 'leaf'] },
  { id: 'squeaky', name: 'Squeaky', matchIds: ['mouse', 'hinge'] },
  { id: 'bouncy', name: 'Bouncy', matchIds: ['trampoline', 'kangaroo'] },
  { id: 'sticky', name: 'Sticky', matchIds: ['honey', 'glue'] },
  { id: 'prickly', name: 'Prickly', matchIds: ['cactus', 'porcupine'] },
  { id: 'soggy', name: 'Soggy', matchIds: ['swamp', 'sponge'] },
  { id: 'shiny', name: 'Shiny', matchIds: ['mirror', 'trophy'] },
  { id: 'wrinkly', name: 'Wrinkly', matchIds: ['raisin', 'elephant'] },
  { id: 'fuzzy', name: 'Fuzzy', matchIds: ['peach', 'caterpillar'] },
  { id: 'grumpy', name: 'Grumpy', matchIds: ['troll', 'toddler'] },
  { id: 'chilly', name: 'Chilly', matchIds: ['igloo', 'freezer'] },
  { id: 'blazing', name: 'Blazing', matchIds: ['bonfire', 'volcano'] },
  { id: 'ancient', name: 'Ancient', matchIds: ['pyramid', 'fossil'] },
  { id: 'speedy', name: 'Speedy', matchIds: ['cheetah', 'rocket'] },
  { id: 'sneaky', name: 'Sneaky', matchIds: ['spy', 'fox'] },
  { id: 'gigantic', name: 'Gigantic', matchIds: ['mountain', 'whale'] },
  { id: 'tiny', name: 'Tiny', matchIds: ['ant', 'pebble'] },
  { id: 'silent', name: 'Silent', matchIds: ['library', 'ninja'] },
  { id: 'deafening', name: 'Deafening', matchIds: ['thunder', 'jackhammer'] },
  { id: 'precious', name: 'Precious', matchIds: ['diamond', 'gold'] },
  { id: 'rotten', name: 'Rotten', matchIds: ['garbage', 'compost'] },
];

if (ADJECTIVES.length !== 24) {
  throw new Error(`ADJECTIVES must contain exactly 24 items, got ${ADJECTIVES.length}`);
}
