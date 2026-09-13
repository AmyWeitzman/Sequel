'use client';

import type { HandCard as HandCardData } from '@/types/game';
import type { ThemeDefinition } from '@/lib/themes';
import { isCardDead } from '@/lib/engine/play';
import HandCardView from './HandCard';
import type { BoardCell } from '@/types/game';

interface HandProps {
  hand: HandCardData[];
  board: BoardCell[];
  theme: ThemeDefinition;
  armedCardId: string | null;
  interactive: boolean;
  onArm: (cardId: string) => void;
  onDiscard: (cardId: string) => void;
}

export default function Hand({ hand, board, theme, armedCardId, interactive, onArm, onDiscard }: HandProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center lg:grid lg:grid-cols-2 lg:justify-items-center">
      {hand.map((card) => {
        const dead = isCardDead(card, board, theme);
        return (
          <HandCardView
            key={card.cardId}
            card={card}
            theme={theme}
            selected={armedCardId === card.cardId}
            dead={dead}
            disabled={!interactive}
            onSelect={() => onArm(card.cardId)}
            onDiscard={() => onDiscard(card.cardId)}
          />
        );
      })}
    </div>
  );
}
