import { setI18n } from '@lingui/react/server';
import type { Metadata } from 'next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { LinguiClientProvider } from '@/components/LinguiClientProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LOCALE_CODES } from '@/config/locales';
import { getI18n, getSafeLocale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Kindle Vault',
  description: 'A refined literary reader for Kindle highlights',
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  const safeLocale = getSafeLocale(lang);
  const { i18n, messages } = await getI18n(safeLocale);
  setI18n(i18n);

  return (
    <LinguiClientProvider initialLocale={safeLocale} initialMessages={messages}>
      <div className="fixed top-4 right-6 z-[1000] flex items-center gap-3">
        <ThemeToggle />
        <div className="w-px h-4 bg-fade/30" aria-hidden />
        <LanguageSwitcher />
      </div>
      <div className="fixed top-0 bottom-0 left-0 w-[6px] bg-linear-to-r from-black/10 to-transparent dark:from-white/10 pointer-events-none z-[999]" />
      <div className="fixed top-0 bottom-0 right-0 w-[6px] bg-linear-to-l from-black/10 to-transparent dark:from-white/10 pointer-events-none z-[999]" />
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 bg-paper page-shadow min-h-screen relative z-10 transition-colors">
        {children}
      </div>
    </LinguiClientProvider>
  );
}

export async function generateStaticParams() {
  return LOCALE_CODES.map((lang) => ({ lang }));
}
