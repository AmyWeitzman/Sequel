import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, serializeGame } from '@/lib/firebaseAdmin';
import { GameDoc } from '@/types/game';
import { THEMES } from '@/lib/themes';
import { getNextPlayer } from '@/lib/engine/gameLogic';

// Fields that are mutated only via dedicated, transactional endpoints
// (join, start, play, discard) — blocked here so a stale client-computed
// value can't blindly overwrite concurrent writes. Only lobby-safe settings
// (currently: `theme`, pre-start) may go through this generic PUT.
const PROTECTED_FIELDS = [
  'id',
  'hostId',
  'status',
  'players',
  'board',
  'sequences',
  'drawPile',
  'discardPile',
  'currentPlayerId',
  'turnNumber',
  'sequencesToWin',
  'handSize',
  'winnerId',
  'lastAction',
  'createdAt',
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const requestingPlayerId = request.nextUrl.searchParams.get('playerId');

    const gameSnap = await adminDb.collection('games').doc(gameId).get();
    if (!gameSnap.exists) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const gameData = serializeGame({ id: gameSnap.id, ...gameSnap.data() }) as GameDoc;

    // Critical divergence from the apples-to-oranges pattern: every player's
    // `hand` must be redacted except the requester's own, matched by
    // `?playerId=`. `handSize` stays accurate for everyone so opponents'
    // card counts are still visible.
    const redacted: GameDoc = {
      ...gameData,
      players: gameData.players.map((player) =>
        player.id === requestingPlayerId ? player : { ...player, hand: [] }
      ),
    };

    return NextResponse.json(redacted);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await request.json();

    const blockedField = PROTECTED_FIELDS.find((field) => field in body);
    if (blockedField) {
      return NextResponse.json(
        { error: `Field '${blockedField}' must be updated via its dedicated endpoint` },
        { status: 400 }
      );
    }

    if ('theme' in body && !(body.theme in THEMES)) {
      return NextResponse.json({ error: 'Unknown theme' }, { status: 400 });
    }

    const gameRef = adminDb.collection('games').doc(gameId);
    const gameSnap = await gameRef.get();
    if (!gameSnap.exists) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const game = gameSnap.data() as GameDoc;
    if (game.status !== 'lobby') {
      return NextResponse.json({ error: 'Settings can only change before the game starts' }, { status: 400 });
    }

    await gameRef.update({
      ...body,
      lastActivity: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const gameRef = adminDb.collection('games').doc(gameId);

    await adminDb.runTransaction(async (transaction) => {
      const gameSnap = await transaction.get(gameRef);
      if (!gameSnap.exists) {
        throw new Error('NOT_FOUND');
      }

      const game = gameSnap.data() as GameDoc;

      // Turn rotation already skips inactive players, so marking this
      // player inactive is enough for v1 — no extra forfeit logic needed.
      // If it happens to be their turn right now, hand it to the next
      // active player so the game doesn't stall.
      let currentPlayerId = game.currentPlayerId;
      if (game.status === 'active' && game.currentPlayerId === playerId) {
        const next = getNextPlayer(playerId, game.players);
        currentPlayerId = next === playerId ? currentPlayerId : next;
      }

      const updatedPlayers = game.players.map((p) => (p.id === playerId ? { ...p, isActive: false } : p));

      transaction.update(gameRef, {
        players: updatedPlayers,
        currentPlayerId,
        lastActivity: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    console.error('Error leaving game:', error);
    return NextResponse.json({ error: 'Failed to leave game' }, { status: 500 });
  }
}
