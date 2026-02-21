'use client';

import { useMemo } from 'react';
import { AudioPlayer } from '@/components/AudioPlayer';
import { HighlightCard } from '@/components/HighlightCard';
import { useSpeech } from '@/hooks/useSpeech';
import type { Highlight } from '@/types/highlight';

const STAGGER_MAX_INDEX = 20;
const STAGGER_DELAY_MS = 50;

export function BookClientWrapper({ highlights }: { highlights: Highlight[] }) {
  const {
    isPlaying,
    currentIndex,
    rate,
    voices,
    selectedVoice,
    play,
    pause,
    resume,
    stop,
    setRate,
    setVoice,
  } = useSpeech();

  const blocks = useMemo(() => highlights.map((h) => h.text), [highlights]);

  return (
    <div className="pb-32">
      <div className="space-y-2">
        {highlights.map((highlight, index) => {
          const isActive = isPlaying && currentIndex === index;
          const wasRead = currentIndex > index;

          return (
            <div
              key={highlight.id}
              className="fadeInUp-stagger"
              style={{
                animationDelay: `${Math.min(index, STAGGER_MAX_INDEX) * STAGGER_DELAY_MS}ms`,
              }}
            >
              <HighlightCard
                highlight={highlight}
                isActive={isActive}
                wasRead={wasRead}
                onClick={() => {
                  if (isPlaying && currentIndex === index) {
                    pause();
                  } else {
                    play(blocks, index);
                  }
                }}
                isFirst={index === 0}
              />
            </div>
          );
        })}
      </div>

      <AudioPlayer
        blocks={blocks}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        rate={rate}
        voices={voices}
        selectedVoice={selectedVoice}
        onPlay={() => play(blocks)}
        onPause={pause}
        onResume={resume}
        onStop={stop}
        onSetRate={setRate}
        onSetVoice={setVoice}
      />
    </div>
  );
}
