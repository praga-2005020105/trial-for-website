import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vite';
import {
  globalRateLimiter,
  applySecurityHeaders,
  isExposedFile
} from './src/security.js';
import { handleApiRequest } from './src/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'enterprise-security-and-api',
        configureServer(server) {
          // 1. Apply Security Headers
          server.middlewares.use((req, res, next) => {
            applySecurityHeaders(res);
            next();
          });

          // 2. Anti-Crash Global Rate Limiter
          server.middlewares.use(globalRateLimiter);

          // 3. Block Direct Access to Exposed Configuration Files
          server.middlewares.use((req, res, next) => {
            const url = new URL(req.url || '/', 'http://localhost');
            if (isExposedFile(url.pathname)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'text/plain');
              return res.end('403 Forbidden: Access to sensitive file is prohibited.');
            }
            next();
          });

          // 4. API Endpoints Middleware
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url || '/', 'http://localhost');
            if (url.pathname.startsWith('/api/')) {
              try {
                await handleApiRequest(req, res);
              } catch (err) {
                console.error('[API Error in Dev Server]:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          products: path.resolve(__dirname, 'products.html'),
          product: path.resolve(__dirname, 'product.html'),
          cart: path.resolve(__dirname, 'cart.html'),
          checkout: path.resolve(__dirname, 'checkout.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          wishlist: path.resolve(__dirname, 'wishlist.html'),
          shipping: path.resolve(__dirname, 'shipping.html'),
          returns: path.resolve(__dirname, 'returns.html'),
          terms: path.resolve(__dirname, 'terms.html'),
          success: path.resolve(__dirname, 'success.html'),
          cookies: path.resolve(__dirname, 'cookies.html'),
          paymentFailed: path.resolve(__dirname, 'payment-failed.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          neonBuilder: path.resolve(__dirname, 'neon-builder.html'),
          login: path.resolve(__dirname, 'login.html'),
          signup: path.resolve(__dirname, 'signup.html')
        }
      }
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
