import type { ThemeId } from '@/types/game';
import type { ThemeDefinition } from './types';
import { emojiTheme } from './emoji';
import { spaceTheme } from './space';
import { nounAdjectiveTheme } from './nounAdjective';

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  emoji: emojiTheme,
  space: spaceTheme,
  'noun-adjective': nounAdjectiveTheme,
};

export const THEME_LIST: ThemeDefinition[] = [emojiTheme, spaceTheme, nounAdjectiveTheme];

export function getTheme(id: ThemeId): ThemeDefinition {
  const theme = THEMES[id];
  if (!theme) {
    throw new Error(`Unknown theme id: ${id}`);
  }
  return theme;
}

export type { ThemeDefinition, BoardItem, HandCardDef, WildcardDef } from './types';
