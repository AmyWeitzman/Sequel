// 48 emoji faces used identically for both board items and hand cards
// (Emoji theme is a 1:1 identical-match theme: isValidPlacement = (h, b) => h === b).
export const EMOJI_ITEMS: string[] = [
  // Animals (12)
  '🐶', '🐱', '🦁', '🐘', '🐢', '🐬', '🦋', '🐝', '🦉', '🐧', '🦊', '🐴',
  // Food (8)
  '🍎', '🍕', '🍔', '🍩', '🍦', '🍇', '🍉', '🌮',
  // Activities (8)
  '⚽', '🏀', '🎾', '🎱', '🎸', '🎹', '🎨', '🎬',
  // Vehicles (5)
  '🚗', '🚀', '✈️', '🚲', '⛵',
  // Nature (9)
  '🌵', '🌻', '🌴', '🍄', '🌈', '⭐', '🔥', '❄️', '💎',
  // Misc (6)
  '🎈', '🎁', '🕹️', '📚', '⏰', '🔑',
];

if (EMOJI_ITEMS.length !== 48) {
  throw new Error(`EMOJI_ITEMS must contain exactly 48 items, got ${EMOJI_ITEMS.length}`);
}
