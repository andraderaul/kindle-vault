'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import Link from 'next/link';
import { translateWithValues } from '@/lib/i18n';
import type { Highlight } from '@/types/highlight';

type SearchResultsSectionProps = {
  searchResults: Highlight[];
  query: string;
  lang: string;
};

export function SearchResultsSection({
  searchResults,
  query,
  lang,
}: SearchResultsSectionProps) {
  const { i18n } = useLingui();

  return (
    <div className="mt-8 animate-fade-in-up">
      <h2 className="font-playfair text-2xl mb-6 text-ink">
        {translateWithValues(
          i18n,
          msg`{count, plural, one {# resultado para "{query}"} other {# resultados para "{query}"}}`,
          { count: searchResults.length, query },
        )}
      </h2>

      {searchResults.length === 0 ? (
        <p className="text-fade italic font-crimson">
          <Trans>Nenhum highlight encontrado para sua busca.</Trans>
        </p>
      ) : (
        <div className="space-y-6">
          {searchResults.map((highlight) => (
            <div
              key={highlight.id}
              className="p-6 rounded-md border border-fade/10 bg-paper-dark relative"
            >
              <p className="font-crimson text-ink text-lg leading-relaxed mb-8">
                {highlight.text}
              </p>
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-xs">
                <span className="text-fade uppercase tracking-wider font-mono">
                  {highlight.bookTitle} •{' '}
                  {highlight.location != null
                    ? translateWithValues(i18n, msg`Lok. {location}`, {
                        location: highlight.location,
                      })
                    : i18n._(msg`Sem localização`)}
                </span>
                <Link
                  href={`/${lang}/book/${encodeURIComponent(highlight.bookTitle)}`}
                  className="text-gold hover:text-gold-light uppercase tracking-widest"
                >
                  <Trans>Livro →</Trans>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
