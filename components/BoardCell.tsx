'use client';

import type { CSSProperties } from 'react';
import type { BoardCell as BoardCellData } from '@/types/game';
import type { ThemeId } from '@/types/game';
import { getChipPalette } from '@/lib/themes/chipColors';

interface BoardCellProps {
  cell: BoardCellData;
  display: string;
  hue?: number;
  themeId: ThemeId;
  clickable: boolean;
  highlighted: boolean;
  onClick: () => void;
}

// Emoji-only text (no letters) reads fine large; word-based themes need a
// smaller size so words like "Jackhammer" fit the cell.
const isWordy = (text: string) => /[a-zA-Z]/.test(text);

export default function BoardCell({ cell, display, hue, themeId, clickable, highlighted, onClick }: BoardCellProps) {
  const isSequenced = cell.sequenceIds.length > 0;
  const textSizeClass = isWordy(display) ? 'text-xs' : 'text-3xl';
  const isSpace = themeId === 'space' && !cell.isFreeCorner;
  const hasHue = hue !== undefined && !cell.isFreeCorner;

  let style: CSSProperties | undefined;
  let bgClass = 'bg-white border-gray-200';
  let textClass = 'text-gray-700';
  if (cell.isFreeCorner) {
    bgClass = 'bg-amber-200 border-amber-400';
  } else if (isSpace) {
    bgClass = 'bg-aurora border-indigo-950';
    textClass = 'text-white';
  } else if (hasHue) {
    bgClass = '';
    textClass = '';
    style = {
      backgroundColor: `hsl(${hue} 65% 90%)`,
      borderColor: `hsl(${hue} 55% 60%)`,
      color: `hsl(${hue} 70% 28%)`,
    };
  }

  // Indigo reads fine as a "this is a legal move" ring on white/pastel cells,
  // but disappears against the Space theme's dark blue/purple aurora - use a
  // bright lime there instead (kept distinct from the gold sequence ring).
  const highlightRingClass = isSpace ? 'ring-lime-300' : 'ring-indigo-400';
  const chipPalette = cell.chip ? getChipPalette(cell.chip, themeId) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      style={style}
      className={`relative h-20 w-20 shrink-0 rounded-md border flex items-center justify-center text-center overflow-hidden transition-all ${bgClass} ${
        highlighted ? `ring-4 ${highlightRingClass} z-10` : ''
      } ${isSequenced ? 'ring-2 ring-yellow-400' : ''} ${
        clickable ? `cursor-pointer${hasHue || isSpace ? '' : ' hover:border-indigo-400'}` : 'cursor-default'
      }`}
      title={display}
    >
      {cell.isFreeCorner ? (
        <span className="text-xs font-extrabold tracking-wider text-amber-800">FREE</span>
      ) : (
        <span
          className={`${textSizeClass} ${textClass} leading-tight px-1 break-words line-clamp-3 font-semibold`}
          style={isSpace ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : undefined}
        >
          {display}
        </span>
      )}
      {chipPalette && (
        <span className={`absolute inset-1 rounded-full border-2 animate-chip-pop ${chipPalette.bg} ${chipPalette.border} opacity-90`} />
      )}
    </button>
  );
}
