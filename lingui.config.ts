import { defineConfig } from '@lingui/conf';

export default defineConfig({
  locales: ['pt-BR', 'en', 'es'],
  sourceLocale: 'pt-BR',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
});
