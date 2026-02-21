import { type Messages, setupI18n } from '@lingui/core';
import { cache } from 'react';

import { getSafeLocale } from '@/config/locales';

export type { Locale } from '@/config/locales';
export { getSafeLocale } from '@/config/locales';

export const getI18n = cache(async (locale: string) => {
  const safeLocale = getSafeLocale(locale);

  const { messages } = await import(`@/locales/${safeLocale}/messages.js`);

  const i18n = setupI18n({
    locale: safeLocale,
    messages: { [safeLocale]: messages },
  });

  // Dynamic import path prevents TypeScript from inferring Messages; cast is required.
  return { i18n, messages: messages as Messages };
});
