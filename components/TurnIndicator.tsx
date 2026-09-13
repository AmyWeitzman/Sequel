'use client';

import type { Player, ChipColor } from '@/types/game';

const CHIP_DOT: Record<ChipColor, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};

interface TurnIndicatorProps {
  players: Player[];
  currentPlayerId: string;
  viewerPlayerId: string;
}

export default function TurnIndicator({ players, currentPlayerId, viewerPlayerId }: TurnIndicatorProps) {
  const isYourTurn = currentPlayerId === viewerPlayerId;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
            player.id === currentPlayerId
              ? 'border-indigo-400 bg-indigo-50 shadow-sm'
              : 'border-gray-200 bg-white'
          } ${!player.isActive ? 'opacity-40' : ''}`}
        >
          <span className={`w-3 h-3 rounded-full ${CHIP_DOT[player.color]}`} />
          <span className="text-sm font-medium text-gray-800">
            {player.name}
            {player.id === viewerPlayerId ? ' (you)' : ''}
          </span>
          <span className="text-xs text-gray-500">🎴{player.handSize}</span>
          <span className="text-xs text-gray-500">🏆{player.completedSequenceCount}</span>
        </div>
      ))}
      <div className={`text-sm font-bold ${isYourTurn ? 'text-indigo-700' : 'text-gray-500'}`}>
        {isYourTurn ? "It's your turn!" : `Waiting for ${players.find((p) => p.id === currentPlayerId)?.name ?? '…'}`}
      </div>
    </div>
  );
}
