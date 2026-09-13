'use client';

import { useMemo } from 'react';
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
  const itemById = useMemo(() => {
    const map = new Map<string, { display: string; hue?: number }>();
    for (const item of theme.boardItems) {
      map.set(item.id, { display: item.display.primary, hue: item.hue });
    }
    return map;
  }, [theme]);

  return (
    <div className="overflow-auto rounded-2xl border border-indigo-100 bg-indigo-50/50 p-2">
      <div className="grid grid-cols-10 gap-1" style={{ width: 'max-content' }}>
        {board.map((cell) => {
          const item = cell.itemId ? itemById.get(cell.itemId) : undefined;
          return (
            <BoardCellView
              key={cell.index}
              cell={cell}
              display={item?.display ?? ''}
              hue={item?.hue}
              themeId={theme.id}
              clickable={legalCells.has(cell.index)}
              highlighted={legalCells.has(cell.index)}
              onClick={() => onCellClick(cell.index)}
            />
          );
        })}
      </div>
    </div>
  );
}
