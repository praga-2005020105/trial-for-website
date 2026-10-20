/**
 * MY STICKERZ ENSEIGNE — Supabase Database Client
 * Handles real-time cloud storage for Orders, Contact Inquiries, and Newsletter.
 * Endpoint: https://oeombbuhpjawwfcseftm.supabase.co
 */

const SUPABASE_URL = "https://oeombbuhpjawwfcseftm.supabase.co";
const SUPABASE_KEY = "sb_publishable_vh7pw-l0HCPpiM18kdNvIg_GijEkR_d";

const DB = {
    /**
     * Save customer order directly to Supabase cloud database
     */
    async saveOrder(order) {
        try {
            const payload = {
                order_number: order.orderNumber,
                customer: order.customer || {},
                items: order.items || [],
                subtotal: Number(order.subtotal || 0),
                shipping: Number(order.shipping || 0),
                total: Number(order.total || 0),
                payment_method: order.payment || "standard",
                status: order.status || "Pending BAT"
            };

            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.warn("[DB] Orders table insert warning:", errText);
                return null;
            }
            return await res.json();
        } catch (err) {
            console.warn("[DB] Network error saving order to Supabase:", err);
            return null;
        }
    },

    /**
     * Fetch all active orders for the Admin Portal
     */
    async getOrders() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!res.ok) {
                console.warn("[DB] Get orders warning, status:", res.status);
                return null;
            }
            return await res.json();
        } catch (err) {
            console.warn("[DB] Network error loading orders from Supabase:", err);
            return null;
        }
    },

    /**
     * Update an order's status (Pending BAT, BAT Validated, Production, Shipped, Delivered)
     */
    async updateOrderStatus(orderNumber, newStatus) {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(orderNumber)}`, {
                method: "PATCH",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                console.warn("[DB] Update status warning:", res.status);
                return null;
            }
            return await res.json();
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
     * Get Orders For Logged-in Customer from Supabase
     */
    async getCustomerOrders(email) {
        if (!email) return [];
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?customer->>email=eq.${encodeURIComponent(email)}&order=created_at.desc`, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.warn("[DB] Error fetching customer orders:", err);
            return [];
        }
    }
};

window.DB = DB;
