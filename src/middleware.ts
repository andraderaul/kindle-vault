import { type NextRequest, NextResponse } from 'next/server';

import { DEFAULT_LOCALE, isValidLocale } from '@/config/locales';

function getLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const preferred = acceptLanguage.split(',')[0]?.split('-')[0];

  if (preferred === 'pt') {
    return 'pt-BR';
  }
  if (preferred === 'es') {
    return 'es';
  }
  if (preferred === 'en') {
    return 'en';
  }
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] ?? '';
  // Valid locale already in path — no redirect
  if (isValidLocale(firstSegment)) {
    return NextResponse.next();
  }

  const locale = getLocale(request);

  // If the first segment is an invalid locale (ex: /fr/book/x),
  // replace with the correct locale preserving the rest of the path
  const restSegments =
    firstSegment && !isValidLocale(firstSegment)
      ? segments.slice(1) // ignore the first segment if it's an invalid locale
      : segments;

  const targetPath = `/${locale}${restSegments.length > 0 ? `/${restSegments.join('/')}` : ''}`;

  return NextResponse.redirect(new URL(targetPath, request.url));
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
