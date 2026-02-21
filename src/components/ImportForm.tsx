'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useRef, useState } from 'react';
import type { ImportResult } from '@/lib/actions';
import { importHighlights } from '@/lib/actions';
import { cn } from '@/lib/cn';

export function ImportForm() {
  const { _ } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      return;
    }
    setFile(selected);
    setMessage(null);

    try {
      const text = await selected.text();
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        setPreview(json.slice(0, 3)); // show max 3
      } else {
        setMessage({ type: 'error', text: _(msg`O JSON não é um array.`) });
        setPreview(null);
      }
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : _(msg`JSON inválido`);
      setMessage({
        type: 'error',
        text: _(msg`Arquivo JSON inválido: {detail}`, { detail }),
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

    const result: ImportResult = await importHighlights(formData);

    setLoading(false);
    if ('error' in result) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({
        type: 'success',
        text: _(
          msg`{imported} highlights importados com sucesso! ({skipped} ignorados)`,
          {
            imported: result.imported,
            skipped: result.skipped,
          },
        ),
      });
      setFile(null);
      setPreview(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-paper-dark p-8 rounded-xl border border-fade/20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="json-upload"
            className="block text-xl font-playfair text-ink mb-2"
          >
            {_(msg`Enviar JSON de highlights`)}
          </label>
          <p className="text-fade text-sm mb-4 font-crimson">
            {_(
              msg`Exporte seus highlights para JSON e envie aqui. Deve ser um array de objetos com bookTitle, author, text e location (opcional).`,
            )}
          </p>

          <input
            ref={inputRef}
            id="json-upload"
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="block w-full text-sm text-fade font-crimson
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-gold/10 file:text-gold
              hover:file:bg-gold/20
              cursor-pointer"
          />
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
            {message.type === 'error' ? _(message.text) : message.text}
          </div>
        )}

        {preview && (
          <div className="bg-paper p-4 rounded border border-fade/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-fade mb-2">
              {_(msg`Prévia (primeiros {count})`, { count: preview.length })}
            </h3>
            <pre className="text-[10px] overflow-auto max-h-40 text-ink/80 font-mono">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading || !!(message && message.type === 'error')}
          className="self-start px-6 py-2 bg-gold text-white font-medium rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-colors font-crimson"
        >
          {loading ? _(msg`Importando...`) : _(msg`Importar para o cofre`)}
        </button>
      </form>
    </div>
  );
}
