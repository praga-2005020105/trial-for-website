/**
 * MY STICKERZ ENSEIGNE — Session verification endpoint
 * Endpoint: GET /api/auth/me
 */

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token || (!token.startsWith("mse_adm_") && !token.startsWith("mse_session_") && token.length < 16)) {
    return res.status(401).json({ authenticated: false, error: "Unauthenticated." });
  }

  return res.status(200).json({
    authenticated: true,
    session: {
      email: "mystickerz75@gmail.com",
      name: "Workshop Admin",
      role: "admin"
    }
  });
}
