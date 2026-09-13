'use client';

import type { CSSProperties } from 'react';
import type { BoardCell as BoardCellData } from '@/types/game';
import type { ThemeId } from '@/types/game';
import { getChipPalette } from '@/lib/themes/chipColors';
import { isWordy, hueCardStyle, SPACE_TEXT_SHADOW } from '@/lib/themes/cardStyle';

interface BoardCellProps {
  cell: BoardCellData;
  display: string;
  hue?: number;
  themeId: ThemeId;
  clickable: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onClick: () => void;
}

export default function BoardCell({ cell, display, hue, themeId, clickable, highlighted, dimmed, onClick }: BoardCellProps) {
  const isSequenced = cell.sequenceIds.length > 0;
  const textSizeClass = isWordy(display) ? 'text-xs' : 'text-3xl';
  const isSpace = themeId === 'space' && !cell.isFreeCorner;
  const hasHue = hue !== undefined && !cell.isFreeCorner;

  let style: CSSProperties | undefined;
  let bgClass = 'bg-white border-gray-200';
  let textClass = 'text-gray-700';
  if (cell.isFreeCorner) {
    // Not amber/yellow - the Space theme's chips render yellow, so a yellow
    // corner could look like it's already been claimed. Violet isn't used by
    // any chip color in any theme.
    bgClass = 'bg-violet-200 border-violet-400';
  } else if (isSpace) {
    bgClass = 'bg-aurora border-indigo-950';
    textClass = 'text-white';
  } else if (hasHue) {
    bgClass = '';
    textClass = '';
    style = hueCardStyle(hue);
  }

  const chipPalette = cell.chip ? getChipPalette(cell.chip, themeId) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      style={style}
      className={`relative h-20 w-20 shrink-0 rounded-md border flex items-center justify-center text-center overflow-hidden transition-all ${bgClass} ${
        highlighted ? 'match-glow z-10' : ''
      } ${isSequenced ? 'ring-2 ring-yellow-400' : ''} ${dimmed ? 'opacity-30' : ''} ${
        clickable ? `cursor-pointer${hasHue || isSpace ? '' : ' hover:border-indigo-400'}` : 'cursor-default'
      }`}
      title={display}
    >
      {cell.isFreeCorner ? (
        <span className="text-xs font-extrabold tracking-wider text-violet-800">FREE</span>
      ) : (
        <span
          className={`${textSizeClass} ${textClass} leading-tight px-1 break-words line-clamp-3 font-semibold`}
          style={isSpace ? SPACE_TEXT_SHADOW : undefined}
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
