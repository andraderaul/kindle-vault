/**
 * Map from character index (start of word) to word index.
 * Used for O(1) lookup on SpeechSynthesisUtterance onboundary events.
 */
export type WordMap = Record<number, number>;

const WORD_REGEX = /\S+/g;

export function buildWordMap(text: string): WordMap {
  const map: WordMap = {};
  let wordIndex = 0;

  WORD_REGEX.lastIndex = 0;
  let match = WORD_REGEX.exec(text);
  while (match !== null) {
    map[match.index] = wordIndex;
    wordIndex++;
    match = WORD_REGEX.exec(text);
  }

  return map;
}
