'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import {
  PauseIcon,
  PlayIcon,
  RestartIcon,
  SettingsIcon,
} from '@/components/icons';
import { cn } from '@/lib/cn';

const RATES = [0.5, 0.75, 0.85, 1, 1.25, 1.5, 2];

interface AudioPlayerProps {
  blocks: string[];
  currentIndex: number;
  isPlaying: boolean;
  rate: number;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSetRate: (n: number) => void;
  onSetVoice: (v: SpeechSynthesisVoice) => void;
}

export function AudioPlayer({
  blocks,
  currentIndex,
  isPlaying,
  rate,
  voices,
  selectedVoice,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSetRate,
  onSetVoice,
}: AudioPlayerProps) {
  const { _ } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  const progress =
    blocks.length > 0 && currentIndex >= 0
      ? (currentIndex / blocks.length) * 100
      : 0;
  const total = blocks.length;

  const ptBRVoices = voices.filter((v) => v.lang.startsWith('pt-BR'));
  const otherVoices = voices.filter((v) => !v.lang.startsWith('pt-BR'));

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {currentIndex >= 0
          ? _(msg`Lendo highlight {current} de {total}`, {
              current: currentIndex + 1,
              total,
            })
          : ''}
      </div>
      <div className="fixed top-0 left-0 w-full h-1 bg-fade/20 z-50">
        <div
          className="h-full bg-gold transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-ink text-paper p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-4 border border-paper/10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onStop}
            className="p-2 text-paper/70 hover:text-paper hover:bg-paper/10 rounded-full transition-colors"
            aria-label={_(msg`Recomeçar`)}
          >
            <RestartIcon size={20} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (isPlaying) {
                onPause();
              } else if (currentIndex > -1) {
                onResume();
              } else {
                onPlay();
              }
            }}
            className="w-12 h-12 flex items-center justify-center bg-gold text-ink rounded-full hover:bg-gold-light transition-colors transform hover:scale-105"
            aria-label={isPlaying ? _(msg`Pausar`) : _(msg`Reproduzir`)}
          >
            {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prevOpen) => !prevOpen)}
            className={cn(
              'p-2 rounded-full transition-colors',
              isOpen
                ? 'text-gold bg-gold/10'
                : 'text-paper/70 hover:text-paper hover:bg-paper/10',
            )}
            aria-label={_(msg`Configurações`)}
          >
            <SettingsIcon size={20} />
          </button>
        </div>

        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pt-4 border-t border-paper/10 text-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-paper/70">{_(msg`Velocidade`)}</span>
                <div className="flex gap-1 bg-paper/5 p-1 rounded-lg">
                  {RATES.map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => onSetRate(r)}
                      className={cn(
                        'px-2 py-1 rounded transition-colors',
                        rate === r
                          ? 'bg-gold text-ink font-bold'
                          : 'text-paper/70 hover:text-paper font-medium',
                      )}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="voice-select" className="sr-only">
                  {_(msg`Voz`)}
                </label>
                <select
                  id="voice-select"
                  className="w-full bg-ink-dark border border-paper/10 text-paper rounded p-2 focus:border-gold outline-none"
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const v = voices.find((v) => v.name === e.target.value);
                    if (v) {
                      onSetVoice(v);
                    }
                  }}
                >
                  <optgroup label={_(msg`Português (BR)`)}>
                    {ptBRVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={_(msg`Outras vozes`)}>
                    {otherVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
