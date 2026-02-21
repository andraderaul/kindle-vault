import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getI18n } from '@/lib/i18n';
import { initLingui } from '@/lib/initLingui';
import { getHighlightsByBook } from '@/lib/queries';
import { BookClientWrapper } from './BookClientWrapper';

type Props = { params: Promise<{ lang: string; title: string }> };

function getDecodedTitle(title: string): string | null {
  try {
    return decodeURIComponent(title);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, title } = await params;
  const decoded = getDecodedTitle(title);
  const { i18n } = await getI18n(lang);
  const appTitle = i18n._(msg`Kindle Vault`);
  return {
    title: decoded ? `${decoded} — ${appTitle}` : appTitle,
  };
}

export default async function BookPage({ params }: Props) {
  const { lang, title } = await params;
  await initLingui(lang);

  const decoded = getDecodedTitle(title);
  if (!decoded) {
    notFound();
  }

  const highlights = await getHighlightsByBook(decoded);

  if (!highlights.length) {
    notFound();
  }

  const author = highlights[0].author;

  return (
    <main>
      <header className="mb-12 animate-fade-in-up">
        <Link
          href={`/${lang}`}
          className="text-fade hover:text-ink transition-colors text-sm font-crimson mb-6 inline-block"
        >
          <Trans>← Voltar ao cofre</Trans>
        </Link>
        <h1 className="font-playfair text-4xl mb-2 text-ink leading-tight">
          {decoded}
        </h1>
        <p className="font-crimson text-fade text-xl">{author}</p>
        <div className="ornament">❧</div>
      </header>

      <BookClientWrapper highlights={highlights} />
    </main>
  );
}
