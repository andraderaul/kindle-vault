'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { PlayIcon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { Highlight } from '@/types/highlight';

type HighlightCardProps = {
  highlight: Highlight;
  isActive: boolean;
  wasRead: boolean;
  onClick?: () => void;
  isFirst: boolean;
};

export function HighlightCard({
  highlight,
  isActive,
  wasRead,
  onClick,
  isFirst,
}: HighlightCardProps) {
  const { _ } = useLingui();
  return (
    <button
      type="button"
      aria-label={isActive ? _(msg`Pausar highlight`) : _(msg`Ler highlight`)}
      onClick={onClick}
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
          <p
            className={cn(
              'font-crimson text-ink whitespace-pre-wrap',
              isFirst && 'drop-cap',
            )}
          >
            {highlight.text}
          </p>
          {highlight.location != null && (
            <div className="mt-4 text-xs text-fade/70 uppercase tracking-widest font-mono">
              {_(msg`Lok. {location}`, { location: highlight.location })}
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
}
