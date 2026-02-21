'use server';

import { msg } from '@lingui/core/macro';
import { revalidatePath } from 'next/cache';
import { LOCALE_ROOTS } from '@/config/locales';
import { prisma } from './prisma';

export type ImportResult =
  | { success: true; imported: number; skipped: number }
  | { error: string };

// Mark strings for Lingui extraction; the client translates when displaying
const ERRORS = {
  noFile: msg`Nenhum arquivo enviado`,
  invalidJson: msg`JSON inválido`,
  notArray: msg`O JSON deve ser um array`,
  noValid: msg`Nenhum highlight válido encontrado`,
  dbError: msg`Erro ao salvar no banco. Tente novamente.`,
  deleteFailed: msg`Falha ao excluir`,
} as const;
void ERRORS; // referência para extração

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
    h.text.trim().length > 0
  );
}

export async function importHighlights(
  formData: FormData,
): Promise<ImportResult> {
  const file = formData.get('file') as File;
  if (!file) {
    return {
      error: 'Nenhum arquivo enviado',
    };
  }

  const raw = await file.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      error: 'JSON inválido',
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      error: 'O JSON deve ser um array',
    };
  }
  const valid = parsed.filter(isValidHighlight);
  const skipped = parsed.length - valid.length;

  if (valid.length === 0) {
    return {
      error: 'Nenhum highlight válido encontrado',
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

export async function deleteHighlight(id: string): Promise<DeleteHighlightResult> {
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
