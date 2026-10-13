import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development React calls this proxy, not WAMP directly. This
// keeps Drupal's session cookie same-origin and avoids browser CORS blocking.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/drupal-backend': {
        // WAMP is more stable through IPv4 than the localhost IPv6 alias.
        target: 'http://127.0.0.1',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
        rewrite: path => path.replace(/^\/drupal-backend/, '/drupal_test/web'),
        cookiePathRewrite: '/',
      },
    },
  },
});
