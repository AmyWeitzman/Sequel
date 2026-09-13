'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ThemeId } from '@/types/game';
import { generatePlayerId } from '@/lib/engine/gameLogic';
import ThemePicker from '@/components/ThemePicker';
import NameInputModal from '@/components/NameInputModal';
import RulesModal from '@/components/RulesModal';
import { useToast } from '@/components/ToastContainer';

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [theme, setTheme] = useState<ThemeId>('emoji');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    // sessionStorage, not localStorage: identity must be per-tab. localStorage
    // is shared across every tab of the same browser, so two tabs opened to
    // test 2 players would silently collide on the same playerId - the
    // second "join" would just be treated as the first player rejoining.
    let storedPlayerId = sessionStorage.getItem('playerId');
    if (!storedPlayerId) {
      storedPlayerId = generatePlayerId();
      sessionStorage.setItem('playerId', storedPlayerId);
    }
    // Reading/seeding storage is a sync with an external system (not
    // derived from props/state), which is exactly what effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlayerId(storedPlayerId);
  }, []);

  const handleCreateGame = () => {
    if (!playerId) {
      showToast('Please wait, initializing...', 'info');
      return;
    }
    setShowNameModal(true);
  };

  const handleNameSubmit = async (playerName: string) => {
    if (!playerId) return;
    setCreating(true);
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: playerId, hostName: playerName, theme }),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      sessionStorage.setItem(`playerId_${data.gameCode}`, playerId);
      router.push(`/game/${data.gameCode}`);
    } catch (error) {
      console.error('Error creating game:', error);
      showToast('Failed to create game. Please try again.', 'error');
      setCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim() || !joinName.trim()) {
      showToast('Please enter both game code and your name', 'warning');
      return;
    }
    if (!playerId) {
      showToast('Please wait, initializing...', 'info');
      return;
    }

    const code = joinCode.trim().toUpperCase();
    setJoining(true);
    try {
      const response = await fetch(`/api/games/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, playerName: joinName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.error || 'Failed to join game. Check the game code.', 'error');
        setJoining(false);
        return;
      }

      sessionStorage.setItem(`playerId_${code}`, playerId);
      router.push(`/game/${code}`);
    } catch (error) {
      console.error('Error joining game:', error);
      showToast('Failed to join game. Please try again.', 'error');
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-2">🔗</div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 font-display tracking-tight">Sequel</h1>
          <p className="text-xl text-gray-600 mb-4">
            Race against your friends to match the cards to build sequences of 5.
          </p>
          <button
            onClick={() => setShowRules(true)}
            className="px-5 py-2 bg-white border border-indigo-200 rounded-full text-gray-700 hover:bg-indigo-50 hover:shadow-md transition-all font-medium"
          >
            📖 How to Play
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8 items-start">
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-indigo-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">🎉 Start New Game</h2>
            <p className="text-gray-600 mb-4">Pick a theme, then share the room code with friends.</p>
            <ThemePicker value={theme} onChange={setTheme} disabled={creating} />
            <button
              onClick={handleCreateGame}
              disabled={creating}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-full hover:shadow-lg hover:scale-[1.02] transition-all font-bold text-lg disabled:opacity-60 disabled:hover:scale-100"
            >
              {creating ? 'Creating…' : 'Create Game'}
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-indigo-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">🚪 Join Game</h2>
            <p className="text-gray-600 mb-4">Enter the room code provided by the host.</p>
            <div className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room Code"
                maxLength={6}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 uppercase placeholder:normal-case placeholder:text-gray-500 text-gray-900 bg-white tracking-widest font-semibold"
              />
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-500 text-gray-900 bg-white"
              />
              <button
                onClick={handleJoinGame}
                disabled={!joinCode.trim() || !joinName.trim() || joining}
                className="w-full px-6 py-3 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-full hover:shadow-lg hover:scale-[1.02] transition-all font-bold text-lg disabled:from-gray-300 disabled:to-gray-300 disabled:hover:scale-100 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {joining ? 'Joining…' : 'Join Game'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <NameInputModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSubmit={handleNameSubmit}
        title="Enter your name"
      />
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
