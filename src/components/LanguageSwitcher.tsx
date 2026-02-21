'use client';

import { useLingui } from '@lingui/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { LOCALES, type Locale } from '@/config/locales';
import { cn } from '@/lib/cn';

const COOKIE_MAX_AGE_ONE_YEAR_SECONDS = 31536000;

export function LanguageSwitcher() {
  const { _ } = useLingui();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentLang = params.lang as Locale;

  function switchLocale(locale: Locale) {
    if (locale === currentLang) {
      return;
    }

    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));

    // Persist user preference for middleware on next visit
    // biome-ignore lint/suspicious/noDocumentCookie: locale preference, intentional
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${COOKIE_MAX_AGE_ONE_YEAR_SECONDS}; SameSite=Lax`;
  }

  return (
    <nav
      aria-label={_('Seletor de idioma')}
      className="flex items-center gap-1"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            switchLocale(code);
          }}
          aria-label={_('Mudar idioma para {label}', { label })}
          aria-current={currentLang === code ? 'true' : undefined}
          className={cn(
            'px-2 py-1 text-xs tracking-widest uppercase transition-all font-crimson',
            currentLang === code
              ? 'text-gold border-b border-gold'
              : 'text-fade hover:text-ink',
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
