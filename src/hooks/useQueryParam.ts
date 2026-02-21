import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

const DEFAULT_DEBOUNCE_MS = 400;

export function useQueryParam(
  key: string,
  delay = DEFAULT_DEBOUNCE_MS,
  basePath = '/',
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(key) ?? '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === (params.get(key) ?? '')) {
        return;
      }

      startTransition(() => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
      });
    }, delay);

    return () => clearTimeout(handler);
  }, [value, key, delay, router, searchParams, basePath]);

  return [value, setValue, isPending] as const;
}
