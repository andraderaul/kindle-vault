import { Trans } from '@lingui/react/macro';
import Link from 'next/link';
import { ImportForm } from '@/components/ImportForm';
import { initLingui } from '@/lib/initLingui';

type Props = {
  params: Promise<{ lang: string }>;
};

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
