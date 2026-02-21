import { setI18n } from '@lingui/react/server';
import { getI18n } from '@/lib/i18n';

export async function initLingui(lang: string) {
  const { i18n } = await getI18n(lang);
  setI18n(i18n);
  return i18n;
}
