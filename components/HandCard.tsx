'use client';

import type { HandCard as HandCardData } from '@/types/game';
import type { ThemeDefinition } from '@/lib/themes';

export function getCardDisplay(card: HandCardData, theme: ThemeDefinition): { primary: string; label?: string } {
  if (card.kind === 'normal') {
    const def = theme.handCards.find((h) => h.id === card.itemId);
    return { primary: def?.display.primary ?? card.itemId, label: def?.display.label };
  }
  const wildcard = theme.wildcards.find((w) => w.kind === card.kind);
  const primary = wildcard ? (wildcard.art.emoji ? `${wildcard.art.emoji} ${wildcard.label}` : wildcard.label) : card.kind;
  return { primary };
}

interface HandCardProps {
  card: HandCardData;
  theme: ThemeDefinition;
  selected: boolean;
  dead: boolean;
  disabled: boolean;
  onSelect: () => void;
  onDiscard: () => void;
}

// Emoji-only text (no letters) reads fine large; word-based themes need a
// smaller size so words like "Jackhammer" or "Meteor Shower" fit the card.
const isWordy = (text: string) => /[a-zA-Z]/.test(text);

export default function HandCard({ card, theme, selected, dead, disabled, onSelect, onDiscard }: HandCardProps) {
  const { primary, label } = getCardDisplay(card, theme);
  const isWild = card.kind !== 'normal';
  const primarySizeClass = isWordy(primary) ? 'text-sm font-semibold' : 'text-3xl';

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={`w-24 h-28 rounded-xl border-2 flex flex-col items-center justify-center px-1.5 py-1 text-center transition-all shrink-0 ${
          selected
            ? 'border-indigo-500 bg-indigo-50 shadow-lg -translate-y-2'
            : isWild
              ? 'border-violet-300 bg-violet-50 hover:border-violet-400'
              : 'border-gray-200 bg-white hover:border-indigo-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          dead ? 'ring-2 ring-red-300' : ''
        }`}
      >
        <span className={`${primarySizeClass} leading-tight mb-1 break-words line-clamp-2`}>{primary}</span>
        {label && <span className="text-[11px] text-gray-500 leading-tight break-words line-clamp-2">{label}</span>}
      </button>
      {dead && !disabled && (
        <button
          type="button"
          onClick={onDiscard}
          className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-medium"
        >
          Discard (dead)
        </button>
      )}
    </div>
  );
}
