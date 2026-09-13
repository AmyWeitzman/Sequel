import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebaseAdmin';
import { generateRoomCode } from '@/lib/engine/gameLogic';
import { THEMES } from '@/lib/themes';
import type { GameDoc, Player, ThemeId } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId, hostName, theme } = body;

    if (typeof hostId !== 'string' || !hostId || typeof hostName !== 'string' || !hostName) {
      return NextResponse.json({ error: 'hostId and hostName are required' }, { status: 400 });
    }

    const themeId: ThemeId = theme && theme in THEMES ? theme : 'emoji';

    // Ensure the room code is unique (check if a document with that id exists).
    let gameCode = '';
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      gameCode = generateRoomCode();
      const gameSnap = await adminDb.collection('games').doc(gameCode).get();
      codeExists = gameSnap.exists;
      attempts++;
    }

    if (codeExists || !gameCode) {
      return NextResponse.json({ error: 'Failed to generate unique game code' }, { status: 500 });
    }

    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      color: 'red',
      hand: [],
      handSize: 0,
      isActive: true,
      joinedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      completedSequenceCount: 0,
    };

    const gameData: Omit<GameDoc, 'createdAt' | 'lastActivity'> = {
      id: gameCode,
      hostId,
      theme: themeId,
      status: 'lobby',
      players: [hostPlayer],
      board: [],
      sequences: [],
      drawPile: [],
      discardPile: [],
      currentPlayerId: hostId,
      turnNumber: 0,
      sequencesToWin: 0,
      handSize: 0,
      winnerId: null,
      lastAction: null,
    };

    await adminDb
      .collection('games')
      .doc(gameCode)
      .set({
        ...gameData,
        createdAt: FieldValue.serverTimestamp(),
        lastActivity: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ gameId: gameCode, gameCode, playerId: hostId });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
