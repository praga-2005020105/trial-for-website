/**
 * MY STICKERZ ENSEIGNE — Production Admin Authentication Serverless Handler
 * Endpoint: POST /api/auth/login
 */

import crypto from "crypto";

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256").toString("hex");
}

const SALT = "0e7c2f8194b3a4d8e5f60123456789ab";
const MASTER_HASH = hashPassword("AdminSecure2026!@#", SALT);

const ADMIN_ACCOUNTS = [
  {
    email: "mystickerz75@gmail.com",
    name: "Master Workshop Admin",
    role: "admin",
    salt: SALT,
    hash: MASTER_HASH
  },
  {
    email: "admin@mystickerzenseigne.com",
    name: "Workshop Admin",
    role: "admin",
    salt: SALT,
    hash: MASTER_HASH
  }
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const admin = ADMIN_ACCOUNTS.find(a => a.email.toLowerCase() === cleanEmail);
    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid admin email or password." });
    }

    const computedHash = hashPassword(cleanPassword, admin.salt);
    const hashBuf = Buffer.from(computedHash, "hex");
    const targetBuf = Buffer.from(admin.hash, "hex");

    if (hashBuf.length !== targetBuf.length || !crypto.timingSafeEqual(hashBuf, targetBuf)) {
      return res.status(401).json({ success: false, error: "Invalid admin email or password." });
    }

    // Generate secure session token
    const token = "mse_adm_" + crypto.randomBytes(32).toString("hex");

    return res.status(200).json({
      success: true,
      token,
      user: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (err) {
    console.error("[ADMIN AUTH ERROR]:", err);
    return res.status(500).json({ success: false, error: "Internal server error during authentication." });
  }
}
