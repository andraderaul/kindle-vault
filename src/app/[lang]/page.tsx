import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { BookCard } from '@/components/BookCard';
import { SearchBar } from '@/components/SearchBar';
import { SearchResultsSection } from '@/components/SearchResultsSection';
import { getI18n } from '@/lib/i18n';
import { initLingui } from '@/lib/initLingui';
import { getBooksGrouped, searchHighlights } from '@/lib/queries';

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { i18n } = await getI18n(lang);
  return {
    title: i18n._(msg`Kindle Vault`),
  };
}

export default async function Home({ params, searchParams }: Props) {
  const { lang } = await params;
  await initLingui(lang);

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
        <SearchResultsSection
          searchResults={searchResults}
          query={q ?? ''}
          lang={lang}
        />
      )}
    </main>
  );
}
