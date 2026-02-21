import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import Link from 'next/link';
import { Suspense } from 'react';
import { BookCard } from '@/components/BookCard';
import { SearchBar } from '@/components/SearchBar';
import { getI18n } from '@/lib/i18n';
import { initLingui } from '@/lib/initLingui';
import { getBooksGrouped, searchHighlights } from '@/lib/queries';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function Home({ params, searchParams }: Props) {
  const { lang } = await params;
  await initLingui(lang);
  const { i18n } = await getI18n(lang);

  const { q } = await searchParams;
  const isSearch = !!q;

  const books = isSearch ? [] : await getBooksGrouped();
  const searchResults = isSearch ? await searchHighlights(q) : [];

  return (
    <main>
      <header className="book-header animate-fade-in-up">
        <h1 className="font-playfair text-5xl mb-2 text-ink">
          <Trans>Kindle Vault</Trans>
        </h1>
        <p className="font-crimson text-fade text-sm uppercase tracking-[0.15em] mb-3">
          <Trans>Sua coleção literária pessoal</Trans>
        </p>
        <Link
          href={`/${lang}/import`}
          className="text-xs font-crimson text-fade border border-fade/30 px-3 py-1 rounded-full hover:bg-fade/10 hover:text-ink transition-colors uppercase tracking-[0.1em]"
        >
          <Trans>Importar</Trans>
        </Link>
      </header>

      <Suspense
        fallback={
          <div
            className="h-[42px] w-full max-w-xl mx-auto rounded-full bg-fade/5 border border-fade/10 mb-8"
            aria-hidden="true"
          />
        }
      >
        <SearchBar />
      </Suspense>

      {!isSearch && (
        <div className="mt-8">
          {books.length === 0 ? (
            <p className="text-center text-fade italic my-12 animate-fade-in-up">
              <Trans>
                Seu cofre está vazio. Importe alguns highlights para começar.
              </Trans>
            </p>
          ) : (
            <div className="books-grid">
              {books.map((book, index) => (
                <BookCard
                  key={book.bookTitle}
                  bookTitle={book.bookTitle}
                  author={book.author}
                  count={book.count}
                  index={index}
                  lang={lang}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {isSearch && (
        <div className="mt-8 animate-fade-in-up">
          <h2 className="font-playfair text-2xl mb-6 text-ink">
            {i18n._({
              ...msg`{count, plural, one {# resultado para "{query}"} other {# resultados para "{query}"}}`,
              values: {
                count: searchResults.length,
                query: q ?? '',
              },
            })}
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
                      {highlight.bookTitle} • Lok. {highlight.location || 'N/A'}
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
      )}
    </main>
  );
}
