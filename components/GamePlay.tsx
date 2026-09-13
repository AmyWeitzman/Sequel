'use client';

import { useMemo, useState } from 'react';
import type { GameDoc } from '@/types/game';
import { getTheme } from '@/lib/themes';
import Board from './Board';
import Hand from './Hand';
import TurnIndicator from './TurnIndicator';
import WinBanner from './WinBanner';
import RulesModal from './RulesModal';

interface GamePlayProps {
  game: GameDoc;
  currentPlayerId: string;
  onPlayCard: (cardId: string, targetCellIndex: number) => Promise<void>;
  onDiscard: (cardId: string) => Promise<void>;
  onLeave: () => void;
}

export default function GamePlay({ game, currentPlayerId, onPlayCard, onDiscard, onLeave }: GamePlayProps) {
  const [armedCardId, setArmedCardId] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);
  const theme = getTheme(game.theme);
  const me = game.players.find((p) => p.id === currentPlayerId);
  const myTurn = game.status === 'active' && !game.winnerId && game.currentPlayerId === currentPlayerId;

  const armedCard = me?.hand.find((c) => c.cardId === armedCardId) ?? null;

  const legalCells = useMemo(() => {
    const result = new Set<number>();
    if (!myTurn || !armedCard || !me) return result;
    for (const cell of game.board) {
      if (cell.isFreeCorner) continue;
      if (armedCard.kind === 'normal') {
        if (cell.chip === null && cell.itemId && theme.isValidPlacement(armedCard.itemId, cell.itemId)) {
          result.add(cell.index);
        }
      } else if (armedCard.kind === 'wild-place') {
        if (cell.chip === null) result.add(cell.index);
      } else if (armedCard.kind === 'wild-remove') {
        if (cell.chip !== null && cell.chip !== me.color && cell.sequenceIds.length === 0) {
          result.add(cell.index);
        }
      }
    }
    return result;
  }, [myTurn, armedCard, me, game.board, theme]);

  const handleCellClick = async (index: number) => {
    if (!armedCardId || !legalCells.has(index)) return;
    const cardId = armedCardId;
    setArmedCardId(null);
    await onPlayCard(cardId, index);
  };

  const handleArm = (cardId: string) => {
    if (!myTurn) return;
    setArmedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const winner = game.winnerId ? game.players.find((p) => p.id === game.winnerId) : undefined;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 font-display">🔗 Sequel — {theme.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRules(true)}
            className="px-3 py-1.5 text-sm bg-white border border-indigo-200 rounded-full text-gray-700 hover:bg-indigo-50"
          >
            📖 Rules
          </button>
          <button
            onClick={onLeave}
            className="px-3 py-1.5 text-sm bg-white border border-red-200 rounded-full text-red-600 hover:bg-red-50"
          >
            Leave
          </button>
        </div>
      </div>

      <TurnIndicator players={game.players} currentPlayerId={game.currentPlayerId} viewerPlayerId={currentPlayerId} />

      <Board board={game.board} theme={theme} legalCells={legalCells} onCellClick={handleCellClick} />

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-2 text-center">
          {myTurn ? 'Tap a card, then tap a highlighted cell' : 'Your hand'}
        </h2>
        {me && (
          <Hand
            hand={me.hand}
            board={game.board}
            theme={theme}
            armedCardId={armedCardId}
            interactive={myTurn}
            onArm={handleArm}
            onDiscard={(cardId) => {
              setArmedCardId(null);
              void onDiscard(cardId);
            }}
          />
        )}
      </div>

      {winner && <WinBanner winner={winner} viewerPlayerId={currentPlayerId} />}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
