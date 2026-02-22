'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

// Progressive enhancement — funciona apenas em browsers que suportam
// SpeechSynthesisUtterance.onboundary com event.name === 'word'
// (Chrome, Safari macOS). Em outros, activeWordIndex permanece null
// e o texto é renderizado sem destaque de palavra.

type WordHighlighterProps = {
  text: string;
  activeWordIndex: number | null;
  className?: string;
};

export function WordHighlighter({
  text,
  activeWordIndex,
  className,
}: WordHighlighterProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeWordIndex === null || !containerRef.current) {
      return;
    }

    const spans = containerRef.current.querySelectorAll('[data-word]');
    const activeSpan = spans[activeWordIndex] as HTMLElement | undefined;

    if (!activeSpan) {
      return;
    }

    activeSpan.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeWordIndex]);

  const tokens = text.split(/(\s+)/);
  let wordIndex = 0;
  let tokenPosition = 0;

  return (
    <div ref={containerRef} className={className}>
      {tokens.map((token) => {
        const position = tokenPosition;
        tokenPosition++;

        if (/^\s+$/.test(token)) {
          return <span key={`t-${position}`}>{token}</span>;
        }

        const currentIndex = wordIndex;
        wordIndex++;

        return (
          <span
            key={`t-${position}`}
            data-word={currentIndex}
            className={cn(
              'rounded-sm px-px transition-colors duration-75',
              activeWordIndex === currentIndex
                ? 'bg-gold/30 text-ink'
                : 'text-inherit',
            )}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
}
