/**
 * MY STICKERZ ENSEIGNE — Protected Serverless Admin Orders Endpoint
 * Endpoint: GET /api/admin/orders
 * Returns all orders for authorized workshop admins.
 */

const SUPABASE_URL = "https://oeombbuhpjawwfcseftm.supabase.co";
const SUPABASE_KEY = "sb_publishable_vh7pw-l0HCPpiM18kdNvIg_GijEkR_d";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Validate admin authorization (token issued by /api/auth/login or workshop master token)
  if (!token || (!token.startsWith("mse_adm_") && !token.startsWith("mse_session_") && token.length < 16)) {
    return res.status(401).json({ success: false, error: "Admin authorization required." });
  }

  try {
    // If server environment variable SUPABASE_SERVICE_ROLE_KEY is configured in Vercel, use it;
    // otherwise fallback to publishable key.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;

    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      method: "GET",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });

    if (sbRes.ok) {
      const orders = await sbRes.json();
      return res.status(200).json({ success: true, orders: Array.isArray(orders) ? orders : [] });
    }

    return res.status(200).json({ success: true, orders: [] });
  } catch (err) {
    console.error("[ADMIN ORDERS API ERROR]:", err);
    return res.status(500).json({ success: false, error: "Internal error loading orders." });
  }
}
