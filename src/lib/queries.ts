import type { Highlight } from '@/types/highlight';
import { prisma } from './prisma';

export async function getBooksGrouped(): Promise<
  Array<{ bookTitle: string; author: string; count: number }>
> {
  const grouped = await prisma.highlight.groupBy({
    by: ['bookTitle', 'author'],
    _count: { id: true },
    orderBy: {
      bookTitle: 'asc',
    },
  });
  return grouped.map((h) => ({
    bookTitle: h.bookTitle,
    author: h.author,
    count: h._count.id,
  }));
}

export async function getHighlightsByBook(
  bookTitle: string,
): Promise<Highlight[]> {
  return prisma.highlight.findMany({
    where: { bookTitle },
    orderBy: [{ location: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      text: true,
      location: true,
      author: true,
      bookTitle: true,
    },
  });
}

export async function searchHighlights(query: string): Promise<Highlight[]> {
  if (!query) {
    return [];
  }
  return prisma.highlight.findMany({
    where: {
      text: {
        contains: query,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      text: true,
      location: true,
      author: true,
      bookTitle: true,
    },
  });
}
