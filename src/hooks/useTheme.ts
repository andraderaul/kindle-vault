'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const COOKIE_NAME = 'THEME';
const COOKIE_MAX_AGE_ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getCookieTheme(): Theme | null {
  const cookie = document.cookie
    .split(';')
    .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
  const value = cookie?.split('=')[1]?.trim();
  return value === 'light' || value === 'dark' ? value : null;
}

function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = getCookieTheme();

    if (saved) {
      setTheme(saved);
      return;
    }

    const system = getSystemTheme();
    setTheme(system);
    applyTheme(system);
  }, []);

  function toggleTheme(): void {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    applyTheme(next);
    // biome-ignore lint: theme preference must be persisted via cookie for SSR/refresh
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE_ONE_YEAR_SECONDS}; SameSite=Lax`;
  }

  return { theme, toggleTheme };
}
