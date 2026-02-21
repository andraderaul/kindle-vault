export const LOCALES = [
  { code: 'pt-BR', label: 'PT', name: 'Português' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
] as const;

export type Locale = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export const LOCALE_CODES = LOCALES.map((l) => l.code);

export const LOCALE_ROOTS = LOCALE_CODES.map((c) => `/${c}`);

export function isValidLocale(value: string): value is Locale {
  return LOCALE_CODES.includes(value as Locale);
}

export function getSafeLocale(value: string): Locale {
  return isValidLocale(value) ? value : DEFAULT_LOCALE;
}
