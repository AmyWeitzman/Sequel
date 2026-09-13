import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { GameDoc } from '@/types/game';
import { getTheme } from '@/lib/themes';
import { generateBoard } from '@/lib/engine/board';
import { buildDeck, dealHands } from '@/lib/engine/deck';
import {
  handSizeForPlayerCount,
  sequencesToWinForPlayerCount,
  selectRandomStartingPlayer,
} from '@/lib/engine/gameLogic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId } = body;

    if (typeof playerId !== 'string' || !playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const gameRef = adminDb.collection('games').doc(gameId);

    await adminDb.runTransaction(async (transaction) => {
      const gameSnap = await transaction.get(gameRef);
      if (!gameSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const game = gameSnap.data() as GameDoc;

      if (game.hostId !== playerId) {
        throw new Error('NOT_HOST');
      }
      if (game.status !== 'lobby') {
        throw new Error('ALREADY_STARTED');
      }

      const activePlayers = game.players.filter((p) => p.isActive);
      if (activePlayers.length < 2 || activePlayers.length > 3) {
        throw new Error('INVALID_PLAYER_COUNT');
      }

      const theme = getTheme(game.theme);
      const board = generateBoard(theme.boardItems);
      const deck = buildDeck(theme);
      const handSize = handSizeForPlayerCount(activePlayers.length);
      const { hands, drawPile } = dealHands(deck, activePlayers.length, handSize);

      const dealtByPlayerId = new Map(activePlayers.map((p, i) => [p.id, hands[i]]));
      const updatedPlayers = game.players.map((p) => {
        const hand = dealtByPlayerId.get(p.id);
        return hand ? { ...p, hand, handSize: hand.length, completedSequenceCount: 0 } : p;
      });

      const startingPlayerId = selectRandomStartingPlayer(activePlayers);
      const sequencesToWin = sequencesToWinForPlayerCount(activePlayers.length);

      transaction.update(gameRef, {
        status: 'active',
        board,
        players: updatedPlayers,
        drawPile,
        discardPile: [],
        sequences: [],
        currentPlayerId: startingPlayerId,
        turnNumber: 1,
        sequencesToWin,
        handSize,
        winnerId: null,
        lastAction: null,
        lastActivity: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'NOT_HOST') {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }
    if (error instanceof Error && error.message === 'ALREADY_STARTED') {
      return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'INVALID_PLAYER_COUNT') {
      return NextResponse.json({ error: 'Need 2-3 players to start' }, { status: 400 });
    }
    console.error('Error starting game:', error);
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
