'use server';

import { msg } from '@lingui/core/macro';
import { revalidatePath } from 'next/cache';
import { LOCALE_ROOTS } from '@/config/locales';
import { UPLOAD_CONFIG } from '@/config/upload';
import { parseClippings } from '@/lib/parsers/clippings';
import { prisma } from './prisma';

export type ImportResult =
  | { success: true; imported: number; skipped: number }
  | { error: string; errorParams?: Record<string, number | string> };

// Mark strings for Lingui extraction; the client translates when displaying
const ERRORS = {
  noFile: msg`Nenhum arquivo enviado`,
  fileTooBig: msg`Arquivo muito grande. O limite é 5MB.`,
  invalidTypeTxt: msg`Tipo de arquivo inválido. Envie um arquivo .txt`,
  invalidTypeJson: msg`Tipo de arquivo inválido. Envie um arquivo .json`,
  invalidJson: msg`JSON inválido`,
  notArray: msg`O JSON deve ser um array`,
  noValid: msg`Nenhum highlight válido encontrado`,
  noClippings: msg`Nenhum highlight encontrado no arquivo`,
  tooManyHighlights: msg`Arquivo contém muitos highlights. O limite por importação é {limit}.`,
  dbError: msg`Erro ao salvar no banco. Tente novamente.`,
  deleteFailed: msg`Falha ao excluir`,
} as const;
void ERRORS; // reference for extraction

export type DeleteHighlightResult =
  | { success: true }
  | { error: 'deleteFailed'; detail?: string };

type HighlightInput = {
  bookTitle: string;
  author: string;
  text: string;
  location?: number;
};

function isValidHighlight(item: unknown): item is HighlightInput {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const h = item as Record<string, unknown>;
  return (
    typeof h.bookTitle === 'string' &&
    h.bookTitle.trim().length > 0 &&
    typeof h.author === 'string' &&
    h.author.trim().length > 0 &&
    typeof h.text === 'string' &&
    h.text.trim().length > 0 &&
    h.text.length <= UPLOAD_CONFIG.maxHighlightLength
  );
}

export async function importHighlights(
  formData: FormData,
): Promise<ImportResult> {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'Nenhum arquivo enviado' };
  }
  if (file.size > UPLOAD_CONFIG.maxFileSizeBytes) {
    return { error: 'Arquivo muito grande. O limite é 5MB.' };
  }
  if (!UPLOAD_CONFIG.allowedTypesJson.includes(file.type)) {
    return { error: 'Tipo de arquivo inválido. Envie um arquivo .json' };
  }

  const raw = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: 'JSON inválido' };
  }

  if (!Array.isArray(parsed)) {
    return { error: 'O JSON deve ser um array' };
  }
  const valid = parsed.filter(isValidHighlight);
  const skipped = parsed.length - valid.length;

  if (valid.length === 0) {
    return { error: 'Nenhum highlight válido encontrado' };
  }
  if (valid.length > UPLOAD_CONFIG.maxHighlightsPerImport) {
    return {
      error:
        'Arquivo contém muitos highlights. O limite por importação é {limit}.',
      errorParams: { limit: UPLOAD_CONFIG.maxHighlightsPerImport },
    };
  }

  try {
    await prisma.highlight.createMany({
      data: valid.map((h) => ({
        bookTitle: h.bookTitle.trim(),
        author: h.author.trim(),
        text: h.text.trim(),
        location:
          h.location != null ? parseInt(String(h.location), 10) || null : null,
      })),
    });
  } catch (e) {
    console.error('[importHighlights]', e);
    return { error: 'Erro ao salvar no banco. Tente novamente.' };
  }

  for (const root of LOCALE_ROOTS) {
    revalidatePath(root);
  }
  return { success: true, imported: valid.length, skipped };
}

export async function importClippings(
  formData: FormData,
): Promise<ImportResult> {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'Nenhum arquivo enviado' };
  }
  if (file.size > UPLOAD_CONFIG.maxFileSizeBytes) {
    return { error: 'Arquivo muito grande. O limite é 5MB.' };
  }
  if (!UPLOAD_CONFIG.allowedTypesTxt.includes(file.type)) {
    return { error: 'Tipo de arquivo inválido. Envie um arquivo .txt' };
  }

  const raw = await file.text();
  const highlights = parseClippings(raw);

  if (highlights.length === 0) {
    return { error: 'Nenhum highlight encontrado no arquivo' };
  }
  if (highlights.length > UPLOAD_CONFIG.maxHighlightsPerImport) {
    return {
      error:
        'Arquivo contém muitos highlights. O limite por importação é {limit}.',
      errorParams: { limit: UPLOAD_CONFIG.maxHighlightsPerImport },
    };
  }

  try {
    await prisma.highlight.createMany({
      data: highlights.map((h) => ({
        bookTitle: h.bookTitle,
        author: h.author,
        text: h.text,
        location: h.location ?? null,
      })),
    });
  } catch (e) {
    console.error('[importClippings]', e);
    return { error: 'Erro ao salvar no banco. Tente novamente.' };
  }

  for (const root of LOCALE_ROOTS) {
    revalidatePath(root);
  }
  return { success: true, imported: highlights.length, skipped: 0 };
}

export async function deleteHighlight(
  id: string,
): Promise<DeleteHighlightResult> {
  try {
    await prisma.highlight.delete({ where: { id } });
    for (const root of LOCALE_ROOTS) {
      revalidatePath(root);
    }
    return { success: true };
  } catch (err: unknown) {
    return {
      error: 'deleteFailed',
      detail: err instanceof Error ? err.message : undefined,
    };
  }
}
