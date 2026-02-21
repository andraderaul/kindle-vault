import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import Link from 'next/link';

const CARD_ANIMATION_DELAY_MS = 100;

type BookCardProps = {
  bookTitle: string;
  author: string;
  count: number;
  index: number;
  lang: string;
};

export function BookCard({
  bookTitle,
  author,
  count,
  index,
  lang,
}: BookCardProps) {
  const { _ } = useLingui();
  const label = count === 1 ? _(msg`Highlight`) : _(msg`Highlights`);
  return (
    <Link
      href={`/${lang}/book/${encodeURIComponent(bookTitle)}`}
      className="book-card group block"
      style={{
        animationDelay: `${(index + 1) * CARD_ANIMATION_DELAY_MS}ms`,
      }}
    >
      <h2 className="font-playfair text-[1.4rem] mb-1 text-ink">{bookTitle}</h2>
      <p className="text-fade text-[0.65rem] mb-3 font-crimson uppercase tracking-[0.1em]">
        {author}
      </p>
      <div className="flex items-center text-xs text-gold/80 flex-row">
        <span className="italic">
          {count} {label}
        </span>
        <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity not-italic uppercase tracking-widest text-[10px]">
          <Trans>Ler →</Trans>
        </span>
      </div>
    </Link>
  );
}
