'use client';

import type { BoardCell as BoardCellData, ChipColor } from '@/types/game';

const CHIP_CLASSES: Record<ChipColor, string> = {
  red: 'bg-red-500 border-red-700',
  blue: 'bg-blue-500 border-blue-700',
  green: 'bg-green-500 border-green-700',
};

interface BoardCellProps {
  cell: BoardCellData;
  display: string;
  clickable: boolean;
  highlighted: boolean;
  onClick: () => void;
}

// Emoji-only text (no letters) reads fine large; word-based themes need a
// smaller size so words like "Jackhammer" fit the cell.
const isWordy = (text: string) => /[a-zA-Z]/.test(text);

export default function BoardCell({ cell, display, clickable, highlighted, onClick }: BoardCellProps) {
  const isSequenced = cell.sequenceIds.length > 0;
  const textSizeClass = isWordy(display) ? 'text-xs' : 'text-3xl';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`relative h-20 w-20 shrink-0 rounded-md border flex items-center justify-center text-center overflow-hidden transition-all ${
        cell.isFreeCorner
          ? 'bg-violet-100 border-violet-300'
          : 'bg-white border-gray-200'
      } ${highlighted ? 'ring-4 ring-indigo-400 z-10' : ''} ${
        isSequenced ? 'ring-2 ring-yellow-400' : ''
      } ${clickable ? 'cursor-pointer hover:border-indigo-400' : 'cursor-default'}`}
      title={display}
    >
      {cell.isFreeCorner ? (
        <span className="text-3xl">⭐</span>
      ) : (
        <span className={`${textSizeClass} leading-tight px-1 break-words line-clamp-3 font-semibold text-gray-700`}>
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
