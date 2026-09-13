'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { GameDoc, ThemeId } from '@/types/game';
import GameLobby from '@/components/GameLobby';
import GamePlay from '@/components/GamePlay';
import { useToast } from '@/components/ToastContainer';

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { showToast } = useToast();

  const [game, setGame] = useState<GameDoc | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGame = useCallback(
    async (playerId: string | null) => {
      try {
        const url = playerId ? `/api/games/${gameId}?playerId=${encodeURIComponent(playerId)}` : `/api/games/${gameId}`;
        const response = await fetch(url);
        if (!response.ok) {
          setError(response.status === 404 ? 'Game not found' : 'Failed to load game');
          setLoading(false);
          return;
        }
        const gameData = await response.json();
        setGame(gameData as GameDoc);
        setError(null);
      } catch (err) {
        console.error('Error loading game:', err);
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    },
    [gameId]
  );

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`playerId_${gameId}`) ?? localStorage.getItem('playerId');
    // Reading localStorage is a sync with an external system (not derived
    // from props/state), which is exactly what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPlayerId(storedPlayerId);

    loadGame(storedPlayerId);
    const interval = setInterval(() => loadGame(storedPlayerId), 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handleStartGame = async () => {
    if (!currentPlayerId) return;
    try {
      const response = await fetch(`/api/games/${gameId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      });
      if (response.ok) {
        await loadGame(currentPlayerId);
      } else {
        showToast(await getErrorMessage(response, 'Failed to start game.'), 'error');
      }
    } catch (err) {
      console.error('Error starting game:', err);
      showToast('Failed to start game. Check your connection and try again.', 'error');
    }
  };

  const handleChangeTheme = async (theme: ThemeId) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      if (response.ok) {
        await loadGame(currentPlayerId);
      } else {
        showToast(await getErrorMessage(response, 'Failed to change theme.'), 'error');
      }
    } catch (err) {
      console.error('Error changing theme:', err);
      showToast('Failed to change theme. Check your connection and try again.', 'error');
    }
  };

  const handlePlayCard = async (cardId: string, targetCellIndex: number) => {
    if (!currentPlayerId) return;
    try {
      const response = await fetch(`/api/games/${gameId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId, cardId, targetCellIndex }),
      });
      if (response.ok) {
        await loadGame(currentPlayerId);
      } else {
        showToast(await getErrorMessage(response, 'Invalid play.'), 'error');
        await loadGame(currentPlayerId);
      }
    } catch (err) {
      console.error('Error playing card:', err);
      showToast('Failed to play card. Check your connection and try again.', 'error');
    }
  };

  const handleDiscard = async (cardId: string) => {
    if (!currentPlayerId) return;
    try {
      const response = await fetch(`/api/games/${gameId}/discard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId, cardId }),
      });
      if (response.ok) {
        await loadGame(currentPlayerId);
      } else {
        showToast(await getErrorMessage(response, 'That card is not dead yet.'), 'error');
      }
    } catch (err) {
      console.error('Error discarding card:', err);
      showToast('Failed to discard card. Check your connection and try again.', 'error');
    }
  };

  const handleLeave = async () => {
    if (!currentPlayerId) {
      router.push('/');
      return;
    }
    try {
      await fetch(`/api/games/${gameId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      });
    } catch (err) {
      console.error('Error leaving game:', err);
    } finally {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-bounce">🔗</div>
          <div className="text-2xl font-bold mb-2 text-gray-900">Loading game...</div>
          <div className="text-gray-600">Room Code: {gameId}</div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100">
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 border border-indigo-100">
          <div className="text-4xl mb-3">😕</div>
          <div className="text-2xl font-bold text-red-600 mb-4">{error || 'Game not found'}</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentPlayerId) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100">
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 border border-indigo-100">
          <div className="text-2xl font-bold mb-4 text-gray-900">You need to join this game first</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  const playerInGame = game.players.some((p) => p.id === currentPlayerId);
  if (!playerInGame) {
    return (
      <div className="min-h-screen flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100">
        <div className="text-center bg-white rounded-3xl shadow-xl p-8 border border-indigo-100">
          <div className="text-2xl font-bold mb-4 text-gray-900">You are not in this game</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  if (game.status === 'lobby') {
    return (
      <div className="min-h-screen flex-1 bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100 py-8">
        <GameLobby
          game={game}
          currentPlayerId={currentPlayerId}
          onStartGame={handleStartGame}
          onChangeTheme={handleChangeTheme}
          onLeave={handleLeave}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100 py-8">
      <GamePlay
        game={game}
        currentPlayerId={currentPlayerId}
        onPlayCard={handlePlayCard}
        onDiscard={handleDiscard}
        onLeave={handleLeave}
      />
    </div>
  );
}
