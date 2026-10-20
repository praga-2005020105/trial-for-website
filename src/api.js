/**
 * @license
 * MY STICKERZ ENSEIGNE — API Handler & Security Endpoints
 * Integrates Rate Limiting, RBAC, Sanitization, and Secure Checkout
 */

import {
  adminUsers,
  customerUsers,
  hashPassword,
  createSession,
  getSession,
  revokeSession,
  verifyPassword,
  strictFormRateLimiter,
  sanitizePayload,
  detectSqlInjection,
  detectXss,
  applySecurityHeaders,
  isExposedFile,
  orderDatabase,
  auditLogs,
  logSecurityEvent,
  runSecurityAudit,
  getAuthToken
} from "./security.js";

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === "object") {
      return resolve(req.body);
    }
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      // Protect against gigantic payloads (Max 2MB)
      if (data.length > 2 * 1024 * 1024) {
        req.destroy();
        resolve(null);
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  applySecurityHeaders(res);
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res) {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  const isGetOrHead = method === "GET" || method === "HEAD";

  // 1. Guard against direct requests to sensitive/exposed files
  if (isExposedFile(pathname)) {
    logSecurityEvent("EXPOSED_FILE_ACCESS_BLOCKED", `Blocked direct request to ${pathname}`, "WARNING");
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    return res.end("403 Forbidden: Access to system configuration files is denied.");
  }

  // 2. Health check
  if (pathname === "/api/health" && isGetOrHead) {
    return sendJson(res, 200, {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      security: "PROTECTED_ACTIVE"
    });
  }

  // 3. Public Security Audit endpoint
  if (pathname === "/api/security/audit" && isGetOrHead) {
    const auditReport = runSecurityAudit();
    logSecurityEvent("SECURITY_AUDIT_RUN", "Full 12-point security audit executed", "INFO");
    return sendJson(res, 200, auditReport);
  }

  // 4. Admin Authentication: Login
  if (pathname === "/api/auth/login" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const body = await parseJsonBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      // Check for SQL injection attempts in email/username
      if (detectSqlInjection(email)) {
        logSecurityEvent("SQL_INJECTION_BLOCKED", `SQL injection detected in login attempt for: ${email}`, "CRITICAL");
        return sendJson(res, 400, { error: "Security violation: Malicious characters detected in email." });
      }

      const user = adminUsers.find((u) => u.email === email);
      if (!user) {
        logSecurityEvent("AUTH_FAIL", `Unknown admin email attempted: ${email}`, "WARNING");
        return sendJson(res, 401, { error: "Invalid email or password" });
      }

      const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!isValid) {
        logSecurityEvent("AUTH_FAIL", `Failed password verification for: ${email}`, "WARNING");
        return sendJson(res, 401, { error: "Invalid email or password" });
      }

      const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
      const session = createSession(user, ip);
      logSecurityEvent("AUTH_SUCCESS", `Admin user ${user.email} authenticated successfully`, "INFO");

      res.setHeader("Set-Cookie", `mse_auth_token=${session.token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
      return sendJson(res, 200, {
        success: true,
        token: session.token,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    });
  }

  // 5. Admin Authentication: Logout
  if (pathname === "/api/auth/logout" && method === "POST") {
    const token = getAuthToken(req);
    revokeSession(token);
    res.setHeader("Set-Cookie", `mse_auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
    return sendJson(res, 200, { success: true, message: "Logged out successfully" });
  }

  // 5b. Customer Sign Up
  if (pathname === "/api/auth/customer/signup" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const body = await parseJsonBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const fullName = String(body.fullName || "").trim();
      const phone = String(body.phone || "").trim();

      if (!fullName || fullName.length < 2) {
        return sendJson(res, 400, { error: "Full name must be at least 2 characters." });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || detectSqlInjection(email)) {
        return sendJson(res, 400, { error: "Please provide a valid email address." });
      }

      // Password rules: min 8, uppercase, number, special char
      if (
        password.length < 8 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
      ) {
        return sendJson(res, 400, {
          error: "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special symbol."
        });
      }

      const existing = customerUsers.find((u) => u.email === email);
      if (existing) {
        return sendJson(res, 409, { error: "This email address is already registered. Please sign in." });
      }

      const { hash, salt } = hashPassword(password);
      const newCustomer = {
        id: "cust-" + Date.now().toString(36),
        email,
        name: fullName,
        phone,
        role: "customer",
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date().toISOString()
      };
      customerUsers.push(newCustomer);

      const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
      const session = createSession(newCustomer, ip, 30 * 24 * 60 * 60 * 1000);
      logSecurityEvent("CUSTOMER_SIGNUP", `New customer registered: ${email}`, "INFO");

      return sendJson(res, 201, {
        success: true,
        message: "Account created successfully!",
        user: { id: newCustomer.id, email: newCustomer.email, fullName: newCustomer.name, phone: newCustomer.phone, role: newCustomer.role },
        session
      });
    });
  }

  // 5c. Customer Log In
  if (pathname === "/api/auth/customer/login" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const body = await parseJsonBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const rememberMe = Boolean(body.rememberMe);

      if (detectSqlInjection(email)) {
        logSecurityEvent("SQL_INJECTION_BLOCKED", `Malicious login attempt for: ${email}`, "CRITICAL");
        return sendJson(res, 400, { error: "Invalid credentials format." });
      }

      const customer = customerUsers.find((u) => u.email === email);
      if (!customer) {
        logSecurityEvent("CUSTOMER_AUTH_FAIL", `Unknown customer login attempt: ${email}`, "WARNING");
        return sendJson(res, 401, { error: "Invalid email or password." });
      }

      const isValid = verifyPassword(password, customer.passwordHash, customer.passwordSalt);
      if (!isValid) {
        logSecurityEvent("CUSTOMER_AUTH_FAIL", `Invalid password for customer: ${email}`, "WARNING");
        return sendJson(res, 401, { error: "Invalid email or password." });
      }

      const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
      const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      const session = createSession(customer, ip, duration);
      logSecurityEvent("CUSTOMER_AUTH_SUCCESS", `Customer ${customer.email} signed in`, "INFO");

      return sendJson(res, 200, {
        success: true,
        user: { id: customer.id, email: customer.email, fullName: customer.name, phone: customer.phone, role: customer.role },
        session
      });
    });
  }

  // 5d. Customer OAuth Handler (Google, GitHub, Apple)
  if (pathname === "/api/auth/customer/oauth" && method === "POST") {
    const body = await parseJsonBody(req);
    const provider = String(body.provider || "google").toLowerCase();
    const mockEmail = `client.${provider}@mystickerzenseigne.com`;

    let customer = customerUsers.find((u) => u.email === mockEmail);
    if (!customer) {
      customer = {
        id: `cust-oauth-${provider}-${Date.now().toString(36)}`,
        email: mockEmail,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Verified Client`,
        role: "customer",
        phone: "",
        createdAt: new Date().toISOString()
      };
      customerUsers.push(customer);
    }

    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
    const session = createSession(customer, ip, 30 * 24 * 60 * 60 * 1000);
    logSecurityEvent("OAUTH_AUTH_SUCCESS", `Customer logged in via ${provider}: ${customer.email}`, "INFO");

    return sendJson(res, 200, {
      success: true,
      user: { id: customer.id, email: customer.email, fullName: customer.name, role: customer.role },
      session
    });
  }

  // 5e. Customer Forgot Password
  if (pathname === "/api/auth/customer/forgot-password" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const body = await parseJsonBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      logSecurityEvent("PASSWORD_RESET_DISPATCH", `Password reset requested for: ${email}`, "INFO");
      return sendJson(res, 200, {
        success: true,
        message: `If an account exists for ${email}, recovery instructions have been sent.`
      });
    });
  }

  // 5f. Customer Logout
  if (pathname === "/api/auth/customer/logout" && method === "POST") {
    const token = getAuthToken(req);
    revokeSession(token);
    return sendJson(res, 200, { success: true, message: "Logged out successfully" });
  }

  // 6. Current User Session Check
  if (pathname === "/api/auth/me" && method === "GET") {
    const token = getAuthToken(req);
    const session = getSession(token);
    if (!session) {
      return sendJson(res, 401, { authenticated: false });
    }
    return sendJson(res, 200, { authenticated: true, session });
  }

  // 7. Protected Admin Orders Endpoint
  if (pathname === "/api/admin/orders" && method === "GET") {
    const token = getAuthToken(req);
    const session = getSession(token);
    if (!session || session.role !== "admin") {
      logSecurityEvent("UNAUTHORIZED_ADMIN_ACCESS", `Unauthorized attempt to fetch admin orders from IP: ${req.socket?.remoteAddress}`, "WARNING");
      return sendJson(res, 401, { error: "Admin authorization required" });
    }
    return sendJson(res, 200, { orders: orderDatabase, total: orderDatabase.length });
  }

  // 8. Protected Admin Update Order Status
  if (pathname.startsWith("/api/admin/orders/") && pathname.endsWith("/status") && method === "POST") {
    const token = getAuthToken(req);
    const session = getSession(token);
    if (!session || session.role !== "admin") {
      return sendJson(res, 401, { error: "Admin authorization required" });
    }
    const orderNum = pathname.split("/")[4];
    const body = await parseJsonBody(req);
    const order = orderDatabase.find((o) => o.orderNumber === orderNum);
    if (!order) {
      return sendJson(res, 404, { error: "Order not found" });
    }
    order.status = sanitizePayload(body.status) || order.status;
    logSecurityEvent("ORDER_STATUS_UPDATE", `Order ${orderNum} status changed to ${order.status}`, "INFO");
    return sendJson(res, 200, { success: true, order });
  }

  // 9. Protected Admin Audit Logs Endpoint
  if (pathname === "/api/admin/logs" && method === "GET") {
    const token = getAuthToken(req);
    const session = getSession(token);
    if (!session || session.role !== "admin") {
      return sendJson(res, 401, { error: "Admin authorization required" });
    }
    return sendJson(res, 200, { logs: auditLogs });
  }

  // 10. Contact Form with Sanitization & Anti-Injection
  if (pathname === "/api/contact" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const rawBody = await parseJsonBody(req);
      const cleanBody = sanitizePayload(rawBody);

      // Verify no malicious injection payloads
      if (detectSqlInjection(JSON.stringify(rawBody)) || detectXss(JSON.stringify(rawBody))) {
        logSecurityEvent("MALICIOUS_INPUT_BLOCKED", "SQL or XSS payload blocked on /api/contact", "CRITICAL");
        return sendJson(res, 400, { error: "Security Alert: Form contains potentially malicious characters." });
      }

      logSecurityEvent("CONTACT_RECEIVED", `Message received from ${cleanBody.email || "client"}`, "INFO");
      return sendJson(res, 200, {
        success: true,
        message: "Your message has been securely submitted. Our workshop will reply shortly."
      });
    });
  }

  // 11. Newsletter Subscription
  if (pathname === "/api/newsletter" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const rawBody = await parseJsonBody(req);
      const email = sanitizePayload(rawBody.email);
      if (!email || !email.includes("@")) {
        return sendJson(res, 400, { error: "Invalid email address" });
      }
      logSecurityEvent("NEWSLETTER_SUBSCRIPTION", `Subscribed: ${email}`, "INFO");
      return sendJson(res, 200, { success: true, message: "Subscribed successfully!" });
    });
  }

  // 12. Checkout Order Processing with Diagnostics (Supports Payment Failure Simulation)
  if (pathname === "/api/checkout/process" && method === "POST") {
    return strictFormRateLimiter(req, res, async () => {
      const rawOrder = await parseJsonBody(req);
      const order = sanitizePayload(rawOrder);

      // Check card number or simulator trigger for failure testing
      const rawCard = String(rawOrder.cardNumber || "").replace(/\s+/g, "");
      const isFailedTrigger =
        rawCard === "4000000000000002" ||
        rawCard.endsWith("0002") ||
        rawOrder.simulateFailure === true ||
        rawOrder.paymentStatus === "fail";

      if (isFailedTrigger) {
        logSecurityEvent("PAYMENT_FAILED_SIMULATED", `Payment declined for order from ${order.customer?.email || "customer"}`, "WARNING");
        return sendJson(res, 402, {
          success: false,
          error: "Payment Authorization Failed: Your bank declined the transaction. Check card details or use alternative payment.",
          reason: "INSUFFICIENT_FUNDS_OR_CARD_DECLINED",
          redirectUrl: "payment-failed.html"
        });
      }

      // Valid order recorded securely
      const orderNum = order.orderNumber || "MSE-" + Date.now().toString().slice(-8);
      const newOrder = {
        orderNumber: orderNum,
        customer: order.customer || {},
        items: order.items || [],
        subtotal: order.subtotal || 0,
        shipping: order.shipping || 15,
        total: order.total || 0,
        payment: order.payment || "card",
        status: "Pending BAT",
        date: new Date().toISOString()
      };

      orderDatabase.unshift(newOrder);
      logSecurityEvent("ORDER_PLACED", `New order recorded: ${orderNum} (${formatCurrency(newOrder.total)})`, "INFO");

      return sendJson(res, 200, {
        success: true,
        orderNumber: orderNum,
        redirectUrl: "success.html"
      });
    });
  }

  // Default: Not Found
  return sendJson(res, 404, { error: "API endpoint not found" });
}

function formatCurrency(num) {
  return "€" + Number(num || 0).toFixed(2);
}
