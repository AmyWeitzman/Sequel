'use client';

import type { CSSProperties } from 'react';
import type { HandCard as HandCardData } from '@/types/game';
import type { ThemeDefinition } from '@/lib/themes';
import { isWordy, hueCardStyle, hueLabelColor, SPACE_TEXT_SHADOW } from '@/lib/themes/cardStyle';

export function getCardDisplay(
  card: HandCardData,
  theme: ThemeDefinition
): { primary: string; label?: string; hue?: number; emoji?: string } {
  if (card.kind === 'normal') {
    const def = theme.handCards.find((h) => h.id === card.itemId);
    return { primary: def?.display.primary ?? card.itemId, label: def?.display.label, hue: def?.hue };
  }
  const wildcard = theme.wildcards.find((w) => w.kind === card.kind);
  // Render a wildcard's emoji and its name as two separate lines (emoji
  // large, name below) rather than one small combined string - a tiny emoji
  // squeezed in front of "Supernova Strike" was easy to miss entirely.
  return { primary: wildcard?.label ?? card.kind, emoji: wildcard?.art.emoji };
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

export default function HandCard({ card, theme, selected, dead, disabled, onSelect, onDiscard }: HandCardProps) {
  const { primary, label, hue, emoji } = getCardDisplay(card, theme);
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
    style = hueCardStyle(hue);
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
          selected ? 'match-glow z-10' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${dead ? 'ring-2 ring-red-300' : ''}`}
      >
        {emoji && (
          <span className="text-3xl leading-none mb-1" style={isSpace ? SPACE_TEXT_SHADOW : undefined}>
            {emoji}
          </span>
        )}
        <span
          className={`${primarySizeClass} leading-tight mb-1 break-words line-clamp-2`}
          style={isSpace ? SPACE_TEXT_SHADOW : undefined}
        >
          {primary}
        </span>
        {label && (
          <span
            className={`text-[11px] leading-tight break-words line-clamp-2 ${labelClass}`}
            style={hue !== undefined ? hueLabelColor(hue) : isSpace ? SPACE_TEXT_SHADOW : undefined}
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
