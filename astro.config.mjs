// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.femres.org',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  trailingSlash: 'ignore',

  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN", "en", "ja", "fr", "zh-TW"],
    routing: {
      prefixDefaultLocale: false,  // 中文无前缀: /books
      fallbackType: "redirect"     // 英文有前缀: /en/books
    }
  },

  build: {
    inlineStylesheets: 'auto'
  },

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['crypto', 'stream', 'util', 'buffer']
    }
  },

  integrations: [react(), sitemap()]
});