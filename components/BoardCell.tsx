'use client';

import type { CSSProperties } from 'react';
import type { BoardCell as BoardCellData, ChipColor } from '@/types/game';
import type { ThemeId } from '@/types/game';

const CHIP_CLASSES: Record<ChipColor, string> = {
  red: 'bg-red-500 border-red-700',
  blue: 'bg-blue-500 border-blue-700',
  green: 'bg-green-500 border-green-700',
};

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
    bgClass = 'bg-violet-100 border-violet-300';
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      style={style}
      className={`relative h-20 w-20 shrink-0 rounded-md border flex items-center justify-center text-center overflow-hidden transition-all ${bgClass} ${
        highlighted ? 'ring-4 ring-indigo-400 z-10' : ''
      } ${isSequenced ? 'ring-2 ring-yellow-400' : ''} ${
        clickable ? `cursor-pointer${hasHue || isSpace ? '' : ' hover:border-indigo-400'}` : 'cursor-default'
      }`}
      title={display}
    >
      {cell.isFreeCorner ? (
        <span className="text-[11px] font-bold tracking-wider text-violet-500">FREE</span>
      ) : (
        <span
          className={`${textSizeClass} ${textClass} leading-tight px-1 break-words line-clamp-3 font-semibold`}
          style={isSpace ? { textShadow: '0 1px 3px rgba(0,0,0,0.8)' } : undefined}
        >
          {display}
        </span>
      )}
      {cell.chip && (
        <span
          className={`absolute inset-1 rounded-full border-2 animate-chip-pop ${CHIP_CLASSES[cell.chip]} opacity-90`}
        />
      )}
    </button>
  );
}
