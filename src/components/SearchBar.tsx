'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { usePathname } from 'next/navigation';
import { useQueryParam } from '@/hooks/useQueryParam';

export function SearchBar() {
  const { _ } = useLingui();
  const pathname = usePathname();
  const basePath = pathname ?? '/';
  const [query, setQuery, isPending] = useQueryParam('q', 400, basePath);

  return (
    <div className="relative mb-10 group animate-fade-in-up">
      <label htmlFor="search-highlights" className="sr-only">
        {_(msg`Buscar highlights por conteúdo`)}
      </label>
      <input
        id="search-highlights"
        type="text"
        className="search-input"
        placeholder={_(msg`Buscar highlights por conteúdo...`)}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isPending && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="w-4 h-4 border-2 border-fade/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
