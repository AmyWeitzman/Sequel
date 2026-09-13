import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { GameDoc } from '@/types/game';
import { getTheme } from '@/lib/themes';
import { validatePlay, applyPlay, type PlayErrorCode } from '@/lib/engine/play';

const ERROR_STATUS: Record<PlayErrorCode, number> = {
  GAME_NOT_ACTIVE: 400,
  GAME_ALREADY_WON: 400,
  NOT_YOUR_TURN: 403,
  PLAYER_NOT_FOUND: 404,
  PLAYER_INACTIVE: 400,
  CARD_NOT_IN_HAND: 400,
  INVALID_CELL: 400,
  CELL_IS_FREE_CORNER: 400,
  CELL_OCCUPIED: 400,
  CELL_EMPTY: 400,
  ITEM_MISMATCH: 400,
  CANNOT_REMOVE_OWN_CHIP: 400,
  CHIP_PROTECTED_BY_SEQUENCE: 400,
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId, cardId, targetCellIndex } = body;

    if (!playerId || !cardId || typeof targetCellIndex !== 'number') {
      return NextResponse.json(
        { error: 'playerId, cardId, and targetCellIndex are required' },
        { status: 400 }
      );
    }

    const gameRef = adminDb.collection('games').doc(gameId);

    const result = await adminDb.runTransaction(async (transaction) => {
      const gameSnap = await transaction.get(gameRef);
      if (!gameSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const game = gameSnap.data() as GameDoc;
      const theme = getTheme(game.theme);

      const validation = validatePlay(game, theme, { playerId, cardId, targetCellIndex });
      if (!validation.ok) {
        throw new Error(validation.error);
      }

      const applied = applyPlay(game, { playerId, cardId, targetCellIndex });

      transaction.update(gameRef, {
        board: applied.board,
        sequences: applied.sequences,
        players: applied.players,
        drawPile: applied.drawPile,
        discardPile: applied.discardPile,
        currentPlayerId: applied.currentPlayerId,
        turnNumber: applied.turnNumber,
        winnerId: applied.winnerId,
        status: applied.winnerId ? 'finished' : game.status,
        lastAction: applied.lastAction,
        lastActivity: FieldValue.serverTimestamp(),
      });

      return { winnerId: applied.winnerId };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (error instanceof Error && error.message in ERROR_STATUS) {
      const code = error.message as PlayErrorCode;
      return NextResponse.json({ error: code }, { status: ERROR_STATUS[code] });
    }
    console.error('Error playing card:', error);
    return NextResponse.json({ error: 'Failed to play card' }, { status: 500 });
  }
}
