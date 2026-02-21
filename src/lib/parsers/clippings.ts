import { UPLOAD_CONFIG } from '@/config/upload';

export type HighlightInput = {
  bookTitle: string;
  author: string;
  text: string;
  location?: number | null;
};

const KINDLE_LIMIT_MESSAGE =
  'You have reached the maximum number of highlights allowed on this item.';

function truncateSafe(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return [...text].slice(0, maxLength).join('');
}

function parseTitleAndAuthor(line: string): {
  bookTitle: string;
  author: string;
} {
  const match = line.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return {
      bookTitle: match[1].trim(),
      author: match[2].trim(),
    };
  }
  return { bookTitle: line.trim(), author: 'Desconhecido' };
}

function parseLocation(line: string): number | null {
  const match = line.match(/Location\s+([\d,]+)/i);
  if (!match) {
    return null;
  }
  const first = match[1].split('-')[0];
  const num = first.replace(/,/g, '');
  const parsed = parseInt(num, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseClippings(raw: string): HighlightInput[] {
  const content = raw.replace(/^\uFEFF/, '');
  const entries = content.split('==========');
  const results: HighlightInput[] = [];

  for (const entry of entries) {
    const lines = entry
      .trim()
      .split('\n')
      .map((l) => l.trim());

    if (lines.length < 4) {
      continue;
    }

    const titleLine = lines[0];
    const metaLine = lines[1];
    const textLines = lines.slice(3);
    const rawText = textLines.join(' ').trim();
    const text = truncateSafe(rawText, UPLOAD_CONFIG.maxHighlightLength);

    if (!metaLine.toLowerCase().includes('highlight')) {
      continue;
    }

    if (text.includes(KINDLE_LIMIT_MESSAGE)) {
      continue;
    }

    if (!text) {
      continue;
    }

    const { bookTitle, author } = parseTitleAndAuthor(titleLine);
    const location = parseLocation(metaLine);

    results.push({ bookTitle, author, text, location });
  }

  return results;
}
