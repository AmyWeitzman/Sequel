// Shared visual-style helpers used by both BoardCell and HandCard, so the
// Space/Adjectives theme styling formulas live in exactly one place.

// Emoji-only text (no letters) reads fine large; word-based themes need a
// smaller size so words like "Jackhammer" or "Meteor Shower" fit the card.
export const isWordy = (text: string) => /[a-zA-Z]/.test(text);

// Space theme text sits on a busy aurora background - this keeps it legible
// no matter where a color band falls.
export const SPACE_TEXT_SHADOW = { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } as const;

// Adjectives theme: each of the 24 adjectives has its own hue: 0-359. A
// pastel background + a darker tint of the same hue for border/text keeps
// every hue readable without hand-tuning each one individually.
export function hueCardStyle(hue: number) {
  return {
    backgroundColor: `hsl(${hue} 65% 90%)`,
    borderColor: `hsl(${hue} 55% 60%)`,
    color: `hsl(${hue} 70% 28%)`,
  };
}

export function hueLabelColor(hue: number) {
  return { color: `hsl(${hue} 40% 35%)` };
}
