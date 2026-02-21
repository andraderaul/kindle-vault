'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MoonIcon, SunIcon } from '@/components/icons';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/cn';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { _ } = useLingui();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark ? _(msg`Ativar modo claro`) : _(msg`Ativar modo escuro`)
      }
      className={cn(
        'flex items-center justify-center w-7 h-7 transition-colors',
        'text-fade hover:text-ink dark:hover:text-ink',
      )}
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
}
