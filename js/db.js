/**
 * MY STICKERZ ENSEIGNE — Supabase Database Client
 * Handles real-time cloud storage for Orders, Contact Inquiries, and Newsletter.
 * Endpoint: https://oeombbuhpjawwfcseftm.supabase.co
 */

const SUPABASE_URL = "https://oeombbuhpjawwfcseftm.supabase.co";
const SUPABASE_KEY = "sb_publishable_vh7pw-l0HCPpiM18kdNvIg_GijEkR_d";

const DB = {
    /**
     * Save customer order directly to Supabase cloud database & client backup store
     */
    async saveOrder(order) {
        if (!order) return null;
        const normalizedEmail = ((order.customer && order.customer.email) || "").trim().toLowerCase();
        const orderNumber = order.orderNumber || order.order_number || ("ORD-" + Date.now().toString(36).toUpperCase());
        const createdAt = order.date || order.created_at || new Date().toISOString();

        const payload = {
            order_number: orderNumber,
            customer: {
                ...(order.customer || {}),
                email: normalizedEmail
            },
            items: order.items || [],
            subtotal: Number(order.subtotal || 0),
            shipping: Number(order.shipping || 0),
            total: Number(order.total || 0),
            payment_method: order.payment || order.payment_method || "standard",
            status: order.status || "Pending BAT",
            created_at: createdAt
        };

        // 1. Immediately persist to client backup store (guarantees order never disappears)
        try {
            const localOrders = JSON.parse(localStorage.getItem("mse_all_orders") || "[]");
            const idx = localOrders.findIndex(o => (o.order_number || o.orderNumber) === orderNumber);
            if (idx === -1) {
                localOrders.unshift(payload);
            } else {
                localOrders[idx] = payload;
            }
            localStorage.setItem("mse_all_orders", JSON.stringify(localOrders));
        } catch (e) {
            console.warn("[DB] Local backup write warning:", e);
        }

        // 2. Persist to Supabase cloud database
        try {
            const customerSession = this.getCurrentCustomer();
            const authBearer = (customerSession && customerSession.token) ? customerSession.token : SUPABASE_KEY;

            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${authBearer}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.warn("[DB] Orders table insert warning:", res.status, errText);
            }
            return payload;
        } catch (err) {
            console.warn("[DB] Network error saving order to Supabase:", err);
            return payload;
        }
    },

    /**
     * Fetch all active orders for the Admin Portal (Supabase + local store backup)
     */
    async getOrders() {
        let remoteOrders = [];
        try {
            // Check if admin is signed into Supabase or local session
            const adminSessionRaw = localStorage.getItem("mse_admin_session");
            let adminToken = SUPABASE_KEY;
            try {
                if (adminSessionRaw) {
                    const parsed = JSON.parse(adminSessionRaw);
                    if (parsed.token) adminToken = parsed.token;
                }
            } catch (e) {}

            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${adminToken}`
                }
            });

            if (res.ok) {
                remoteOrders = await res.json();
            } else {
                console.warn("[DB] Get orders warning, status:", res.status);
            }
        } catch (err) {
            console.warn("[DB] Network error loading orders from Supabase:", err);
        }

        // Merge with client store backup
        let localOrders = [];
        try {
            localOrders = JSON.parse(localStorage.getItem("mse_all_orders") || "[]");
        } catch (e) {}

        const merged = Array.isArray(remoteOrders) ? [...remoteOrders] : [];
        if (Array.isArray(localOrders)) {
            localOrders.forEach(lo => {
                const num = lo.order_number || lo.orderNumber;
                if (!merged.some(m => (m.order_number || m.orderNumber) === num)) {
                    merged.push(lo);
                }
            });
        }

        merged.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
        return merged;
    },

    /**
     * Update an order's status (Pending BAT, BAT Validated, Production, Shipped, Delivered)
     */
    async updateOrderStatus(orderNumber, newStatus) {
        // Update local backup
        try {
            const localOrders = JSON.parse(localStorage.getItem("mse_all_orders") || "[]");
            const target = localOrders.find(o => (o.order_number || o.orderNumber) === orderNumber);
            if (target) {
                target.status = newStatus;
                localStorage.setItem("mse_all_orders", JSON.stringify(localOrders));
            }
        } catch (e) {}

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}`, {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                console.warn("[DB] Update status warning:", res.status);
                return null;
            }
            return { success: true };
        } catch (err) {
            console.warn("[DB] Error updating status in Supabase:", err);
            return null;
        }
    },

    /**
     * Backup contact form message into Supabase
     */
    async saveContactMessage(msg) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify(msg)
            });
            return res.ok;
        } catch (err) {
            console.warn("[DB] Error saving contact message:", err);
            return false;
        }
    },

    /**
     * Backup newsletter subscription email into Supabase
     */
    async saveNewsletterSubscriber(email) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/newsletter_subscribers`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({ email })
            });
            return res.ok;
        } catch (err) {
            console.warn("[DB] Error saving newsletter subscriber:", err);
            return false;
        }
    },

    /**
     * Customer Sign Up with Supabase Auth
     */
    async customerSignUp(email, password, metadata = {}) {
        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: metadata
                })
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.msg || data.error_description || "Signup failed." };
            }
            return { success: true, data };
        } catch (err) {
            return { success: false, error: "Network error during registration." };
        }
    },

    /**
     * Customer Sign In with Supabase Auth
     */
    async customerSignIn(email, password) {
        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                if (data.error_code === "email_not_confirmed") {
                    return {
                        success: false,
                        error: "Email not confirmed. Please check your inbox for the activation link, or sign in directly.",
                        code: "email_not_confirmed"
                    };
                }
                return { success: false, error: data.error_description || data.msg || "Invalid email or password." };
            }

            const userSession = {
                token: data.access_token,
                refreshToken: data.refresh_token,
                user: data.user,
                email: data.user.email,
                name: (data.user.user_metadata && data.user.user_metadata.full_name) || data.user.email.split("@")[0],
                phone: (data.user.user_metadata && data.user.user_metadata.phone) || ""
            };
            localStorage.setItem("mse_customer_session", JSON.stringify(userSession));
            return { success: true, session: userSession };
        } catch (err) {
            return { success: false, error: "Network error during authentication." };
        }
    },

    /**
     * Customer Sign Out
     */
    customerSignOut() {
        localStorage.removeItem("mse_customer_session");
    },

    /**
     * Get Current Logged-in Customer
     */
    getCurrentCustomer() {
        try {
            const sessionRaw = localStorage.getItem("mse_customer_session");
            return sessionRaw ? JSON.parse(sessionRaw) : null;
        } catch {
            return null;
        }
    },

    /**
     * Get Orders For Logged-in Customer (Supabase + client store backup)
     */
    async getCustomerOrders(email) {
        if (!email) return [];
        const cleanEmail = email.trim().toLowerCase();
        let remoteOrders = [];

        try {
            const customerSession = this.getCurrentCustomer();
            const authBearer = (customerSession && customerSession.token) ? customerSession.token : SUPABASE_KEY;

            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?customer->>email=ilike.${encodeURIComponent(cleanEmail)}&order=created_at.desc`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${authBearer}`
                }
            });
            if (res.ok) {
                remoteOrders = await res.json();
            }
        } catch (err) {
            console.warn("[DB] Error fetching customer orders from Supabase:", err);
        }

        // Merge with client store backup
        let localOrders = [];
        try {
            localOrders = JSON.parse(localStorage.getItem("mse_all_orders") || "[]");
        } catch (e) {}

        const merged = Array.isArray(remoteOrders) ? [...remoteOrders] : [];
        if (Array.isArray(localOrders)) {
            localOrders.forEach(lo => {
                const custEmail = ((lo.customer && lo.customer.email) || "").trim().toLowerCase();
                if (custEmail === cleanEmail) {
                    const num = lo.order_number || lo.orderNumber;
                    if (!merged.some(m => (m.order_number || m.orderNumber) === num)) {
                        merged.push(lo);
                    }
                }
            });
        }

        // Also check if last order in session matches this customer
        try {
            const lastOrder = JSON.parse(localStorage.getItem("veloraLastOrder") || "null");
            if (lastOrder && lastOrder.customer) {
                const lastEmail = (lastOrder.customer.email || "").trim().toLowerCase();
                if (lastEmail === cleanEmail) {
                    const num = lastOrder.orderNumber || lastOrder.order_number;
                    if (!merged.some(m => (m.order_number || m.orderNumber) === num)) {
                        merged.unshift(lastOrder);
                    }
                }
            }
        } catch (e) {}

        merged.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0));
        return merged;
    },

    /**
     * Trigger Single-Use Secure Password Reset via Supabase Auth
     */
    async sendPasswordReset(email) {
        if (!email) return { success: false, error: "Please enter a valid email address." };
        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                return { success: false, error: data.msg || data.error_description || "Could not send reset instructions." };
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: "Network error sending reset link." };
        }
    },

    /**
     * Trigger Real Supabase OAuth Login (Google, GitHub, Apple)
     */
    signInWithOAuth(provider = "google") {
        const redirectUrl = `${window.location.origin}/login.html`;
        const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${encodeURIComponent(redirectUrl)}`;
        window.location.href = authUrl;
    },

    /**
     * Handle OAuth Callback from Hash on Login Page Load
     */
    async handleOAuthCallback() {
        // 1. Check for errors in URL (search or hash)
        const searchParams = new URLSearchParams(window.location.search);
        const hashStr = window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash;
        const hashParams = new URLSearchParams(hashStr);

        const errorDesc = hashParams.get("error_description") || searchParams.get("error_description");
        const error = hashParams.get("error") || searchParams.get("error");
        if (error || errorDesc) {
            return {
                success: false,
                error: decodeURIComponent(errorDesc || error || "OAuth authorization failed.")
            };
        }

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (!accessToken) return null;

        try {
            const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            if (!res.ok) {
                return { success: false, error: "Failed to retrieve authenticated user profile from Supabase." };
            }

            const user = await res.json();
            const meta = user.user_metadata || {};
            const userSession = {
                token: accessToken,
                refreshToken: refreshToken,
                user: user,
                email: user.email,
                name: meta.full_name || meta.name || user.email.split("@")[0],
                avatar: meta.avatar_url || meta.picture || "",
                provider: user.app_metadata?.provider || "oauth"
            };

            localStorage.setItem("mse_customer_session", JSON.stringify(userSession));

            // Clean hash to avoid keeping tokens in browser URL bar
            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, "", window.location.pathname);
            }

            return { success: true, session: userSession };
        } catch (err) {
            console.warn("[DB] OAuth session error:", err);
            return { success: false, error: "Network error establishing session." };
        }
    }
};

window.DB = DB;
