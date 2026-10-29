/**
 * @license
 * MY STICKERZ ENSEIGNE — Production Express Server with Enterprise Security
 * Features: Rate Limiting, Security Headers, RBAC, File Protection, Turn-off Debug Mode
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  globalRateLimiter,
  applySecurityHeaders,
  isExposedFile,
  runSecurityAudit
} from "./src/security.js";
import { handleApiRequest } from "./src/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Turn off Express fingerprinting
app.disable("x-powered-by");

// CORS Origin Lockdown: Whitelist legitimate domains only
const allowedOrigins = [
  "https://mystickerzenseigne.com",
  "https://mystickerzenseigne.netlify.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: Blocked by origin lockdown security policy."));
    }
  },
  credentials: true
}));

// 1. Security Headers Middleware (CSP, HSTS, X-Frame-Options, Nosniff, etc.)
app.use((req, res, next) => {
  applySecurityHeaders(res);
  next();
});

// 2. Global Anti-Crash & Rate Limiting Middleware
app.use(globalRateLimiter);

// 3. Block Direct Access to Sensitive / Configuration Files
app.use((req, res, next) => {
  if (isExposedFile(req.path)) {
    return res.status(403).type("text/plain").send("403 Forbidden: Access denied.");
  }
  next();
});

// 4. API Endpoints Handler
app.all("/api/*", (req, res) => {
  handleApiRequest(req, res);
});

// 5. Serve Static Assets (HTML, CSS, JS, Images, Data)
app.use(express.static(__dirname, {
  dotfiles: "ignore",
  maxAge: "1d",
  setHeaders: (res, path) => {
    applySecurityHeaders(res);
  }
}));

// 6. Clean Page Routes
const routes = {
  "/": "index.html",
  "/products": "products.html",
  "/product": "product.html",
  "/cart": "cart.html",
  "/checkout": "checkout.html",
  "/wishlist": "wishlist.html",
  "/contact": "contact.html",
  "/success": "success.html",
  "/shipping": "shipping.html",
  "/returns": "returns.html",
  "/terms": "terms.html",
  "/cookies": "cookies.html",
  "/payment-failed": "payment-failed.html",
  "/admin": "admin.html",
  "/login": "login.html",
  "/signup": "signup.html",
  "/dashboard": "login.html",
  "/account": "login.html",
  "/neon-builder": "neon-builder.html"
};

for (const [routePath, filename] of Object.entries(routes)) {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(__dirname, filename));
  });
}

// 7. Clean 404 Fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

// 8. Turn Off Debug Mode: Production Error Handler (Suppress stack traces)
app.use((err, req, res, next) => {
  console.error("[SECURITY LOG] Internal Server Incident:", err.message);
  res.status(500).json({
    error: "A secure server error occurred. Request logged for security review.",
    status: 500
  });
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`  🛡️  MY STICKERZ ENSEIGNE — SECURE PRODUCTION SERVER ACTIVE`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Rate Limiter: Active (180 req/min general, 20/15min forms)`);
  console.log(`  Security Headers: CSP, HSTS, Nosniff, X-Frame SAMEORIGIN`);
  console.log(`  Debug Mode: OFF (Stack traces suppressed)`);
  console.log(`  Admin Routes: Protected with PBKDF2 + Cryptographic RBAC`);
  console.log(`=============================================================\n`);
});
