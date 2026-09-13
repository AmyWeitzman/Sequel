'use client';

import { useRouter } from 'next/navigation';
import type { Player } from '@/types/game';

interface WinBannerProps {
  winner: Player | undefined;
  viewerPlayerId: string;
}

export default function WinBanner({ winner, viewerPlayerId }: WinBannerProps) {
  const router = useRouter();
  const youWon = winner?.id === viewerPlayerId;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-indigo-100 animate-bounce-in">
        <div className="text-6xl mb-3">{youWon ? '🏆' : '🎉'}</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">
          {youWon ? 'You won!' : `${winner?.name ?? 'A player'} won!`}
        </h2>
        <p className="text-gray-600 mb-6">
          {winner ? `${winner.name} completed the winning sequence(s).` : 'The game has ended.'}
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full px-6 py-3 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          🔁 Play Again
        </button>
      </div>
    </div>
  );
}
