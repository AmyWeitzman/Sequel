import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { GameDoc } from '@/types/game';
import { getTheme } from '@/lib/themes';
import { validateDiscard, discardDeadCard, type DiscardErrorCode } from '@/lib/engine/play';

const ERROR_STATUS: Record<DiscardErrorCode, number> = {
  GAME_NOT_ACTIVE: 400,
  NOT_YOUR_TURN: 403,
  PLAYER_NOT_FOUND: 404,
  CARD_NOT_IN_HAND: 400,
  CARD_NOT_DEAD: 400,
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId, cardId } = body;

    if (!playerId || !cardId) {
      return NextResponse.json({ error: 'playerId and cardId are required' }, { status: 400 });
    }

    const gameRef = adminDb.collection('games').doc(gameId);

    await adminDb.runTransaction(async (transaction) => {
      const gameSnap = await transaction.get(gameRef);
      if (!gameSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const game = gameSnap.data() as GameDoc;
      const theme = getTheme(game.theme);

      const validation = validateDiscard(game, theme, { playerId, cardId });
      if (!validation.ok) {
        throw new Error(validation.error);
      }

      // Discarding a dead card does NOT consume the turn: currentPlayerId
      // and turnNumber are left untouched.
      const result = discardDeadCard(game, { playerId, cardId });

      transaction.update(gameRef, {
        players: result.players,
        drawPile: result.drawPile,
        discardPile: result.discardPile,
        lastActivity: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message in ERROR_STATUS) {
      const code = error.message as DiscardErrorCode;
      return NextResponse.json({ error: code }, { status: ERROR_STATUS[code] });
    }
    console.error('Error discarding card:', error);
    return NextResponse.json({ error: 'Failed to discard card' }, { status: 500 });
  }
}
