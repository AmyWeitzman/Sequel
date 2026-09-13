'use client';

import type { Player, ThemeId } from '@/types/game';
import { getChipPalette } from '@/lib/themes/chipColors';

interface TurnIndicatorProps {
  players: Player[];
  currentPlayerId: string;
  viewerPlayerId: string;
  themeId: ThemeId;
  layout?: 'row' | 'column';
}

export default function TurnIndicator({ players, currentPlayerId, viewerPlayerId, themeId, layout = 'row' }: TurnIndicatorProps) {
  const isYourTurn = currentPlayerId === viewerPlayerId;
  const isColumn = layout === 'column';

  return (
    <div className={isColumn ? 'flex flex-col gap-2' : 'flex flex-wrap items-center justify-center gap-3 mb-4'}>
      <div className={`text-sm font-bold ${isColumn ? 'order-first' : ''} ${isYourTurn ? 'text-indigo-700' : 'text-gray-500'}`}>
        {isYourTurn ? "It's your turn!" : `Waiting for ${players.find((p) => p.id === currentPlayerId)?.name ?? '…'}`}
      </div>
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
            isColumn ? 'justify-between' : ''
          } ${
            player.id === currentPlayerId
              ? 'border-indigo-400 bg-indigo-50 shadow-sm'
              : 'border-gray-200 bg-white'
          } ${!player.isActive ? 'opacity-40' : ''}`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className={`w-3 h-3 rounded-full shrink-0 ${getChipPalette(player.color, themeId).bg}`} />
            <span className="text-sm font-medium text-gray-800 truncate">
              {player.name}
              {player.id === viewerPlayerId ? ' (you)' : ''}
            </span>
          </span>
          <span className="text-xs text-gray-500 shrink-0 ml-2">
            🎴{player.handSize} 🏆{player.completedSequenceCount}
          </span>
        </div>
      ))}
    </div>
  );
}
