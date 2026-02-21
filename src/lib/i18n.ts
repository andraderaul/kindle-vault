import { type MessageDescriptor, type Messages, setupI18n } from '@lingui/core';
import { cache } from 'react';

import { getSafeLocale } from '@/config/locales';

export type { Locale } from '@/config/locales';
export { getSafeLocale } from '@/config/locales';

/**
 * i18n._(descriptor, values) — runtime supports it; Lingui types only declare (descriptor) or (id, values).
 * Use in Client Components when passing msg + values to avoid breaking lingui extract (spread in 1st arg breaks the plugin).
 */
export function translateWithValues(
  i18n: { _(d: MessageDescriptor): string },
  descriptor: MessageDescriptor,
  values?: Record<string, unknown>,
): string {
  return (i18n._ as (d: MessageDescriptor, v?: Record<string, unknown>) => string)(
    descriptor,
    values,
  );
}

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
