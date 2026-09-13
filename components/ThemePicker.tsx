'use client';

import type { ThemeId } from '@/types/game';
import { THEME_LIST } from '@/lib/themes';

interface ThemePickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
  disabled?: boolean;
}

const PREVIEW_COUNT = 6;

function previewFor(themeId: ThemeId): string {
  const theme = THEME_LIST.find((t) => t.id === themeId)!;
  return theme.boardItems
    .slice(0, PREVIEW_COUNT)
    .map((item) => item.display.primary)
    .join('  ');
}

export default function ThemePicker({ value, onChange, disabled = false }: ThemePickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {THEME_LIST.map((theme) => {
        const selected = value === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(theme.id)}
            className={`text-left p-4 rounded-2xl border-2 transition-all ${
              selected
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-200'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="font-bold text-gray-900 mb-1">{theme.name}</div>
            <p className="text-xs text-gray-600 mb-2">{theme.description}</p>
            <p className="text-lg leading-none truncate" title={previewFor(theme.id)}>
              {previewFor(theme.id)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
