import { msg } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ImportForm } from '@/components/ImportForm';
import { getI18n } from '@/lib/i18n';
import { initLingui } from '@/lib/initLingui';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { i18n } = await getI18n(lang);
  const appTitle = i18n._(msg`Kindle Vault`);
  const importTitle = i18n._(msg`Importar`);
  return {
    title: `${importTitle} — ${appTitle}`,
  };
}

export default async function ImportPage({ params }: Props) {
  const { lang } = await params;
  await initLingui(lang);

  return (
    <main className="max-w-xl mx-auto animate-fade-in-up">
      <header className="mb-8">
        <Link
          href={`/${lang}`}
          className="text-fade hover:text-ink transition-colors text-sm font-crimson mb-6 inline-block"
        >
          <Trans>← Voltar ao cofre</Trans>
        </Link>
        <h1 className="font-playfair text-4xl mb-2 text-ink">
          <Trans>Importar Highlights</Trans>
        </h1>
        <div className="ornament">❧</div>
      </header>

      <ImportForm />
    </main>
  );
}
