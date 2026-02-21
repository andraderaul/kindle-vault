'use client';

import { useEffect } from 'react';

type Props = { lang: string };

export function LangAttribute({ lang }: Props) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
