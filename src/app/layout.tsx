import { Crimson_Pro, Playfair_Display } from 'next/font/google';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE } from '@/config/locales';
import { cn } from '@/lib/cn';

import './globals.css';

const themeScript = `
(function() {
  try {
    var cookie = document.cookie.split(';').find(function(c) {
      return c.trim().startsWith('THEME=');
    });
    var theme = cookie ? cookie.split('=')[1].trim() : null;
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const crimson = Crimson_Pro({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-crimson',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('THEME')?.value;
  const isDark = theme === 'dark';

  return (
    <html
      lang={DEFAULT_LOCALE}
      className={isDark ? 'dark' : ''}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static theme script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={cn(
          playfair.variable,
          crimson.variable,
          'font-crimson antialiased min-h-screen bg-paper text-ink relative',
        )}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
