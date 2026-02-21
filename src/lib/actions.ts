'use server';

import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { revalidatePath } from 'next/cache';
import { LOCALE_ROOTS } from '@/config/locales';
import { UPLOAD_CONFIG } from '@/config/upload';
import { parseClippings } from '@/lib/parsers/clippings';
import { prisma } from './prisma';

export type ImportResult =
  | { success: true; imported: number; skipped: number }
  | {
      error: MessageDescriptor;
      errorParams?: Record<string, number | string>;
    };

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
  | { error: MessageDescriptor };

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
  const rawFile = formData.get('file');
  if (!(rawFile instanceof File)) {
    return { error: ERRORS.noFile };
  }
  const file = rawFile;

  if (file.size > UPLOAD_CONFIG.maxFileSizeBytes) {
    return { error: ERRORS.fileTooBig };
  }
  if (!UPLOAD_CONFIG.allowedTypesJson.includes(file.type)) {
    return { error: ERRORS.invalidTypeJson };
  }

  const raw = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: ERRORS.invalidJson };
  }

  if (!Array.isArray(parsed)) {
    return { error: ERRORS.notArray };
  }
  const valid = parsed.filter(isValidHighlight);
  const skipped = parsed.length - valid.length;

  if (valid.length === 0) {
    return { error: ERRORS.noValid };
  }
  if (valid.length > UPLOAD_CONFIG.maxHighlightsPerImport) {
    return {
      error: ERRORS.tooManyHighlights,
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
    return { error: ERRORS.dbError };
  }

  for (const root of LOCALE_ROOTS) {
    revalidatePath(root);
  }
  return { success: true, imported: valid.length, skipped };
}

export async function importClippings(
  formData: FormData,
): Promise<ImportResult> {
  const rawFile = formData.get('file');
  if (!(rawFile instanceof File)) {
    return { error: ERRORS.noFile };
  }
  const file = rawFile;

  if (file.size > UPLOAD_CONFIG.maxFileSizeBytes) {
    return { error: ERRORS.fileTooBig };
  }
  if (!UPLOAD_CONFIG.allowedTypesTxt.includes(file.type)) {
    return { error: ERRORS.invalidTypeTxt };
  }

  const raw = await file.text();
  const highlights = parseClippings(raw);

  if (highlights.length === 0) {
    return { error: ERRORS.noClippings };
  }
  if (highlights.length > UPLOAD_CONFIG.maxHighlightsPerImport) {
    return {
      error: ERRORS.tooManyHighlights,
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
    return { error: ERRORS.dbError };
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
  } catch {
    return { error: ERRORS.deleteFailed };
  }
}
