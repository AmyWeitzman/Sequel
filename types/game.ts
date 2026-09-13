// Plain serializable stand-in for a Firestore Timestamp, since documents
// cross the API-route -> browser boundary as JSON.
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type ThemeId = 'emoji' | 'space' | 'noun-adjective';
export type ChipColor = 'red' | 'blue' | 'green';
export type GameStatus = 'lobby' | 'active' | 'finished';
export type CardKind = 'normal' | 'wild-place' | 'wild-remove';

export interface BoardCell {
  index: number; // 0-99
  itemId: string | null; // null only on the 4 free corners
  isFreeCorner: boolean;
  chip: ChipColor | null;
  sequenceIds: string[]; // completed-sequence ids this cell belongs to
}

export interface Sequence {
  id: string;
  color: ChipColor;
  cellIndexes: number[]; // 5 indexes
  direction: 'row' | 'col' | 'diag-down' | 'diag-up';
  createdAtTurn: number;
}

export interface HandCard {
  cardId: string;
  itemId: string;
  kind: CardKind;
}

export interface Player {
  id: string;
  name: string;
  color: ChipColor;
  hand: HandCard[]; // redacted to [] for non-owners in GET response
  handSize: number; // always accurate even when hand is redacted
  isActive: boolean;
  joinedAt: FirestoreTimestamp;
  completedSequenceCount: number;
}

export interface GameDoc {
  id: string;
  hostId: string;
  theme: ThemeId;
  status: GameStatus;
  players: Player[];
  board: BoardCell[];
  sequences: Sequence[];
  drawPile: HandCard[];
  discardPile: HandCard[];
  currentPlayerId: string;
  turnNumber: number;
  sequencesToWin: number;
  handSize: number;
  winnerId: string | null;
  lastAction: {
    playerId: string;
    type: 'place' | 'remove' | 'discard';
    cellIndex: number | null;
    cardItemId: string;
    turnNumber: number;
  } | null;
  createdAt: FirestoreTimestamp;
  lastActivity: FirestoreTimestamp;
}
