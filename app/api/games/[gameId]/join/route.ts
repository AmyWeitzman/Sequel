import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { GameDoc, Player } from '@/types/game';
import { generatePlayerId, assignNextColor } from '@/lib/engine/gameLogic';

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerName, playerId } = body;

    if (!playerName) {
      return NextResponse.json({ error: 'playerName is required' }, { status: 400 });
    }

    const gameRef = adminDb.collection('games').doc(gameId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const gameSnap = await transaction.get(gameRef);

      if (!gameSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const gameData = gameSnap.data() as GameDoc;

      const existingPlayer = gameData.players.find((p) => p.id === playerId);
      if (existingPlayer) {
        // Rejoin - mark as active again, keep their original color/hand.
        const updatedPlayers = gameData.players.map((p) =>
          p.id === playerId ? { ...p, isActive: true } : p
        );
        transaction.update(gameRef, {
          players: updatedPlayers,
          lastActivity: FieldValue.serverTimestamp(),
        });
        return { playerId: existingPlayer.id, rejoined: true };
      }

      if (gameData.status !== 'lobby') {
        throw new Error('NOT_LOBBY');
      }
      if (gameData.players.length >= 3) {
        throw new Error('GAME_FULL');
      }

      const newPlayerId = playerId || generatePlayerId();
      const color = assignNextColor(gameData.players);
      const newPlayer: Player = {
        id: newPlayerId,
        name: playerName,
        color,
        hand: [],
        handSize: 0,
        isActive: true,
        joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
        completedSequenceCount: 0,
      };

      transaction.update(gameRef, {
        players: [...gameData.players, newPlayer],
        lastActivity: FieldValue.serverTimestamp(),
      });

      return { playerId: newPlayerId, rejoined: false };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message === 'NOT_LOBBY') {
      return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'GAME_FULL') {
      return NextResponse.json({ error: 'Game already has 3 players' }, { status: 400 });
    }
    console.error('Error joining game:', error);
    return NextResponse.json({ error: 'Failed to join game' }, { status: 500 });
  }
}
