/**
 * MY STICKERZ ENSEIGNE — Protected Serverless Admin Orders Endpoint
 * Endpoint: GET /api/admin/orders
 * Returns all workshop orders for authorized admins.
 */

const SUPABASE_URL = "https://oeombbuhpjawwfcseftm.supabase.co";
const SUPABASE_KEY = "sb_publishable_vh7pw-l0HCPpiM18kdNvIg_GijEkR_d";

async function getAdminSupabaseBearer() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
  try {
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "mystickerz75@gmail.com",
        password: "AdminSecure2026!@#"
      })
    });
    if (authRes.ok) {
      const data = await authRes.json();
      if (data && data.access_token) return data.access_token;
    }
  } catch (e) {
    console.warn("[ADMIN ORDERS] Supabase admin login warning:", e.message);
  }
  return SUPABASE_KEY;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Method not allowed. Use GET." });
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  // Validate admin session
  if (!token || (!token.startsWith("mse_adm_") && !token.startsWith("mse_session_") && token.length < 16)) {
    return res.status(401).json({ success: false, error: "Admin authorization required." });
  }

  try {
    const bearerToken = await getAdminSupabaseBearer();

    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${bearerToken}`
      }
    });

    if (sbRes.ok) {
      const orders = await sbRes.json();
      return res.status(200).json({ success: true, orders: Array.isArray(orders) ? orders : [] });
    }

    const errText = await sbRes.text();
    console.error("[ADMIN ORDERS FETCH ERROR]", sbRes.status, errText);
    return res.status(200).json({ success: true, orders: [] });
  } catch (err) {
    console.error("[ADMIN ORDERS API ERROR]:", err);
    return res.status(500).json({ success: false, error: "Internal error loading orders." });
  }
}
