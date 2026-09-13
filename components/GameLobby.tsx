'use client';

import { useState } from 'react';
import type { GameDoc, ChipColor, ThemeId } from '@/types/game';
import { getTheme } from '@/lib/themes';
import { useToast } from '@/components/ToastContainer';
import ThemePicker from '@/components/ThemePicker';
import RulesModal from '@/components/RulesModal';

const CHIP_DOT: Record<ChipColor, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};

interface GameLobbyProps {
  game: GameDoc;
  currentPlayerId: string;
  onStartGame: () => void;
  onChangeTheme: (theme: ThemeId) => void;
  onLeave: () => void;
}

export default function GameLobby({ game, currentPlayerId, onStartGame, onChangeTheme, onLeave }: GameLobbyProps) {
  const { showToast } = useToast();
  const [showRules, setShowRules] = useState(false);
  const isHost = game.hostId === currentPlayerId;
  const activePlayers = game.players.filter((p) => p.isActive);
  const canStart = activePlayers.length >= 2 && activePlayers.length <= 3;
  const theme = getTheme(game.theme);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(game.id);
      showToast('Room code copied!', 'success');
    } catch {
      showToast('Could not copy code — copy it manually', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">🔮 Game Lobby</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRules(true)}
            className="px-4 py-2 bg-white border border-indigo-200 rounded-full text-gray-700 hover:bg-indigo-50 hover:shadow-md transition-all font-medium"
          >
            📖 Rules
          </button>
          <button
            onClick={onLeave}
            className="px-4 py-2 bg-white border border-red-200 rounded-full text-red-600 hover:bg-red-50 hover:shadow-md transition-all font-medium"
          >
            Leave
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 text-center border-2 border-dashed border-indigo-300">
        <p className="text-sm text-gray-600 mb-2">Share this code with friends to join</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-bold tracking-widest text-indigo-600 font-display">{game.id}</span>
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all font-medium"
          >
            📋 Copy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-indigo-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">👥 Players ({activePlayers.length}/3)</h2>
        <div className="space-y-2">
          {activePlayers.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-indigo-50/60 rounded-xl">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${CHIP_DOT[player.color]}`} />
                <span className="font-medium text-gray-800">{player.name}</span>
                {player.id === game.hostId && (
                  <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full font-semibold">👑 Host</span>
                )}
                {player.id === currentPlayerId && (
                  <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full font-semibold">You</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {activePlayers.length < 2 && (
          <p className="mt-4 text-amber-600 text-sm font-medium">Need at least 2 players to start the game</p>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-indigo-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">🎨 Theme</h2>
        {isHost ? (
          <ThemePicker value={game.theme} onChange={onChangeTheme} />
        ) : (
          <div className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50">
            <div className="font-bold text-gray-900">{theme.name}</div>
            <p className="text-sm text-gray-600">{theme.description}</p>
          </div>
        )}
      </div>

      {isHost ? (
        <div className="text-center">
          <button
            onClick={onStartGame}
            disabled={!canStart}
            className="px-8 py-3 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
          >
            🚀 Start Game
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-600 font-medium">⏳ Waiting for host to start the game...</div>
      )}

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
