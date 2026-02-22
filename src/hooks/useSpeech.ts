'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_PITCH = 1.05;
const DEFAULT_VOLUME = 1;

const preferredVoices = [
  'Luciana',
  'Google português do Brasil',
  'Microsoft Francisca',
];

function pickBestVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | null {
  for (const name of preferredVoices) {
    const voice = voices.find((v) => v.name.includes(name));
    if (voice) {
      return voice;
    }
  }

  // fallback to pt-BR
  return voices.find((v) => v.lang === 'pt-BR') ?? null;
}

function humanize(text: string): string {
  return text
    .replace(/\. /g, '.  ')
    .replace(/, /g, ',  ')
    .replace(/: /g, ':  ')
    .replace(/— /g, '—  ')
    .replace(/\n/g, '  ');
}

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const blocksRef = useRef<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Load voices
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) {
      return;
    }

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        const defaultVoice = pickBestVoice(availableVoices);
        setSelectedVoice((prev) => prev || defaultVoice);
      }
    };

    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => synth.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const speakNext = useCallback(
    (index: number) => {
      const synth = synthRef.current;
      const blocks = blocksRef.current;
      if (!synth || index >= blocks.length) {
        setIsPlaying(false);
        setCurrentIndex(-1);
        return;
      }

      const text = blocks[index];
      const spokenText = humanize(text);
      const utterance = new SpeechSynthesisUtterance(spokenText);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = DEFAULT_PITCH;
      utterance.volume = DEFAULT_VOLUME;

      utterance.onstart = () => {
        setCurrentIndex(index);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        speakNext(index + 1);
      };

      utterance.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          setIsPlaying(false);
          return;
        }
        console.error('[useSpeech]', e.error);
        setIsPlaying(false);
      };

      synth.speak(utterance);
    },
    [selectedVoice, rate],
  );

  const play = useCallback(
    (blocks?: string[], startIndex?: number) => {
      const synth = synthRef.current;
      if (!synth) {
        return;
      }
      if (blocks) {
        blocksRef.current = blocks;
      }
      const idx =
        startIndex !== undefined
          ? startIndex
          : blocks
            ? 0
            : Math.max(0, currentIndex);
      setCurrentIndex(idx);
      synth.cancel(); // clear queue
      speakNext(idx);
    },
    [speakNext, currentIndex],
  );

  const pause = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) {
      return;
    }
    synth.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) {
      return;
    }
    if (synth.paused) {
      synth.resume();
      setIsPlaying(true);
    } else {
      synth.cancel();
      speakNext(Math.max(0, currentIndex));
    }
  }, [currentIndex, speakNext]);

  const stop = useCallback(() => {
    const synth = synthRef.current;
    if (!synth) {
      return;
    }
    synth.cancel();
    setIsPlaying(false);
    setCurrentIndex(-1);
    blocksRef.current = [];
  }, []);

  const handleSetRate = useCallback(
    (newRate: number) => {
      setRate(newRate);
      const synth = synthRef.current;
      if (synth && isPlaying) {
        synth.cancel();
        speakNext(currentIndex);
      }
    },
    [isPlaying, currentIndex, speakNext],
  );

  const handleSetVoice = useCallback(
    (voice: SpeechSynthesisVoice) => {
      setSelectedVoice(voice);
      const synth = synthRef.current;
      if (synth && isPlaying) {
        synth.cancel();
        speakNext(currentIndex);
      }
    },
    [isPlaying, currentIndex, speakNext],
  );

  useEffect(() => {
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  return {
    isPlaying,
    currentIndex,
    rate,
    voices,
    selectedVoice,
    play,
    pause,
    resume,
    stop,
    setRate: handleSetRate,
    setVoice: handleSetVoice,
  };
}
