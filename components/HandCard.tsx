'use client';

import type { CSSProperties } from 'react';
import type { HandCard as HandCardData } from '@/types/game';
import type { ThemeDefinition } from '@/lib/themes';

export function getCardDisplay(
  card: HandCardData,
  theme: ThemeDefinition
): { primary: string; label?: string; hue?: number } {
  if (card.kind === 'normal') {
    const def = theme.handCards.find((h) => h.id === card.itemId);
    return { primary: def?.display.primary ?? card.itemId, label: def?.display.label, hue: def?.hue };
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
  const { primary, label, hue } = getCardDisplay(card, theme);
  const isWild = card.kind !== 'normal';
  const isSpace = theme.id === 'space';
  const primarySizeClass = isWordy(primary) ? 'text-sm font-semibold' : 'text-3xl';

  let style: CSSProperties | undefined;
  let variantClass: string;
  let labelClass = 'text-gray-500';
  if (isSpace) {
    variantClass = isWild ? 'bg-aurora text-white border-fuchsia-300' : 'bg-aurora text-white border-indigo-950';
    labelClass = 'text-indigo-100';
  } else if (hue !== undefined) {
    variantClass = '';
    style = {
      backgroundColor: `hsl(${hue} 65% 90%)`,
      borderColor: `hsl(${hue} 55% 60%)`,
      color: `hsl(${hue} 70% 28%)`,
    };
    labelClass = '';
  } else if (isWild) {
    variantClass = 'border-violet-300 bg-violet-50 hover:border-violet-400';
  } else {
    variantClass = 'border-gray-200 bg-white hover:border-indigo-300';
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        style={style}
        className={`w-24 h-28 rounded-xl border-2 flex flex-col items-center justify-center px-1.5 py-1 text-center transition-all shrink-0 ${variantClass} ${
          selected ? 'shadow-lg -translate-y-2 ring-2 ring-indigo-500' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${dead ? 'ring-2 ring-red-300' : ''}`}
      >
        <span
          className={`${primarySizeClass} leading-tight mb-1 break-words line-clamp-2`}
          style={isSpace ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : undefined}
        >
          {primary}
        </span>
        {label && (
          <span
            className={`text-[11px] leading-tight break-words line-clamp-2 ${labelClass}`}
            style={hue !== undefined ? { color: `hsl(${hue} 40% 35%)` } : isSpace ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : undefined}
          >
            {label}
          </span>
        )}
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
