'use client';

import { useMemo, useState } from 'react';
import type { BoardCell as BoardCellData } from '@/types/game';
import type { ThemeDefinition } from '@/lib/themes';
import BoardCellView from './BoardCell';

interface BoardProps {
  board: BoardCellData[];
  theme: ThemeDefinition;
  legalCells: Set<number>;
  onCellClick: (index: number) => void;
}

export default function Board({ board, theme, legalCells, onCellClick }: BoardProps) {
  const [zoomedOut, setZoomedOut] = useState(false);

  const displayById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of theme.boardItems) {
      map.set(item.id, item.display.primary);
    }
    return map;
  }, [theme]);

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setZoomedOut((z) => !z)}
          className="text-xs px-3 py-1 rounded-full border border-indigo-200 bg-white text-gray-700 hover:bg-indigo-50"
        >
          {zoomedOut ? '🔍 Zoom in' : '🔍 Zoom out'}
        </button>
      </div>
      <div className="overflow-auto rounded-2xl border border-indigo-100 bg-indigo-50/50 p-2">
        <div
          className={`grid grid-cols-10 gap-1 origin-top-left transition-transform ${zoomedOut ? 'scale-75' : ''}`}
          style={{ width: 'max-content' }}
        >
          {board.map((cell) => (
            <BoardCellView
              key={cell.index}
              cell={cell}
              display={cell.itemId ? displayById.get(cell.itemId) ?? cell.itemId : ''}
              clickable={legalCells.has(cell.index)}
              highlighted={legalCells.has(cell.index)}
              onClick={() => onCellClick(cell.index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
