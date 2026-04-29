import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5190,
      proxy: {
        '/api.php': {
          target: 'https://duomiapi.com', // fallback target
          changeOrigin: true,
          secure: false,
          router: (req) => {
            const targetUrl = req.headers['x-target-url'];
            if (targetUrl && typeof targetUrl === 'string') {
              try {
                const url = new URL(targetUrl);
                return url.origin;
              } catch (e) {}
            }
            return 'https://duomiapi.com';
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const targetUrl = req.headers['x-target-url'];
              if (targetUrl && typeof targetUrl === 'string') {
                try {
                  const url = new URL(targetUrl);
                  proxyReq.path = url.pathname + url.search;
                } catch (e) {}
              }

              if (env.API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${env.API_KEY}`);
              }
              proxyReq.removeHeader('x-target-url');
            });
          }
        }
      }
    }
  };
});
