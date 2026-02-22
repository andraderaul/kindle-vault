'use client';

import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import type { ImportResult } from '@/lib/actions';
import { importClippings, importHighlights } from '@/lib/actions';
import { cn } from '@/lib/cn';
import { translateWithValues } from '@/lib/i18n';
import { parseClippings } from '@/lib/parsers/clippings';

type ImportTab = 'clippings' | 'json';

type MessageState =
  | { type: 'success'; text: string }
  | {
      type: 'error';
      descriptor: MessageDescriptor;
      params?: Record<string, number | string>;
    }
  | { type: 'error'; text: string };

export function ImportForm() {
  const { i18n, _ } = useLingui();
  const clippingsInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ImportTab>('clippings');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<unknown[] | null>(null);
  const [clippingsCount, setClippingsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  const switchTab = (tab: ImportTab) => {
    setActiveTab(tab);
    setFile(null);
    setPreview(null);
    setClippingsCount(null);
    setMessage(null);
    if (clippingsInputRef.current) {
      clippingsInputRef.current.value = '';
    }
    if (jsonInputRef.current) {
      jsonInputRef.current.value = '';
    }
  };

  const handleClippingsFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }
    setFile(selected);
    setMessage(null);
    try {
      const text = await selected.text();
      const highlights = parseClippings(text);
      setClippingsCount(highlights.length);
      setPreview(
        highlights.length > 0
          ? highlights.slice(0, 3).map((h) => ({
              bookTitle: h.bookTitle,
              author: h.author,
              text: h.text.slice(0, 80) + (h.text.length > 80 ? '…' : ''),
            }))
          : null,
      );
    } catch {
      setClippingsCount(0);
      setPreview(null);
    }
  };

  const handleJsonFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }
    setFile(selected);
    setMessage(null);
    setClippingsCount(null);
    try {
      const text = await selected.text();
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        setPreview(json.slice(0, 3));
      } else {
        setMessage({
          type: 'error',
          text: _(msg`O JSON não é um array.`),
        });
        setPreview(null);
      }
    } catch (err: unknown) {
      const detail =
        err instanceof Error ? err.message : i18n._(msg`JSON inválido`);
      setMessage({
        type: 'error',
        text: String(
          translateWithValues(i18n, msg`Arquivo JSON inválido: {detail}`, {
            detail,
          }),
        ),
      });
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    const result: ImportResult =
      activeTab === 'clippings'
        ? await importClippings(formData)
        : await importHighlights(formData);

    setLoading(false);
    if ('error' in result) {
      setMessage({
        type: 'error',
        descriptor: result.error,
        params: result.errorParams,
      });
    } else {
      setMessage({
        type: 'success',
        text: String(
          translateWithValues(
            i18n,
            msg`{imported} highlights importados com sucesso! ({skipped} ignorados)`,
            {
              imported: result.imported,
              skipped: result.skipped,
            },
          ),
        ),
      });
      setFile(null);
      setPreview(null);
      setClippingsCount(null);
      if (clippingsInputRef.current) {
        clippingsInputRef.current.value = '';
      }
      if (jsonInputRef.current) {
        jsonInputRef.current.value = '';
      }
    }
  };

  const hasError = message?.type === 'error';
  const canSubmit =
    !!file &&
    !loading &&
    !hasError &&
    (activeTab === 'json' ? !!preview : true);

  return (
    <div className="bg-paper-dark p-8 rounded-xl border border-fade/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-playfair text-ink mb-4">
            {_(msg`Importar Highlights`)}
          </h2>

          <div
            className="flex gap-2 border-b border-fade/20 mb-4"
            role="tablist"
            aria-label={_(msg`Tipo de arquivo para importar`)}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'clippings'}
              aria-controls="clippings-panel"
              id="tab-clippings"
              onClick={() => {
                switchTab('clippings');
              }}
              className={cn(
                'px-4 py-2 font-crimson text-sm rounded-t transition-colors',
                activeTab === 'clippings'
                  ? 'bg-gold/10 text-gold border-b-2 border-gold -mb-px'
                  : 'text-fade hover:text-ink',
              )}
            >
              {_(msg`My Clippings.txt`)}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'json'}
              aria-controls="json-panel"
              id="tab-json"
              onClick={() => {
                switchTab('json');
              }}
              className={cn(
                'px-4 py-2 font-crimson text-sm rounded-t transition-colors',
                activeTab === 'json'
                  ? 'bg-gold/10 text-gold border-b-2 border-gold -mb-px'
                  : 'text-fade hover:text-ink',
              )}
            >
              {_(msg`JSON`)}
            </button>
          </div>

          {activeTab === 'clippings' && (
            <div
              id="clippings-panel"
              role="tabpanel"
              aria-labelledby="tab-clippings"
              className="flex flex-col gap-2"
            >
              <label
                htmlFor="clippings-upload"
                className="block text-ink font-crimson"
              >
                {_(
                  msg`Arraste o arquivo My Clippings.txt do seu Kindle ou clique para escolher`,
                )}
              </label>
              <input
                ref={clippingsInputRef}
                id="clippings-upload"
                type="file"
                accept=".txt"
                onChange={handleClippingsFileChange}
                className="block w-full text-sm text-fade font-crimson
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gold/10 file:text-gold
                  hover:file:bg-gold/20
                  cursor-pointer"
              />
              <p className="text-sm text-fade mt-2 font-crimson">
                <Trans>
                  Conecte o Kindle ao computador e procure o arquivo em{' '}
                  <code className="font-mono text-xs">
                    Kindle/documents/My Clippings.txt
                  </code>
                </Trans>
              </p>
            </div>
          )}

          {activeTab === 'json' && (
            <div
              id="json-panel"
              role="tabpanel"
              aria-labelledby="tab-json"
              className="flex flex-col gap-2"
            >
              <label
                htmlFor="json-upload"
                className="block text-ink font-crimson"
              >
                {_(msg`Enviar JSON de highlights`)}
              </label>
              <p className="text-fade text-sm font-crimson">
                {_(
                  msg`Exporte seus highlights para JSON e envie aqui. Deve ser um array de objetos com bookTitle, author, text e location (opcional).`,
                )}
              </p>
              <input
                ref={jsonInputRef}
                id="json-upload"
                type="file"
                accept=".json,application/json"
                onChange={handleJsonFileChange}
                className="block w-full text-sm text-fade font-crimson
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gold/10 file:text-gold
                  hover:file:bg-gold/20
                  cursor-pointer"
              />
            </div>
          )}
        </div>

        {message && (
          <div
            className={cn(
              'p-4 rounded border font-crimson',
              message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-green-50 border-green-200 text-green-800',
            )}
          >
            {message.type === 'error'
              ? 'descriptor' in message
                ? translateWithValues(i18n, message.descriptor, {
                    ...(message.descriptor.values as Record<string, unknown>),
                    ...message.params,
                  })
                : message.text
              : message.text}
          </div>
        )}

        {activeTab === 'clippings' && clippingsCount !== null && (
          <div className="bg-paper p-4 rounded border border-fade/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fade mb-2">
              {String(
                translateWithValues(i18n, msg`Prévia (primeiros {count})`, {
                  count: Math.min(3, clippingsCount),
                }),
              )}
            </h3>
            {preview && Array.isArray(preview) && preview.length > 0 ? (
              <ul className="text-sm text-ink/90 font-crimson space-y-2">
                {(
                  preview as {
                    bookTitle: string;
                    author: string;
                    text: string;
                  }[]
                ).map((h, i) => (
                  <li
                    key={`${h.bookTitle}-${h.text.slice(0, 40)}-${i}`}
                    className="border-l-2 border-gold/30 pl-2"
                  >
                    <span className="font-semibold">{h.bookTitle}</span>
                    {' — '}
                    {h.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-fade text-sm">
                {String(i18n._(msg`Nenhum highlight encontrado no arquivo`))}
              </p>
            )}
          </div>
        )}

        {activeTab === 'json' && preview && (
          <div className="bg-paper p-4 rounded border border-fade/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fade mb-2">
              {String(
                translateWithValues(i18n, msg`Prévia (primeiros {count})`, {
                  count: preview.length,
                }),
              )}
            </h3>
            <pre className="text-[10px] overflow-auto max-h-40 text-ink/80 font-mono">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="self-start px-6 py-2 bg-gold text-white font-medium rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors font-crimson"
        >
          {loading ? _(msg`Importando...`) : _(msg`Importar para o cofre`)}
        </button>
      </form>
    </div>
  );
}
