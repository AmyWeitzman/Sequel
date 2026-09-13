// Small dependency-free RNG helpers shared by the engine. Every engine
// function that needs randomness accepts an injectable `rng: () => number`
// (defaulting to Math.random) so tests can pass a seeded, deterministic
// generator instead.

export type Rng = () => number;

/** Deterministic PRNG (mulberry32) for reproducible tests. */
export function createSeededRng(seed: number): Rng {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle. Does not mutate the input array. */
export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
