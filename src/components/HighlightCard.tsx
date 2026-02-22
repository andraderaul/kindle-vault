'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { forwardRef, memo } from 'react';
import { PlayIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import { translateWithValues } from '@/lib/i18n';
import type { Highlight } from '@/types/highlight';

type HighlightCardProps = {
  highlight: Highlight;
  index: number;
  isActive: boolean;
  wasRead: boolean;
  onCardClick: (index: number) => void;
  isFirst: boolean;
};

const TEXT_CLASS = 'font-crimson text-ink whitespace-pre-wrap';

const HighlightCardComponent = forwardRef<
  HTMLButtonElement,
  HighlightCardProps
>(function HighlightCard(
  { highlight, index, isActive, wasRead, onCardClick, isFirst },
  ref,
) {
  const { i18n, _ } = useLingui();
  return (
    <button
      ref={ref}
      type="button"
      aria-label={isActive ? _(msg`Pausar highlight`) : _(msg`Ler highlight`)}
      onClick={() => {
        onCardClick(index);
      }}
      className={cn(
        'w-full text-left p-6 mb-8 rounded-md transition-all duration-300 cursor-pointer text-lg leading-relaxed border-0 bg-transparent',
        isActive
          ? 'highlight-active shadow-md scale-[1.01]'
          : 'border-l-4 border-transparent hover:border-fade/30',
        wasRead && !isActive && 'was-read',
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          <p className={cn(TEXT_CLASS, isFirst && 'drop-cap')}>
            {highlight.text}
          </p>
          {highlight.location != null && (
            <div className="mt-4 text-xs text-fade/70 uppercase tracking-widest font-mono">
              {translateWithValues(i18n, msg`Lok. {location}`, {
                location: highlight.location,
              })}
            </div>
          )}
        </div>
        {isActive && (
          <div className="ml-4 shrink-0 text-gold shadow-sm p-2 rounded-full bg-gold/10">
            <PlayIcon size={16} />
          </div>
        )}
      </div>
    </button>
  );
});

export const HighlightCard = memo(HighlightCardComponent);
