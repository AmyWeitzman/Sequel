// 48 unique board nouns for the Noun/Adjective theme. Each noun is owned
// exclusively by exactly one adjective in adjectives.ts (one-to-many via
// matchIds) — see nounAdjective.test.ts for the partition validator.
export interface NounDef {
  id: string;
  name: string;
}

export const NOUNS: NounDef[] = [
  { id: 'cloud', name: 'Cloud' },
  { id: 'sheep', name: 'Sheep' },
  { id: 'ice', name: 'Ice' },
  { id: 'eel', name: 'Eel' },
  { id: 'graveyard', name: 'Graveyard' },
  { id: 'attic', name: 'Attic' },
  { id: 'chips', name: 'Chips' },
  { id: 'leaf', name: 'Leaf' },
  { id: 'mouse', name: 'Mouse' },
  { id: 'hinge', name: 'Hinge' },
  { id: 'trampoline', name: 'Trampoline' },
  { id: 'kangaroo', name: 'Kangaroo' },
  { id: 'honey', name: 'Honey' },
  { id: 'glue', name: 'Glue' },
  { id: 'cactus', name: 'Cactus' },
  { id: 'porcupine', name: 'Porcupine' },
  { id: 'swamp', name: 'Swamp' },
  { id: 'sponge', name: 'Sponge' },
  { id: 'mirror', name: 'Mirror' },
  { id: 'trophy', name: 'Trophy' },
  { id: 'raisin', name: 'Raisin' },
  { id: 'elephant', name: 'Elephant' },
  { id: 'peach', name: 'Peach' },
  { id: 'caterpillar', name: 'Caterpillar' },
  { id: 'troll', name: 'Troll' },
  { id: 'toddler', name: 'Toddler' },
  { id: 'igloo', name: 'Igloo' },
  { id: 'freezer', name: 'Freezer' },
  { id: 'bonfire', name: 'Bonfire' },
  { id: 'volcano', name: 'Volcano' },
  { id: 'pyramid', name: 'Pyramid' },
  { id: 'fossil', name: 'Fossil' },
  { id: 'cheetah', name: 'Cheetah' },
  { id: 'rocket', name: 'Rocket' },
  { id: 'spy', name: 'Spy' },
  { id: 'fox', name: 'Fox' },
  { id: 'mountain', name: 'Mountain' },
  { id: 'whale', name: 'Whale' },
  { id: 'ant', name: 'Ant' },
  { id: 'pebble', name: 'Pebble' },
  { id: 'library', name: 'Library' },
  { id: 'ninja', name: 'Ninja' },
  { id: 'thunder', name: 'Thunder' },
  { id: 'jackhammer', name: 'Jackhammer' },
  { id: 'diamond', name: 'Diamond' },
  { id: 'gold', name: 'Gold' },
  { id: 'garbage', name: 'Garbage' },
  { id: 'compost', name: 'Compost' },
];

if (NOUNS.length !== 48) {
  throw new Error(`NOUNS must contain exactly 48 items, got ${NOUNS.length}`);
}
