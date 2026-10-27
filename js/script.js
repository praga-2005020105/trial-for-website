document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =========================================================
       1. SCROLL REVEAL OBSERVER & NAVBAR STICKY EFFECT
    ========================================================= */

    const autoRevealSelectors = [
        ".section-header",
        ".trust-item",
        ".category-card",
        ".product-card",
        ".shop-product",
        ".about-text",
        ".about-image",
        ".review",
        ".policy-card",
        ".policy-step"
    ];

    autoRevealSelectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el, index) {
            if (el && !el.classList.contains("reveal")) {
                el.classList.add("reveal");
                if (index % 4 === 1) el.classList.add("delay-100");
                if (index % 4 === 2) el.classList.add("delay-200");
                if (index % 4 === 3) el.classList.add("delay-300");
            }
        });
    });

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && entry.target) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: "0px 0px -50px 0px", threshold: 0.12 });

        document.querySelectorAll(".reveal").forEach(function (el) {
            if (el) revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll(".reveal").forEach(function (el) {
            if (el) el.classList.add("active");
        });
    }

    const navbar = document.querySelector(".navbar");
    if (navbar) {
        window.addEventListener("scroll", function () {
            navbar.classList.toggle("scrolled", window.scrollY > 30);
        });
    }

    /* =========================================================
       2. STORAGE & LOCAL DATA MANAGEMENT
    ========================================================= */

    let cart = [];
    let wishlist = [];

    try {
        const storedCart = JSON.parse(localStorage.getItem("veloraCart"));
        if (Array.isArray(storedCart)) cart = storedCart;
    } catch (e) {
        cart = [];
    }

    try {
        const storedWishlist = JSON.parse(localStorage.getItem("veloraWishlist"));
        if (Array.isArray(storedWishlist)) wishlist = storedWishlist;
    } catch (e) {
        wishlist = [];
    }

    function saveCart() {
        localStorage.setItem("veloraCart", JSON.stringify(cart));
    }

    function saveWishlist() {
        localStorage.setItem("veloraWishlist", JSON.stringify(wishlist));
    }

    /* =========================================================
       3. STRING, SANITIZATION & CURRENCY HELPERS
    ========================================================= */

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function sanitizeInput(str) {
        if (typeof str !== "string") return str;
        return str
            .replace(/<[^>]*>/g, "")
            .replace(/javascript\s*:/gi, "")
            .replace(/on\w+\s*=/gi, "")
            .trim();
    }

    function slugify(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function formatPrice(value) {
        const num = Math.max(0, Number(value) || 0);
        const formatted = new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR"
        }).format(num);
        return `${formatted} HT`;
    }

    function getUrlProductId() {
        const params = new URLSearchParams(window.location.search);
        let id = params.get("id") || params.get("product") || "";
        id = String(id).trim().toLowerCase();
        if (id && productDatabase && productDatabase[id]) {
            try { localStorage.setItem("last_viewed_product", id); } catch (e) {}
            return id;
        }
        try {
            const saved = localStorage.getItem("last_viewed_product");
            if (saved && productDatabase && productDatabase[saved]) return saved;
        } catch (e) {}
        return "neon-signs";
    }

    /* =========================================================
       4. PRODUCT CATALOG
    ========================================================= */

    const productDatabase = {
        "neon-signs": {
            id: "neon-signs",
            name: { en: "Custom LED Neon Signs", fr: "Enseignes Néon LED" },
            price: 350,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/neon-signs.jpg",
            description: {
                en: "Custom neon signs designed for shops, businesses, events and interior spaces. High-output silicone LED flex on contour acrylic backboard.",
                fr: "Enseignes néon LED sur-mesure haute intensité pour commerces, événements et espaces intérieurs. Choisissez votre texte, vos couleurs et finitions pour un rendu lumineux unique."
            }
        },
        "adhesive-stickers": {
            id: "adhesive-stickers",
            name: { en: "Adhesive Stickers", fr: "Stickers Adhésifs" },
            price: 29,
            category: { en: "Print & Graphics", fr: "Impression & Stickers" },
            image: "images/adhesive-stickers.jpg",
            description: {
                en: "High-quality adhesive stickers for branding, promotions, windows, packaging and everyday business use.",
                fr: "Stickers adhésifs haute qualité pour vitrines, emballages, promotions et communication visuelle."
            }
        },
        "business-signs": {
            id: "business-signs",
            name: { en: "2D Flat Sign (PVC / Alu)", fr: "Enseigne 2D Plate (PVC / Alu)" },
            price: 100,
            category: { en: "Business Signage", fr: "Enseignes Magasin" },
            image: "images/business-signs.jpg",
            description: {
                en: "Professional 2D flat panel storefront signs made from durable PVC or composite aluminium with UV-resistant print or vinyl graphics.",
                fr: "Enseignes planes 2D économiques et durables pour magasins et commerces, usinées en panneau composite aluminium ou PVC expansé."
            }
        },
        "retractable-awnings": {
            id: "retractable-awnings",
            name: { en: "Retractable Awnings", fr: "Stores Bannes Rétractables" },
            price: 299,
            category: { en: "Outdoor Solutions", fr: "Solutions Extérieures" },
            image: "images/retractable-awnings.jpg",
            description: {
                en: "Retractable awnings designed for storefronts, terraces and outdoor commercial spaces.",
                fr: "Stores bannes rétractables pour vitrines de boutiques, terrasses et espaces professionnels extérieurs."
            }
        },
        "vehicle-wrapping": {
            id: "vehicle-wrapping",
            name: { en: "Vehicle Semi & Total Wrap", fr: "Covering Véhicule (Semi & Total)" },
            price: 750,
            category: { en: "Vehicle Graphics", fr: "Covering Véhicule" },
            image: "images/vehicle-wrapping.jpg",
            description: {
                en: "High-durability cast wrapping film for partial (50%) or complete (100%) commercial fleet vehicle branding and bodywork protection.",
                fr: "Habillage et covering professionnel pour flottes utilitaires et véhicules de société (semi-covering 50% ou total covering 100%)."
            }
        },
        "vehicle-lettering-graphics": {
            id: "vehicle-lettering-graphics",
            name: { en: "Commercial Vehicle Lettering", fr: "Marquage & Lettrage Véhicule" },
            price: 350,
            category: { en: "Vehicle Graphics", fr: "Covering Véhicule" },
            image: "images/vehicle-lettering.jpg",
            description: {
                en: "Custom precision computer-cut vinyl lettering, company logos and mandatory regulatory text (SIRET/phone) for utility vehicles.",
                fr: "Lettrage découpé et marquages graphiques sur-mesure pour camionnettes et véhicules professionnels."
            }
        },
        "suspended-ceilings": {
            id: "suspended-ceilings",
            name: { en: "Suspended Ceilings", fr: "Faux Plafonds Suspendus" },
            price: 399,
            category: { en: "Interior Solutions", fr: "Solutions Intérieures" },
            image: "images/suspended-ceilings.jpg",
            description: {
                en: "Suspended ceiling solutions for commercial and professional interiors.",
                fr: "Solutions de faux plafonds suspendus décoratifs et acoustiques pour commerces et bureaux."
            }
        },
        "acrylic-signs-displays": {
            id: "acrylic-signs-displays",
            name: { en: "Acrylic Signs & Displays", fr: "Plaques & Enseignes Plexiglas" },
            price: 129,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/acrylic-signs.jpg",
            description: {
                en: "Elegant acrylic signs and displays for reception areas, shops, offices and commercial spaces.",
                fr: "Plaques professionnelles et présentoirs en plexiglas élégants pour entrées et bureaux."
            }
        },
        "3d-raised-letters": {
            id: "3d-raised-letters",
            name: { en: "3D Raised Letters (Raw Relief)", fr: "Lettres Relief 3D (Brut)" },
            price: 180,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/3d-raised-letters.jpg",
            description: {
                en: "Premium three-dimensional raised lettering for professional storefronts and business interiors.",
                fr: "Lettres en relief 3D premium pour façades de magasins et décors d'entreprise."
            }
        },
        "lettres-3d-lumineuses": {
            id: "lettres-3d-lumineuses",
            name: { en: "Front-Lit 3D Channel Letters", fr: "Lettres 3D éclairées en façade" },
            price: 365,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/3d-raised-letters.jpg",
            description: {
                en: "Premium individual three-dimensional block letters with direct luminous Plexiglas face illumination and high-efficiency IP67 waterproof LED modules.",
                fr: "Lettres boîtiers individuelles en relief 3D avec face diffusante lumineuse en PMMA plexiglas et modules LED étanches haute luminosité."
            }
        },
        "lettres-3d-retro-halo": {
            id: "lettres-3d-retro-halo",
            name: { en: "Halo Backlit 3D Letters", fr: "Lettres 3D rétroéclairées (Halo)" },
            price: 390,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/3d-raised-letters.jpg",
            description: {
                en: "Prestige 3D letters mounted on offset standoffs projecting a soft, ambient halo glow onto the architectural facade wall.",
                fr: "Lettres relief 3D montées sur entretoises déportées créant un halo lumineux élégant et feutré sur la façade ou le mur d'accueil."
            }
        },
        "lettres-3d-lateral": {
            id: "lettres-3d-lateral",
            name: { en: "Side-Lit 3D Channel Letters", fr: "Lettres 3D éclairage latéral" },
            price: 390,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/3d-raised-letters.jpg",
            description: {
                en: "Contemporary 3D signage featuring side-edge luminous acrylic returns with opaque fronts for a high-contrast luxury architectural look.",
                fr: "Lettres boîtiers modernes avec chant lumineux en acrylique diffusant latéral et face opaque pour un rendu architectural contemporain."
            }
        },
        "lettres-3d-plateau-acp": {
            id: "lettres-3d-plateau-acp",
            name: { en: "3D Letters on ACP Tray", fr: "Lettres 3D sur plateau ACP" },
            price: 600,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/business-signs.jpg",
            description: {
                en: "Turnkey storefront signage combining folded aluminium composite cassette tray with 3D relief or illuminated letters pre-wired for seamless installation.",
                fr: "Enseigne complète prête à poser associant un caisson ou plateau aluminium composite plié et des lettres en relief 3D pré-câblées."
            }
        },
        "caisson-lumineux": {
            id: "caisson-lumineux",
            name: { en: "Illuminated LED Lightbox Sign", fr: "Caisson lumineux (Plexi + LED)" },
            price: 460,
            category: { en: "Business Signage", fr: "Enseignes Magasin" },
            image: "images/business-signs.jpg",
            description: {
                en: "Double or single-sided extruded aluminium lightbox with translucent opal acrylic face and uniform internal LED backlighting.",
                fr: "Caisson d'enseigne lumineux en profilé aluminium extrudé laqué avec face diffusante en plexiglas opale et rétro-éclairage LED homogène."
            }
        },
        "enseigne-drapeau": {
            id: "enseigne-drapeau",
            name: { en: "Double-Sided Projecting Blade Sign", fr: "Enseigne drapeau double face" },
            price: 850,
            category: { en: "Signage", fr: "Enseignes" },
            image: "images/acrylic-signs.jpg",
            description: {
                en: "Perpendicular projecting blade sign for high street visibility, manufactured in rigid aluminum frame with optional internal LED modules.",
                fr: "Enseigne drapeau perpendiculaire double face pour une visibilité piétonne et routière optimale dans les rues commerçantes."
            }
        },
        "aluminium-facades": {
            id: "aluminium-facades",
            name: { en: "ACP / Dibond Cladding & Sign", fr: "Enseigne ACP / Dibond (Façades Alu)" },
            price: 175,
            category: { en: "Building Solutions", fr: "Solutions Bâtiment" },
            image: "images/aluminium-facades.jpg",
            description: {
                en: "Architectural aluminium composite panels (ACP / Dibond) for modern commercial building cladding, storefront revitalization and rigid exterior signs.",
                fr: "Solutions d'habillage de façade et enseignes en panneaux aluminium composite (Dibond / ACP) durables et modernes."
            }
        },
        "wall-stickers": {
            id: "wall-stickers",
            name: { en: "Wall Stickers", fr: "Stickers Muraux" },
            price: 49,
            category: { en: "Print & Graphics", fr: "Impression & Stickers" },
            image: "images/wall-stickers.jpg",
            description: {
                en: "Custom wall stickers for businesses, interiors, branding and decorative applications.",
                fr: "Stickers muraux sur-mesure pour bureaux, espaces commerciaux et décoration intérieure."
            }
        },
        "pvc-cut-letters": {
            id: "pvc-cut-letters",
            name: { en: "Custom PVC / Forex Cut Letters", fr: "Enseigne PVC / Forex (Lettres Découpées)" },
            price: 100,
            category: { en: "Custom PVC Letters", fr: "Lettres PVC Découpées" },
            image: "images/3d-raised-letters.jpg",
            description: {
                en: "High-density CNC-milled PVC Forex cut letters with realistic relief simulation, thickness choices (5mm to 30mm), RAL paint finishes and mounting systems.",
                fr: "Lettres et logos 3D découpés en PVC haute densité sur-mesure avec simulation relief, épaisseurs variées, laquage RAL et fixations."
            },
            customizer: "pvc-letters"
        }
    };

    function getLocalizedProduct(rawProd) {
        if (!rawProd) return null;
        const lang = (window.getCurrentLanguage ? window.getCurrentLanguage() : "en");
        return {
            id: rawProd.id,
            name: typeof rawProd.name === "object" ? (rawProd.name[lang] || rawProd.name.en) : rawProd.name,
            price: rawProd.price,
            category: typeof rawProd.category === "object" ? (rawProd.category[lang] || rawProd.category.en) : rawProd.category,
            image: rawProd.image,
            description: typeof rawProd.description === "object" ? (rawProd.description[lang] || rawProd.description.en) : rawProd.description,
            customizer: rawProd.customizer || ""
        };
    }

    function getCurrentProduct() {
        const id = getUrlProductId();
        const raw = productDatabase[id] || productDatabase["neon-signs"];
        return getLocalizedProduct(raw);
    }

    /* =========================================================
       5. PVC CUSTOMIZER CONFIGURATION & STATE
    ========================================================= */

    const pvcHeightOptions = {
        "10": { label: "10 cm", multiplier: 0.8 },
        "15": { label: "15 cm", multiplier: 1.0 },
        "20": { label: "20 cm", multiplier: 1.3 },
        "30": { label: "30 cm", multiplier: 1.8 },
        "40": { label: "40 cm", multiplier: 2.4 },
        "50": { label: "50 cm", multiplier: 3.0 },
        "custom": { label: "Custom", multiplier: null }
    };

    const pvcThicknessOptions = {
        "5mm": { label: "5 mm", extra: 0 },
        "10mm": { label: "10 mm", extra: 15 },
        "19mm": { label: "19 mm", extra: 30 },
        "30mm": { label: "30 mm", extra: 50 }
    };

    const pvcFinishOptions = {
        "white": { label: "Blanc Brut (Natural White)", extra: 0, color: "#ffffff" },
        "black": { label: "Noir Brut (Black PVC)", extra: 5, color: "#1f2024" },
        "ral-mat": { label: "Peinture Laquée Mat RAL", extra: 30, color: "#383e42" },
        "ral-brillant": { label: "Peinture Laquée Brillant RAL", extra: 35, color: "#c5a059" }
    };

    const pvcFixingOptions = {
        "none": { label: "Sans Fixation", extra: 0 },
        "tape": { label: "Adhésif Double-Face", extra: 15 },
        "standoff": { label: "Entretoises à Clisser", extra: 25 }
    };

    let pvcState = {
        mode: "text",
        heightKey: "20",
        customHeightCm: 20,
        widthCm: 104,
        elementCount: 8,
        thicknessKey: "10mm",
        finishKey: "white",
        hexColor: "#ffffff",
        ralCode: "",
        fixingKey: "none",
        template: false,
        font: "Helvetica",
        customText: "YOUR SIGN",
        fileName: "",
        fileDataUrl: ""
    };

    let pvcInitialized = false;

    function pvcGetHeightCm() {
        if (pvcState.heightKey === "custom") {
            return Math.max(5, Number(pvcState.customHeightCm) || 20);
        }
        return Number(pvcState.heightKey) || 20;
    }

    function pvcGetSizeMultiplier() {
        if (pvcState.heightKey === "custom") {
            return Math.max(0.5, pvcGetHeightCm() / 15);
        }
        return pvcHeightOptions[pvcState.heightKey]?.multiplier || 1.3;
    }

    function pvcEstimateWidth() {
        const heightCm = pvcGetHeightCm();
        const count = Math.max(1, Number(pvcState.elementCount) || 1);
        return Math.round(count * heightCm * 0.65 * 10) / 10;
    }

    function pvcCalculatePrice() {
        const basePrice = 100;
        const mult = pvcGetSizeMultiplier();
        const count = Math.max(1, Number(pvcState.elementCount) || 1);
        const perLetterRate = 10 * mult;
        const letterCharge = count > 1 ? (count - 1) * perLetterRate : 0;
        const thickExtra = pvcThicknessOptions[pvcState.thicknessKey]?.extra || 0;
        const finishExtra = pvcFinishOptions[pvcState.finishKey]?.extra || 0;
        const fixExtra = pvcFixingOptions[pvcState.fixingKey]?.extra || 0;

        let total = basePrice + letterCharge + thickExtra + finishExtra + fixExtra;
        if (pvcState.template) total += 12;

        const qtyInput = document.getElementById("productQuantity");
        const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1, 10) || 1);
        return Math.round(total * qty * 100) / 100;
    }

    function updatePvcLivePreview() {
        const stageText = document.getElementById("pvcRenderedText");
        const stageLogo = document.getElementById("pvcRenderedLogo");
        const pillDims = document.getElementById("pvcPillDimensions");
        const pillCount = document.getElementById("pvcPillCount");
        const stage = document.getElementById("pvcRenderedStage");

        if (!stageText) return;

        if (pvcState.mode === "text") {
            stageText.style.display = "inline-block";
            if (stageLogo) stageLogo.style.display = "none";

            const textToDisplay = (pvcState.customText && pvcState.customText.trim())
                ? pvcState.customText.trim()
                : "YOUR SIGN";

            stageText.textContent = textToDisplay;

            const charLen = textToDisplay.length;
            if (charLen > 25) {
                stageText.style.fontSize = "20px";
            } else if (charLen > 15) {
                stageText.style.fontSize = "28px";
            } else if (charLen > 10) {
                stageText.style.fontSize = "36px";
            } else {
                stageText.style.fontSize = "46px";
            }

            const fontMap = {
                "Helvetica": "font-helvetica",
                "Futura": "font-futura",
                "Playfair Display": "font-playfair",
                "Bebas Neue": "font-bebas",
                "Script": "font-script"
            };
            stageText.className = "pvc-rendered-text " + (fontMap[pvcState.font] || "font-helvetica");
        } else {
            stageText.style.display = "none";
            if (stageLogo) {
                if (pvcState.fileDataUrl) {
                    stageLogo.src = pvcState.fileDataUrl;
                    stageLogo.style.display = "block";
                } else {
                    stageLogo.style.display = "none";
                    stageText.style.display = "inline-block";
                    stageText.textContent = "VECTOR LOGO";
                    stageText.className = "pvc-rendered-text font-helvetica";
                }
            }
        }

        stageText.style.color = pvcState.hexColor || "#ffffff";
        stageText.classList.remove("thickness-5mm", "thickness-10mm", "thickness-19mm", "thickness-30mm");
        stageText.classList.add("thickness-" + pvcState.thicknessKey);

        if (stage) {
            stage.classList.toggle("fixing-standoff", pvcState.fixingKey === "standoff");
        }

        const height = pvcGetHeightCm();
        const width = pvcState.widthCm || pvcEstimateWidth();
        const elements = Math.max(1, Number(pvcState.elementCount) || 1);

        if (pillDims) pillDims.textContent = `${width} × ${height} cm`;
        if (pillCount) pillCount.textContent = `${elements} element${elements > 1 ? "s" : ""}`;
    }

    function pvcUpdatePrice() {
        const priceElement = document.querySelector(".product-price");
        if (!priceElement) return;

        priceElement.textContent = formatPrice(pvcCalculatePrice());

        const breakdown = document.querySelector("#pvcPriceBreakdown");
        if (breakdown) {
            const count = Math.max(1, Number(pvcState.elementCount) || 1);
            const heightLabel = pvcState.heightKey === "custom"
                ? pvcGetHeightCm() + " cm"
                : (pvcHeightOptions[pvcState.heightKey]?.label || "");
            const thicknessLabel = pvcThicknessOptions[pvcState.thicknessKey]?.label || "";
            const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
            breakdown.textContent = isFr
                ? `${count} élément${count > 1 ? "s" : ""} · Hauteur ${heightLabel} · Relief ${thicknessLabel}${pvcState.template ? " · Gabarit 1:1 inclus" : ""}`
                : `${count} element${count > 1 ? "s" : ""} · Height ${heightLabel} · Relief ${thicknessLabel}${pvcState.template ? " · 1:1 mounting template included" : ""}`;
        }

        updatePvcLivePreview();
    }

    function pvcSetActiveCard(groupSelector, key, activeAttr) {
        document.querySelectorAll(groupSelector).forEach(function (card) {
            card.classList.toggle("active", card.getAttribute(activeAttr) === key);
        });
    }

    function pvcUpdateModePanels() {
        document.querySelectorAll(".pvc-mode-btn").forEach(function (button) {
            button.classList.toggle("active", button.getAttribute("data-pvc-mode") === pvcState.mode);
        });

        const textPanel = document.querySelector("#pvcTextPanel");
        const uploadPanel = document.querySelector("#pvcUploadPanel");
        if (textPanel) textPanel.style.display = (pvcState.mode === "text") ? "block" : "none";
        if (uploadPanel) uploadPanel.style.display = (pvcState.mode === "upload") ? "block" : "none";
    }

    function pvcSyncWidthField() {
        const widthInput = document.querySelector("#pvcWidth");
        if (widthInput) widthInput.value = pvcEstimateWidth();
        pvcState.widthCm = pvcEstimateWidth();
    }

    function pvcAutoElementCountFromText() {
        const textInput = document.querySelector("#pvcCustomText");
        const countInput = document.querySelector("#pvcElementCount");
        if (!textInput || !countInput) return;

        const letters = textInput.value.replace(/\s/g, "").length;
        countInput.value = Math.max(1, letters || 1);
        pvcState.elementCount = Math.max(1, letters || 1);
    }

    function initPvcCustomizer() {
        const container = document.querySelector("#pvcCustomizer");
        if (!container) return;

        pvcAutoElementCountFromText();
        pvcSyncWidthField();
        pvcUpdateModePanels();
        pvcUpdatePrice();
        updatePvcLivePreview();

        if (pvcInitialized) return;
        pvcInitialized = true;

        container.querySelectorAll(".pvc-mode-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                pvcState.mode = button.getAttribute("data-pvc-mode");
                pvcUpdateModePanels();
                pvcUpdatePrice();
            });
        });

        const customTextInput = container.querySelector("#pvcCustomText");
        if (customTextInput) {
            customTextInput.addEventListener("input", function () {
                pvcState.customText = sanitizeInput(customTextInput.value);
                pvcAutoElementCountFromText();
                pvcSyncWidthField();
                pvcUpdatePrice();
            });
        }

        const fontSelect = container.querySelector("#pvcFontSelect");
        if (fontSelect) {
            fontSelect.addEventListener("change", function () {
                pvcState.font = fontSelect.value;
                pvcUpdatePrice();
            });
        }

        const vectorUpload = container.querySelector("#pvcVectorUpload");
        const uploadPreview = container.querySelector("#pvcUploadPreview");
        const uploadPreviewImg = container.querySelector("#pvcUploadPreviewImg");
        const uploadFileNameEl = container.querySelector("#pvcUploadFileName");
        const removeUpload = container.querySelector("#pvcRemoveUpload");

        if (vectorUpload) {
            vectorUpload.addEventListener("change", function () {
                const file = vectorUpload.files && vectorUpload.files[0];
                if (!file) return;

                pvcState.fileName = file.name;
                if (uploadFileNameEl) uploadFileNameEl.textContent = file.name;
                if (uploadPreview) uploadPreview.style.display = "flex";

                const isSvg = /\.svg$/i.test(file.name) || file.type === "image/svg+xml";
                if (isSvg) {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        pvcState.fileDataUrl = event.target.result;
                        if (uploadPreviewImg) {
                            uploadPreviewImg.src = pvcState.fileDataUrl;
                            uploadPreviewImg.style.display = "block";
                        }
                        updatePvcLivePreview();
                    };
                    reader.readAsDataURL(file);
                } else {
                    pvcState.fileDataUrl = "";
                    if (uploadPreviewImg) uploadPreviewImg.style.display = "none";
                    updatePvcLivePreview();
                }

                pvcUpdatePrice();
            });
        }

        if (removeUpload) {
            removeUpload.addEventListener("click", function () {
                pvcState.fileName = "";
                pvcState.fileDataUrl = "";
                if (vectorUpload) vectorUpload.value = "";
                if (uploadPreview) uploadPreview.style.display = "none";
                if (uploadFileNameEl) uploadFileNameEl.textContent = "";
                pvcUpdatePrice();
            });
        }

        container.querySelectorAll(".pvc-height-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                const key = button.getAttribute("data-pvc-height");
                pvcState.heightKey = key;
                pvcSetActiveCard(".pvc-height-btn", key, "data-pvc-height");

                const customWrap = container.querySelector("#pvcCustomHeightWrap");
                if (customWrap) customWrap.style.display = (key === "custom") ? "block" : "none";

                pvcSyncWidthField();
                pvcUpdatePrice();
            });
        });

        const customHeightInput = container.querySelector("#pvcCustomHeight");
        if (customHeightInput) {
            customHeightInput.addEventListener("input", function () {
                pvcState.customHeightCm = Math.max(5, parseFloat(customHeightInput.value) || 20);
                pvcSyncWidthField();
                pvcUpdatePrice();
            });
        }

        const widthInput = container.querySelector("#pvcWidth");
        if (widthInput) {
            widthInput.addEventListener("input", function () {
                pvcState.widthCm = Math.max(0, parseFloat(widthInput.value) || 0);
                updatePvcLivePreview();
            });
        }

        const elementCountInput = container.querySelector("#pvcElementCount");
        if (elementCountInput) {
            elementCountInput.addEventListener("input", function () {
                pvcState.elementCount = Math.max(1, parseInt(elementCountInput.value, 10) || 1);
                pvcSyncWidthField();
                pvcUpdatePrice();
            });
        }

        container.querySelectorAll(".pvc-thickness-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                const key = button.getAttribute("data-pvc-thickness");
                pvcState.thicknessKey = key;
                pvcSetActiveCard(".pvc-thickness-btn", key, "data-pvc-thickness");
                pvcUpdatePrice();
            });
        });

        const swatches = container.querySelectorAll(".pvc-swatch");
        const ralField = container.querySelector("#pvcRalField");
        const finishLabel = container.querySelector("#pvcSelectedFinishLabel");
        const colorPicker = container.querySelector("#pvcColorPicker");
        const ralInput = container.querySelector("#pvcRalCode");

        swatches.forEach(function (swatch) {
            swatch.addEventListener("click", function () {
                swatches.forEach(s => s.classList.remove("active"));
                swatch.classList.add("active");

                const finish = swatch.getAttribute("data-finish");
                const color = swatch.getAttribute("data-color");
                const name = swatch.getAttribute("data-name");
                const ral = swatch.getAttribute("data-ral");

                pvcState.finishKey = finish;
                pvcState.hexColor = color === "custom" ? (colorPicker ? colorPicker.value : "#383e42") : color;
                pvcState.ralCode = ral || "";

                if (finishLabel) finishLabel.textContent = name;
                if (ralField) ralField.style.display = (color === "custom" || ral) ? "block" : "none";
                if (ralInput && ral) ralInput.value = ral;

                pvcUpdatePrice();
            });
        });

        if (colorPicker) {
            colorPicker.addEventListener("input", function () {
                pvcState.hexColor = colorPicker.value;
                updatePvcLivePreview();
            });
        }

        if (ralInput) {
            ralInput.addEventListener("input", function () {
                pvcState.ralCode = sanitizeInput(ralInput.value);
            });
        }

        const wallSurface = document.getElementById("pvcWallSurface");
        document.querySelectorAll(".wall-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".wall-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                if (wallSurface) {
                    wallSurface.className = "pvc-wall-surface " + btn.getAttribute("data-wall");
                }
            });
        });

        container.querySelectorAll(".pvc-fixing-btn").forEach(function (button) {
            button.addEventListener("click", function () {
                const key = button.getAttribute("data-pvc-fixing");
                pvcState.fixingKey = key;
                pvcSetActiveCard(".pvc-fixing-btn", key, "data-pvc-fixing");
                pvcUpdatePrice();
            });
        });

        const templateCheckbox = container.querySelector("#pvcTemplate");
        if (templateCheckbox) {
            templateCheckbox.addEventListener("change", function () {
                pvcState.template = templateCheckbox.checked;
                pvcUpdatePrice();
            });
        }
    }

    function getPvcCustomization() {
        const qtyInput = document.querySelector("#productQuantity");
        const quantity = Math.max(1, Math.min(20, qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1));
        const finish = pvcFinishOptions[pvcState.finishKey];
        const heightLabel = pvcState.heightKey === "custom"
            ? pvcGetHeightCm() + " cm"
            : (pvcHeightOptions[pvcState.heightKey]?.label || "");

        const current = getCurrentProduct();

        return {
            id: current.id,
            name: current.name,
            price: pvcCalculatePrice() / quantity,
            quantity: quantity,
            customType: pvcState.mode,
            customText: pvcState.mode === "text" ? pvcState.customText.trim() : "",
            font: pvcState.mode === "text" ? pvcState.font : "",
            letterHeight: heightLabel,
            width: (pvcState.widthCm || pvcEstimateWidth()) + " cm",
            elementCount: Math.max(1, Number(pvcState.elementCount) || 1),
            thickness: pvcThicknessOptions[pvcState.thicknessKey]?.label || "",
            finish: finish ? finish.label : "",
            ralCode: pvcState.ralCode,
            fixing: pvcFixingOptions[pvcState.fixingKey]?.label || "",
            template: Boolean(pvcState.template),
            fileName: pvcState.mode === "upload" ? pvcState.fileName : "",
            fileDataUrl: pvcState.mode === "upload" ? pvcState.fileDataUrl : "",
            image: pvcState.fileDataUrl || current.image || "",
            size: heightLabel,
            material: "High-density Cellular PVC",
            designService: false
        };
    }

    /* =========================================================
       6. MOBILE MENU TOGGLE
    ========================================================= */

    function setupMobileMenu() {
        document.querySelectorAll(".mobile-menu-btn").forEach(function (button) {
            button.setAttribute("aria-expanded", "false");

            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const header = button.closest(".navbar") || document;
                const menu = header.querySelector(".mobile-menu") || document.getElementById("mobileMenu");
                if (!menu) return;

                const isOpen = menu.classList.toggle("show");
                button.setAttribute("aria-expanded", isOpen ? "true" : "false");

                // Toggle icon
                const icon = button.querySelector("i");
                if (icon) {
                    if (isOpen) {
                        icon.classList.remove("fa-bars");
                        icon.classList.add("fa-xmark");
                    } else {
                        icon.classList.remove("fa-xmark");
                        icon.classList.add("fa-bars");
                    }
                }
            });
        });

        // Close when clicking outside
        document.addEventListener("click", function (event) {
            document.querySelectorAll(".mobile-menu.show").forEach(function (menu) {
                const header = menu.closest(".navbar");
                if (header && !header.contains(event.target)) {
                    menu.classList.remove("show");
                    const button = header.querySelector(".mobile-menu-btn");
                    if (button) {
                        button.setAttribute("aria-expanded", "false");
                        const icon = button.querySelector("i");
                        if (icon) {
                            icon.classList.remove("fa-xmark");
                            icon.classList.add("fa-bars");
                        }
                    }
                }
            });
        });

        // Close on escape key
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                document.querySelectorAll(".mobile-menu.show").forEach(function (menu) {
                    menu.classList.remove("show");
                    const header = menu.closest(".navbar");
                    if (header) {
                        const button = header.querySelector(".mobile-menu-btn");
                        if (button) {
                            button.setAttribute("aria-expanded", "false");
                            const icon = button.querySelector("i");
                            if (icon) {
                                icon.classList.remove("fa-xmark");
                                icon.classList.add("fa-bars");
                            }
                        }
                    }
                });
            }
        });

        // Close when a link inside mobile-menu is clicked
        document.querySelectorAll(".mobile-menu a").forEach(function (link) {
            link.addEventListener("click", function () {
                const menu = link.closest(".mobile-menu");
                if (menu) {
                    menu.classList.remove("show");
                    const header = menu.closest(".navbar");
                    if (header) {
                        const button = header.querySelector(".mobile-menu-btn");
                        if (button) {
                            button.setAttribute("aria-expanded", "false");
                            const icon = button.querySelector("i");
                            if (icon) {
                                icon.classList.remove("fa-xmark");
                                icon.classList.add("fa-bars");
                            }
                        }
                    }
                }
            });
        });
    }

    setupMobileMenu();

    /* =========================================================
       7. ADVANCED SEARCH SYSTEM WITH LIVE WORD AUTOCOMPLETE & SUGGESTIONS
    ========================================================= */

    function initSearchSystem() {
        let searchModal = document.querySelector(".search-modal");
        if (!searchModal) {
            searchModal = document.createElement("div");
            searchModal.className = "search-modal";
            searchModal.innerHTML = `
                <div class="search-modal-box">
                    <div class="search-input-wrap">
                        <div class="search-icon-badge">🔍</div>
                        <input type="text" id="globalSearchInput" placeholder="Search signs, neon, PVC letters, stickers..." autocomplete="off" spellcheck="false">
                        <button type="button" class="search-clear-btn" id="searchClearBtn" style="display:none;" title="Clear search">✕</button>
                        <button type="button" class="search-modal-close" id="searchModalClose" aria-label="Close search">×</button>
                    </div>
                    <div id="searchQuickActionContainer"></div>
                    <div class="search-suggestions-box" id="searchSuggestionsBox">
                        <div class="search-suggestion-label" id="searchSuggestionsLabel">💡 Suggestions / Popular Searches</div>
                        <div class="search-tags-row" id="searchSuggestionsList"></div>
                    </div>
                    <div class="search-results-list" id="searchResultsList"></div>
                    <div class="search-footer-hint">
                        <span>Press <kbd class="search-kbd">ESC</kbd> to exit or <kbd class="search-kbd">/</kbd> to search anytime</span>
                        <span class="search-kbd-shortcuts">
                            <span><kbd class="search-kbd">Tab</kbd> Autocomplete</span>
                            <span><kbd class="search-kbd">↑</kbd> <kbd class="search-kbd">↓</kbd> Navigate</span>
                            <span><kbd class="search-kbd">↵</kbd> Select</span>
                        </span>
                    </div>
                </div>
            `;
            document.body.appendChild(searchModal);
        }

        const searchInput = document.getElementById("globalSearchInput");
        const resultsList = document.getElementById("searchResultsList");
        const suggestionsBox = document.getElementById("searchSuggestionsBox");
        const suggestionsList = document.getElementById("searchSuggestionsList");
        const suggestionsLabel = document.getElementById("searchSuggestionsLabel");
        const quickActionContainer = document.getElementById("searchQuickActionContainer");
        const clearBtn = document.getElementById("searchClearBtn");
        const closeBtn = document.getElementById("searchModalClose");

        // Canonical Search Terms & Phrases (Bilingual)
        const popularPhrases = [
            "Neon Signs",
            "Custom LED Neon Sign Builder",
            "Néons Lumineux",
            "Custom Cut PVC Letters",
            "Lettres PVC Découpées Relief",
            "Adhesive Stickers",
            "Stickers Adhésifs Vitrine",
            "Vehicle Wrapping & Covering",
            "Business Signs",
            "Enseignes Commerciales",
            "Acrylic Signs & Plexiglas",
            "Retractable Awnings",
            "Stores Bannes",
            "3D Raised Letters",
            "Wall Stickers Muraux",
            "Aluminium Facades"
        ];

        // Rich vocabulary for as-you-type single-word and prefix autocompletion
        const vocabularyWords = [
            "neon", "neons", "néon", "néons", "led", "sign", "signs", "signage", "enseigne", "enseignes",
            "custom", "customizer", "builder", "sur-mesure", "pvc", "letters", "lettres", "lettering",
            "relief", "3d", "acrylic", "acrylique", "plexiglas", "plexi", "stickers", "sticker", "adhesive",
            "adhésif", "adhésifs", "vitrine", "window", "decals", "decal", "wall", "mural", "muraux",
            "storefront", "shop", "magasin", "boutique", "business", "commercial", "facade", "façade",
            "aluminium", "composite", "vehicle", "véhicule", "car", "van", "truck", "camionnette", "wrapping",
            "covering", "marquage", "flotte", "awning", "awnings", "store", "banne", "bannes", "terrasse",
            "suspended", "suspendu", "ceiling", "ceilings", "plafond", "plafonds", "illuminated", "lumineux",
            "glow", "lumiere", "silicone", "flex", "contour", "rectangle", "mirror", "miroir", "transparent",
            "black", "noir", "outdoor", "extérieur", "indoor", "intérieur", "waterproof", "ip67", "ip20",
            "dimmer", "variateur", "remote", "télécommande", "wifi", "smart", "standoff", "entretoises"
        ];

        let activeHighlightedIndex = -1;
        let currentSuggestions = [];

        function stripAccents(str) {
            return String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        }

        function highlightMatch(text, query) {
            if (!query || !text) return escapeHtml(text);
            const cleanQuery = query.trim();
            if (!cleanQuery) return escapeHtml(text);
            const safeQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`(${safeQuery})`, "gi");
            return escapeHtml(text).replace(regex, '<mark class="search-match">$1</mark>');
        }

        function openSearch(initialQuery = "") {
            searchModal.classList.add("active");
            if (searchInput) {
                searchInput.value = initialQuery;
                clearBtn.style.display = initialQuery ? "flex" : "none";
                searchInput.focus();
                renderSearch(initialQuery);
            }
        }

        function closeSearch() {
            searchModal.classList.remove("active");
            activeHighlightedIndex = -1;
        }

        document.querySelectorAll(".search-toggle").forEach(btn => {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                openSearch();
            });
        });

        // Global hotkeys: '/' or 'Ctrl+K' / 'Cmd+K'
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && searchModal.classList.contains("active")) {
                closeSearch();
                return;
            }
            if ((e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
                e.preventDefault();
                openSearch();
            }
        });

        if (closeBtn) closeBtn.addEventListener("click", closeSearch);
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                searchInput.value = "";
                clearBtn.style.display = "none";
                searchInput.focus();
                renderSearch("");
            });
        }

        searchModal.addEventListener("click", function (e) {
            if (e.target === searchModal) closeSearch();
        });

        // Generate dynamic as-you-type word & phrase suggestions
        function getSuggestionsForQuery(query) {
            const raw = String(query || "").trim();
            if (!raw) {
                return popularPhrases.slice(0, 7);
            }

            const normQ = stripAccents(raw);
            const tokens = raw.split(/\s+/).filter(Boolean);
            const lastToken = tokens[tokens.length - 1] || "";
            const normLast = stripAccents(lastToken);
            const prefix = tokens.slice(0, -1).join(" ");

            const results = [];
            const seen = new Set();

            function addSug(text) {
                const norm = stripAccents(text);
                if (!seen.has(norm) && norm.length > 0) {
                    seen.add(norm);
                    results.push(text);
                }
            }

            // 1. Check popularPhrases starting with query
            popularPhrases.forEach(p => {
                if (stripAccents(p).startsWith(normQ)) addSug(p);
            });

            // 2. Word completion for active word typed (e.g. typing "ne" suggests "neon", "neon signs")
            if (normLast.length >= 1) {
                const matchingWords = vocabularyWords.filter(w => stripAccents(w).startsWith(normLast));
                matchingWords.forEach(w => {
                    const candidate = prefix ? `${prefix} ${w}` : w;
                    addSug(candidate);
                });
            }

            // 3. Check popularPhrases containing query anywhere
            popularPhrases.forEach(p => {
                if (stripAccents(p).includes(normQ)) addSug(p);
            });

            // 4. Products matching query directly
            Object.values(productDatabase).forEach(rawProd => {
                const p = getLocalizedProduct(rawProd);
                if (p && stripAccents(p.name).includes(normQ)) {
                    addSug(p.name);
                }
                if (p && stripAccents(p.category).includes(normQ)) {
                    addSug(p.category);
                }
            });

            // 5. Fallback phrase
            if (results.length === 0) {
                results.push(`"${raw}" in Signage`, `"${raw}" in Custom Products`);
            }

            return results.slice(0, 8);
        }

        function renderSuggestions(query) {
            if (!suggestionsList) return;
            const cleanQuery = String(query || "").trim();
            const suggestions = getSuggestionsForQuery(cleanQuery);
            currentSuggestions = suggestions;

            if (!cleanQuery) {
                if (suggestionsLabel) suggestionsLabel.innerHTML = "💡 Popular & Trending Searches";
            } else {
                if (suggestionsLabel) {
                    suggestionsLabel.innerHTML = `🔍 Suggestions for "<strong>${escapeHtml(cleanQuery)}</strong>"`;
                }
            }

            suggestionsList.innerHTML = suggestions.map((sug, idx) => {
                const highlighted = highlightMatch(sug, cleanQuery);
                return `
                    <button type="button" class="search-tag-chip" data-query="${escapeHtml(sug)}" data-index="${idx}">
                        <span>🔎</span> <span>${highlighted}</span>
                    </button>
                `;
            }).join("");

            suggestionsList.querySelectorAll(".search-tag-chip").forEach(chip => {
                chip.addEventListener("click", function () {
                    const q = this.getAttribute("data-query");
                    searchInput.value = q;
                    clearBtn.style.display = "flex";
                    searchInput.focus();
                    renderSearch(q);
                });
            });
        }

        // Quick Action Builders Banner
        function renderQuickActions(query) {
            if (!quickActionContainer) return;
            const normQ = stripAccents(query);

            if (normQ.includes("neon") || normQ.includes("lum") || normQ.includes("light") || normQ.includes("flex") || normQ.includes("glow")) {
                quickActionContainer.innerHTML = `
                    <a href="neon-builder.html" class="search-quick-action">
                        <div class="search-quick-action-text">
                            <strong>✨ Interactive LED Neon Sign Builder</strong>
                            <span>Design custom text in 2.5D with 12 glow colors, Day/Night toggle &amp; live pricing.</span>
                        </div>
                        <span class="search-quick-action-btn">Open Builder →</span>
                    </a>
                `;
                quickActionContainer.style.display = "block";
                return;
            }

            if (normQ.includes("pvc") || normQ.includes("letter") || normQ.includes("relief") || normQ.includes("3d") || normQ.includes("lettre")) {
                quickActionContainer.innerHTML = `
                    <a href="product.html?id=pvc-cut-letters" class="search-quick-action" style="border-color:#a855f7;">
                        <div class="search-quick-action-text">
                            <strong style="color:#c084fc;">✨ Custom Cut PVC Letters Customizer</strong>
                            <span>Real-time 3D relief visualizer, thickness selection &amp; RAL paint finishes.</span>
                        </div>
                        <span class="search-quick-action-btn" style="background:#c084fc;">Open Studio →</span>
                    </a>
                `;
                quickActionContainer.style.display = "block";
                return;
            }

            quickActionContainer.innerHTML = "";
            quickActionContainer.style.display = "none";
        }

        function renderSearch(query) {
            if (!resultsList) return;
            const term = stripAccents(query);
            renderSuggestions(query);
            renderQuickActions(query);
            activeHighlightedIndex = -1;

            const allProducts = Object.values(productDatabase).map(getLocalizedProduct);
            const matches = allProducts.filter(prod => {
                if (!term) return true;
                const nameMatch = stripAccents(prod.name).includes(term);
                const catMatch = stripAccents(prod.category).includes(term);
                const descMatch = stripAccents(prod.description).includes(term);
                return nameMatch || catMatch || descMatch;
            });

            if (matches.length === 0) {
                resultsList.innerHTML = `
                    <div style="padding:32px 20px;text-align:center;color:#666;">
                        <div style="font-size:32px;margin-bottom:8px;">🔍</div>
                        <p style="font-weight:600;font-size:15px;color:#111;margin-bottom:4px;">No products found matching "${escapeHtml(query)}"</p>
                        <p style="font-size:13px;color:#777;margin-bottom:16px;">Try searching for "neon", "pvc letters", "stickers", or build custom signage.</p>
                        <a href="neon-builder.html" class="btn btn-dark" style="font-size:12px;padding:10px 18px;">Open LED Neon Sign Builder →</a>
                    </div>
                `;
                return;
            }

            resultsList.innerHTML = matches.map((prod, idx) => {
                const highlightedTitle = highlightMatch(prod.name, query);
                const isNeon = prod.id === "neon-signs";
                const isPvc = prod.customizer === "pvc-letters";
                const targetUrl = isNeon ? "neon-builder.html" : `product.html?id=${prod.id}`;
                const badgeText = isNeon ? "✨ 2.5D Neon Builder" : (isPvc ? "✨ 3D Customizer" : "");

                return `
                    <a href="${targetUrl}" class="search-result-item" data-index="${idx}">
                        <img src="${prod.image}" alt="${escapeHtml(prod.name)}" class="search-result-thumb" onerror="this.src='images/company-logo.jpeg'">
                        <div class="search-result-info">
                            <div class="search-result-title">
                                <span>${highlightedTitle}</span>
                                ${badgeText ? `<span class="search-result-badge">${badgeText}</span>` : ''}
                            </div>
                            <span class="search-result-category">${escapeHtml(prod.category)}</span>
                        </div>
                        <div class="search-result-price">${formatPrice(prod.price)}</div>
                    </a>
                `;
            }).join("");
        }

        if (searchInput) {
            searchInput.addEventListener("input", function () {
                const val = this.value;
                clearBtn.style.display = val ? "flex" : "none";
                renderSearch(val);
            });

            // Keyboard navigation & Tab autocomplete
            searchInput.addEventListener("keydown", function (e) {
                const items = resultsList.querySelectorAll(".search-result-item");

                // Tab autocompletes with the first suggestion word
                if (e.key === "Tab") {
                    if (currentSuggestions.length > 0 && currentSuggestions[0]) {
                        e.preventDefault();
                        const topSug = currentSuggestions[0].replace(/^"/, "").replace(/" in .*$/, "");
                        searchInput.value = topSug;
                        clearBtn.style.display = "flex";
                        renderSearch(topSug);
                        return;
                    }
                }

                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (items.length) {
                        activeHighlightedIndex = (activeHighlightedIndex + 1) % items.length;
                        updateItemHighlight(items);
                    }
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (items.length) {
                        activeHighlightedIndex = (activeHighlightedIndex - 1 + items.length) % items.length;
                        updateItemHighlight(items);
                    }
                } else if (e.key === "Enter") {
                    if (activeHighlightedIndex >= 0 && items[activeHighlightedIndex]) {
                        e.preventDefault();
                        items[activeHighlightedIndex].click();
                    } else if (items.length > 0) {
                        e.preventDefault();
                        items[0].click();
                    }
                }
            });
        }

        function updateItemHighlight(items) {
            items.forEach((it, idx) => {
                it.classList.toggle("highlighted", idx === activeHighlightedIndex);
                if (idx === activeHighlightedIndex) {
                    it.scrollIntoView({ block: "nearest" });
                }
            });
        }

        // =========================================================
        // In-Page Catalog Search (for products.html)
        // =========================================================
        const catalogSearchInput = document.getElementById("shopCatalogSearchInput");
        const catalogSuggestions = document.getElementById("shopCatalogSuggestions");
        const catalogClear = document.getElementById("shopCatalogSearchClear");

        if (catalogSearchInput) {
            catalogSearchInput.addEventListener("input", function () {
                const val = this.value.trim();
                if (catalogClear) catalogClear.style.display = val ? "flex" : "none";
                filterCatalogPage(val);
                renderCatalogSuggestions(val);
            });

            if (catalogClear) {
                catalogClear.addEventListener("click", function () {
                    catalogSearchInput.value = "";
                    catalogClear.style.display = "none";
                    filterCatalogPage("");
                    renderCatalogSuggestions("");
                    catalogSearchInput.focus();
                });
            }
        }

        function renderCatalogSuggestions(query) {
            if (!catalogSuggestions) return;
            if (!query) {
                catalogSuggestions.innerHTML = `
                    <span class="shop-catalog-suggestions-label">Suggestions:</span>
                    <button type="button" class="search-tag-chip" data-q="Neon Signs">Neon Signs</button>
                    <button type="button" class="search-tag-chip" data-q="PVC Letters">PVC Letters</button>
                    <button type="button" class="search-tag-chip" data-q="Stickers">Stickers</button>
                    <button type="button" class="search-tag-chip" data-q="Vehicle">Vehicle</button>
                `;
            } else {
                const sugs = getSuggestionsForQuery(query).slice(0, 5);
                catalogSuggestions.innerHTML = `
                    <span class="shop-catalog-suggestions-label">Matching:</span>
                    ${sugs.map(s => `<button type="button" class="search-tag-chip" data-q="${escapeHtml(s)}">${highlightMatch(s, query)}</button>`).join("")}
                `;
            }

            catalogSuggestions.querySelectorAll(".search-tag-chip").forEach(chip => {
                chip.addEventListener("click", function () {
                    const q = this.getAttribute("data-q");
                    if (catalogSearchInput) {
                        catalogSearchInput.value = q;
                        if (catalogClear) catalogClear.style.display = "flex";
                        filterCatalogPage(q);
                        renderCatalogSuggestions(q);
                    }
                });
            });
        }

        function filterCatalogPage(query) {
            const cards = document.querySelectorAll(".shop-product");
            if (!cards.length) return;
            const term = stripAccents(query);

            cards.forEach(card => {
                if (!term) {
                    card.style.display = "";
                    return;
                }
                const name = stripAccents(card.getAttribute("data-name") || "");
                const cat = stripAccents(card.getAttribute("data-category") || "");
                const visible = name.includes(term) || cat.includes(term);
                card.style.display = visible ? "" : "none";
            });
        }

        if (catalogSearchInput) {
            renderCatalogSuggestions("");
        }
    }

    initSearchSystem();

    /* =========================================================
       8. TOAST SYSTEM & CART COUNT
    ========================================================= */

    function showToast(message, icon = "✓") {
        let container = document.getElementById("toastContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "toastContainer";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");
        toast.className = "toast-item";
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content"><p class="toast-message">${escapeHtml(message)}</p></div>
            <button type="button" class="toast-close" aria-label="Close">✕</button>
        `;

        const closeBtn = toast.querySelector(".toast-close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                toast.classList.add("toast-leaving");
                setTimeout(() => toast.remove(), 260);
            });
        }

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add("toast-leaving");
                setTimeout(() => toast.remove(), 260);
            }
        }, 3400);
    }

    function updateCartCount() {
        const total = cart.reduce(function (sum, item) {
            return sum + (Number(item.quantity) || 1);
        }, 0);

        document.querySelectorAll("#cartCount, .cart-count").forEach(function (counter) {
            if (counter) counter.textContent = total;
        });
    }

    function addToCart(product) {
        if (!product || !product.id) return;

        const quantity = Math.max(1, Number(product.quantity) || 1);
        const dimensions = product.dimensions || product.size || "";
        const font = product.font || "";
        const options = Array.isArray(product.options) ? product.options : (product.options ? [product.options] : []);

        const existingIndex = cart.findIndex(function (item) {
            return (
                String(item.id) === String(product.id) &&
                String(item.dimensions || item.size || "") === String(dimensions) &&
                String(item.customText || "") === String(product.customText || "") &&
                String(item.font || "") === String(font) &&
                String(item.material || "") === String(product.material || "") &&
                String(item.finish || "") === String(product.finish || "")
            );
        });

        if (existingIndex !== -1) {
            cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 0) + quantity;
            if (!cart[existingIndex].dimensions && dimensions) cart[existingIndex].dimensions = dimensions;
            if (!cart[existingIndex].font && font) cart[existingIndex].font = font;
            if (!cart[existingIndex].options && options.length) cart[existingIndex].options = options;
        } else {
            cart.push({
                id: product.id,
                name: product.name || "Product",
                price: Number(product.price) || 0,
                quantity: quantity,
                size: product.size || dimensions,
                dimensions: dimensions,
                image: product.image || "images/company-logo.jpeg",
                fileName: product.fileName || "",
                designService: Boolean(product.designService),
                customText: product.customText || "",
                font: font,
                options: options,
                material: product.material || "",
                finish: product.finish || ""
            });
        }

        saveCart();
        updateCartCount();

        const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
        showToast(isFr ? `${product.name} ajouté au panier !` : `${product.name} added to cart!`, "🛒");
    }

    function getCardProduct(button, card) {
        if (!card) return null;

        let name = button?.getAttribute("data-name") || "";
        if (!name) {
            const nameElement = card.querySelector("h3, .shop-product-title, .product-title");
            if (nameElement) name = nameElement.textContent.trim();
        }

        let id = button?.getAttribute("data-id") || card.getAttribute("data-id") || slugify(name);
        let price = parseFloat(button?.getAttribute("data-price")) || parseFloat(card.getAttribute("data-price")) || 0;
        let image = button?.getAttribute("data-image") || card.querySelector("img")?.getAttribute("src") || "";

        return {
            id: id || "product",
            name: name || "Product",
            price: Number(price) || 0,
            quantity: 1,
            size: "",
            image: image,
            fileName: "",
            designService: false,
            customText: "",
            material: "",
            finish: ""
        };
    }

    function setupCardCartButtons() {
        document.querySelectorAll(".shop-add-cart, .add-cart, .quick-add").forEach(function (button) {
            if (button.dataset.cartHandlerAttached === "true") return;
            button.dataset.cartHandlerAttached = "true";

            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const card = button.closest(".shop-product, .product-card");
                const product = getCardProduct(button, card);
                if (product) addToCart(product);
            });
        });
    }

    setupCardCartButtons();

    /* =========================================================
       9. LOGOENSEIGNE 5-ENGINE MODULAR CUSTOMIZATION ARCHITECTURE
    ========================================================= */

    const ENGINE_MAP = {
        "neon-signs": "neon",
        "3d-raised-letters": "relief",
        "pvc-cut-letters": "relief",
        "acrylic-signs-displays": "relief",
        "lettres-3d-lumineuses": "relief",
        "lettres-3d-retro-halo": "relief",
        "lettres-3d-lateral": "relief",
        "lettres-3d-plateau-acp": "relief",
        "business-signs": "facade",
        "aluminium-facades": "facade",
        "caisson-lumineux": "facade",
        "enseigne-drapeau": "facade",
        "retractable-awnings": "facade",
        "suspended-ceilings": "facade",
        "vehicle-wrapping": "vehicle",
        "vehicle-lettering-graphics": "vehicle",
        "adhesive-stickers": "stickers",
        "wall-stickers": "stickers"
    };

    function getUniversalServicesFee(widthCm, heightCm) {
        let fee = 0;
        const installSelect = document.getElementById("serviceInstallationSelect");
        if (installSelect) {
            if (installSelect.value === "ground") fee += 350;
            else if (installSelect.value === "nacelle") fee += 750;
        }

        const elecCheck = document.getElementById("serviceElectricalCheck");
        if (elecCheck && elecCheck.checked) fee += 180;

        const surveyCheck = document.getElementById("serviceSurveyCheck");
        if (surveyCheck && surveyCheck.checked) fee += 120;

        const wM = (Number(widthCm) || 200) / 100;
        const hM = (Number(heightCm) || 50) / 100;
        const linearM = 2 * (wM + hM);
        const areaM2 = (wM * hM);

        const frameCheck = document.getElementById("serviceFrameCheck");
        if (frameCheck && frameCheck.checked) {
            fee += Math.round(linearM * 80);
        }

        const diffuserCheck = document.getElementById("serviceDiffuserCheck");
        if (diffuserCheck && diffuserCheck.checked) {
            fee += Math.round(areaM2 * 50);
        }

        return fee;
    }

    let activeCustomizerEngine = "relief";
    let selectedProduct = null;
    let customizerCalculatedUnitPrice = 149;
    let customizerCalculatedTotal = 149;
    let customizerItemPayload = null;

    // Stage Elements
    const workshopStageBox = document.getElementById("workshopStageBox");
    const hudMetricsText = document.getElementById("hudMetricsText");
    const stageDayNightToggle = document.getElementById("stageDayNightToggle");
    const dayNightIcon = document.getElementById("dayNightIcon");
    const dayNightLabel = document.getElementById("dayNightLabel");

    // Quantity & Pricing Elements
    const productPriceDisplay = document.getElementById("productPriceDisplay");
    const productQuantity = document.getElementById("productQuantity");
    const quantityMinus = document.getElementById("quantityMinus");
    const quantityPlus = document.getElementById("quantityPlus");
    const productAddToCart = document.getElementById("productAddToCart");
    const buyNow = document.getElementById("buyNow");
    const productWishlist = document.getElementById("productWishlist");

    let isNightMode = true; // Lights ON by default for dramatic presentation

    // Helper: trigger price pulse animation
    function triggerPricePulse() {
        if (!productPriceDisplay) return;
        productPriceDisplay.classList.remove("price-pulse");
        void productPriceDisplay.offsetWidth; // reflow
        productPriceDisplay.classList.add("price-pulse");
    }

    // Helper: update HUD pill
    function updateHudPill(widthCm, heightCm, count, extraLabel = "") {
        if (!hudMetricsText) return;
        const w = Number(widthCm) || 0;
        const h = Number(heightCm) || 0;
        const areaM2 = ((w * h) / 10000).toFixed(2);
        const cnt = Number(count) || 1;
        const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
        const elementWord = cnt > 1 ? (isFr ? "éléments" : "elements") : (isFr ? "élément" : "element");
        if (extraLabel) {
            hudMetricsText.textContent = `${w} × ${h} cm · ${areaM2} m² · ${extraLabel}`;
        } else {
            hudMetricsText.textContent = `${w} × ${h} cm · ${areaM2} m² · ${cnt} ${elementWord}`;
        }
    }

    /* ---------------------------------------------------------
       ENGINE 1: CUSTOM LED NEON SIGNS (`neon-signs`)
    --------------------------------------------------------- */
    const neonState = {
        text: "YOUR NEON",
        align: "center",
        font: "'Dancing Script', cursive",
        colorHex: "#ec4899",
        colorName: "Hot Magenta",
        glowColor: "#ec4899",
        size: "Medium",
        widthCm: 75,
        sizeMult: 1.25,
        cutStyle: "shape",
        cutPrice: 0,
        finishStyle: "clear",
        finishPrice: 0,
        waterproof: "indoor",
        waterproofPrice: 0,
        dimmer: "inline",
        dimmerPrice: 0,
        mounting: "standoff",
        mountingPrice: 0
    };

    function initEngine1Neon() {
        const neonTextDisplay = document.getElementById("neonTextDisplay");
        const neonAcrylicSilhouette = document.getElementById("neonAcrylicSilhouette");
        const neonInputText = document.getElementById("neonInputText");
        const neonFontSelect = document.getElementById("neonFontSelect");
        const neonSelectedColorLabel = document.getElementById("neonSelectedColorLabel");

        function renderNeon() {
            if (!neonTextDisplay || !neonAcrylicSilhouette) return;

            // Render text
            const rawText = (neonInputText ? neonInputText.value : "") || "YOUR NEON";
            neonState.text = rawText;
            const lines = rawText.split("\n").filter(l => l.length > 0);
            const displayLines = lines.length ? lines : ["YOUR NEON"];

            neonTextDisplay.innerHTML = displayLines
                .map(line => `<span class="neon-line-span" style="font-family:${neonState.font};">${escapeHtml(line)}</span>`)
                .join("");

            neonTextDisplay.style.textAlign = neonState.align;

            // Lighting effects: ON vs OFF
            if (isNightMode) {
                neonTextDisplay.classList.remove("neon-glow-off");
                neonTextDisplay.classList.add("neon-glow-on");
                const col = neonState.glowColor;
                neonTextDisplay.style.color = "#ffffff";
                neonTextDisplay.style.textShadow = `
                    0 0 4px #ffffff,
                    0 0 10px ${col},
                    0 0 22px ${col},
                    0 0 45px ${col},
                    0 0 80px ${col}
                `;
            } else {
                neonTextDisplay.classList.remove("neon-glow-on");
                neonTextDisplay.classList.add("neon-glow-off");
                neonTextDisplay.style.color = "#a8a8af";
                neonTextDisplay.style.textShadow = "none";
            }

            // Acrylic Silhouette classes
            neonAcrylicSilhouette.className = "neon-acrylic-silhouette";
            if (neonState.cutStyle === "shape") neonAcrylicSilhouette.classList.add("neon-cut-shape");
            else if (neonState.cutStyle === "rect") neonAcrylicSilhouette.classList.add("neon-cut-rect");
            else if (neonState.cutStyle === "letter") neonAcrylicSilhouette.classList.add("neon-cut-letter");

            if (neonState.finishStyle === "clear") neonAcrylicSilhouette.classList.add("acrylic-finish-clear");
            else if (neonState.finishStyle === "black") neonAcrylicSilhouette.classList.add("acrylic-finish-black");
            else if (neonState.finishStyle === "mirror") neonAcrylicSilhouette.classList.add("acrylic-finish-mirror");

            // Dimensions calculation
            const charCount = rawText.replace(/\s+/g, "").length || 8;
            const approxWidth = Math.max(35, Math.min(220, Math.round(neonState.widthCm + (charCount > 10 ? (charCount - 10) * 3 : 0))));
            const approxHeight = Math.round(18 * displayLines.length * (neonState.sizeMult * 0.9));
            updateHudPill(approxWidth, approxHeight, charCount);

            // 2026 Commercial Schedule: Base 350 € + (charCount × 14 € scaled by size) + add-ons
            const charRate = 14 * neonState.sizeMult;
            const baseNeon = 350;
            const lettersTotal = charCount * charRate;
            const universalAddons = getUniversalServicesFee(approxWidth, approxHeight);
            const unitPrice = Math.round(
                baseNeon + lettersTotal + neonState.cutPrice + neonState.finishPrice +
                neonState.waterproofPrice + neonState.dimmerPrice + neonState.mountingPrice + universalAddons
            );

            customizerCalculatedUnitPrice = unitPrice;
            const qty = Math.max(1, parseInt(productQuantity?.value, 10) || 1);
            customizerCalculatedTotal = unitPrice * qty;

            if (productPriceDisplay) {
                productPriceDisplay.textContent = formatPrice(customizerCalculatedTotal);
                triggerPricePulse();
            }

            // Build payload for cart
            customizerItemPayload = {
                id: "neon-signs",
                name: `Enseigne Néon LED "${displayLines[0]}"`,
                price: customizerCalculatedUnitPrice,
                quantity: qty,
                size: `${neonState.size} (~${approxWidth} × ${approxHeight} cm)`,
                dimensions: `${approxWidth} × ${approxHeight} cm`,
                material: `Plexiglas Acrylique ${neonState.finishStyle.toUpperCase()}`,
                finish: `Néon LED Flex ${neonState.colorName} (${neonState.waterproof.toUpperCase()})`,
                customText: rawText,
                font: neonState.font,
                options: {
                    cutStyle: neonState.cutStyle,
                    finishStyle: neonState.finishStyle,
                    waterproof: neonState.waterproof,
                    dimmer: neonState.dimmer,
                    mounting: neonState.mounting,
                    colorHex: neonState.colorHex
                },
                image: "images/neon-signs.jpg"
            };
        }

        // Event: Text input
        if (neonInputText) {
            neonInputText.addEventListener("input", renderNeon);
        }

        // Event: Alignment buttons
        document.querySelectorAll(".neon-align-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-align-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.align = this.getAttribute("data-align") || "center";
                renderNeon();
            });
        });

        // Event: Font Select
        if (neonFontSelect) {
            neonFontSelect.addEventListener("change", function () {
                neonState.font = this.value;
                renderNeon();
            });
        }

        // Event: Circular Color Swatches
        document.querySelectorAll(".neon-color-swatch-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-color-swatch-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.colorHex = this.getAttribute("data-color") || "#ec4899";
                neonState.glowColor = this.getAttribute("data-glow") || "#ec4899";
                neonState.colorName = this.getAttribute("data-name") || "Hot Magenta";
                if (neonSelectedColorLabel) {
                    neonSelectedColorLabel.textContent = `Couleur active : ${neonState.colorName}`;
                }
                renderNeon();
            });
        });

        // Event: Size Tiers
        document.querySelectorAll(".neon-size-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-size-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.size = this.getAttribute("data-size") || "Medium";
                neonState.widthCm = parseFloat(this.getAttribute("data-width")) || 75;
                neonState.sizeMult = parseFloat(this.getAttribute("data-mult")) || 1.25;
                renderNeon();
            });
        });

        // Event: Cut Style
        document.querySelectorAll(".neon-cut-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-cut-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.cutStyle = this.getAttribute("data-cut") || "shape";
                neonState.cutPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderNeon();
            });
        });

        // Event: Finish Style
        document.querySelectorAll(".neon-finish-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-finish-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.finishStyle = this.getAttribute("data-finish") || "clear";
                neonState.finishPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderNeon();
            });
        });

        // Event: Waterproofing
        document.querySelectorAll(".neon-waterproof-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-waterproof-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.waterproof = this.getAttribute("data-env") || "indoor";
                neonState.waterproofPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderNeon();
            });
        });

        // Event: Dimmer
        document.querySelectorAll(".neon-dimmer-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-dimmer-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.dimmer = this.getAttribute("data-dimmer") || "inline";
                neonState.dimmerPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderNeon();
            });
        });

        // Event: Mounting
        document.querySelectorAll(".neon-mounting-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".neon-mounting-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                neonState.mounting = this.getAttribute("data-mount") || "standoff";
                neonState.mountingPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderNeon();
            });
        });

        renderNeon();
        return renderNeon;
    }

    /* ---------------------------------------------------------
       ENGINE 2: 3D RELIEF LETTERS & CUT LOGOS
       (`3d-raised-letters`, `pvc-cut-letters`, `acrylic-signs-displays`)
    --------------------------------------------------------- */
    const reliefState = {
        text: "YOUR SIGN",
        font: "'DM Sans', sans-serif",
        heightCm: 20,
        thickness: "10mm",
        thicknessPrice: 15,
        thicknessMult: 0.12,
        material: "pvc-white",
        materialColor: "#ffffff",
        materialPrice: 0,
        ralCode: "RAL 7016",
        led: "none",
        ledPrice: 0,
        fixing: "none",
        fixingPrice: 0,
        template: false,
        templatePrice: 0
    };

    function initEngine2Relief(product) {
        const reliefTextDisplay = document.getElementById("reliefTextDisplay");
        const reliefInputText = document.getElementById("reliefInputText");
        const reliefFontSelect = document.getElementById("reliefFontSelect");
        const reliefHeightSelect = document.getElementById("reliefHeightSelect");
        const reliefRalContainer = document.getElementById("reliefRalPickerRow");
        const reliefRalInput = document.getElementById("reliefRalCodeInput");
        const reliefColorPicker = document.getElementById("reliefHexColor");
        const reliefTemplateCheck = document.getElementById("reliefTemplateCheck");

        function renderRelief() {
            if (!reliefTextDisplay) return;

            const text = (reliefInputText ? reliefInputText.value : "") || "YOUR SIGN";
            reliefState.text = text;
            reliefTextDisplay.textContent = text;
            reliefTextDisplay.style.fontFamily = reliefState.font;
            reliefTextDisplay.style.color = reliefState.materialColor;

            // Thickness class
            reliefTextDisplay.className = "relief-text-render";
            reliefTextDisplay.classList.add(`thickness-${reliefState.thickness}`);

            // Lighting effects
            if (isNightMode) {
                if (reliefState.led === "halo") {
                    reliefTextDisplay.classList.add("relief-halo-backlit");
                } else if (reliefState.led === "front") {
                    reliefTextDisplay.classList.add("relief-front-lit");
                }
            }

            // Standoff hardware studs
            const standoffContainer = document.getElementById("standoffContainer");
            if (standoffContainer) {
                standoffContainer.classList.toggle("standoff-hardware-studs", reliefState.fixing === "standoff");
            }

            // Live dimensions
            const charCount = text.replace(/\s+/g, "").length || 6;
            const approxWidth = Math.round(charCount * (reliefState.heightCm * 0.65));
            const approxHeight = reliefState.heightCm;
            updateHudPill(approxWidth, approxHeight, charCount);

            // 2026 Commercial Schedule Calculations
            const universalAddons = getUniversalServicesFee(approxWidth, approxHeight);
            let unitPrice = 0;

            if (product.id === "lettres-3d-lumineuses") {
                // Item 6: Lettres 3D éclairées en façade: 365 € / lettre
                unitPrice = Math.round((charCount * 365) + reliefState.materialPrice + reliefState.fixingPrice + (reliefState.template ? 12 : 0) + universalAddons);
            } else if (product.id === "lettres-3d-retro-halo" || (product.id === "3d-raised-letters" && reliefState.led === "halo")) {
                // Item 7: Lettres 3D rétroéclairées (Halo): 390 € / lettre
                unitPrice = Math.round((charCount * 390) + reliefState.materialPrice + reliefState.fixingPrice + (reliefState.template ? 12 : 0) + universalAddons);
            } else if (product.id === "lettres-3d-lateral") {
                // Item 8: Lettres 3D éclairage latéral: 390 € / lettre
                unitPrice = Math.round((charCount * 390) + reliefState.materialPrice + reliefState.fixingPrice + (reliefState.template ? 12 : 0) + universalAddons);
            } else if (product.id === "lettres-3d-plateau-acp") {
                // Item 9: Lettres 3D sur plateau ACP: 600 € / m² backplate + letter rate
                const backplateM2 = Math.max(0.6, (approxWidth * (approxHeight * 2)) / 10000);
                unitPrice = Math.round((backplateM2 * 600) + (charCount * 35) + reliefState.materialPrice + reliefState.fixingPrice + universalAddons);
            } else if (product.id === "pvc-cut-letters") {
                // Item 4: Enseigne PVC / Forex: 100 € / m² (+19mm: +€30, +30mm: +€50)
                const baseM2 = Math.max(100, Math.round(((approxWidth * approxHeight) / 10000) * 100 * 8));
                unitPrice = Math.round(baseM2 + reliefState.thicknessPrice + reliefState.materialPrice + reliefState.fixingPrice + (reliefState.template ? 12 : 0) + universalAddons);
            } else {
                // Default 3D letters / plaques (Raw relief 180 € base + letter rate)
                const baseRate = Number(product.price) || 180;
                const letterRate = reliefState.led === "front" ? 365 : (reliefState.led === "halo" ? 390 : 35);
                const lettersFee = charCount > 1 ? (charCount - 1) * letterRate : 0;
                unitPrice = Math.round(baseRate + lettersFee + reliefState.thicknessPrice + reliefState.materialPrice + reliefState.fixingPrice + (reliefState.template ? 12 : 0) + universalAddons);
            }

            customizerCalculatedUnitPrice = unitPrice;
            const qty = Math.max(1, parseInt(productQuantity?.value, 10) || 1);
            customizerCalculatedTotal = unitPrice * qty;

            if (productPriceDisplay) {
                productPriceDisplay.textContent = formatPrice(customizerCalculatedTotal);
                triggerPricePulse();
            }

            customizerItemPayload = {
                id: product.id,
                name: `${product.name} "${text}" (${reliefState.thickness})`,
                price: customizerCalculatedUnitPrice,
                quantity: qty,
                size: `${reliefState.heightCm} cm de hauteur (${approxWidth} × ${approxHeight} cm)`,
                dimensions: `${approxWidth} × ${approxHeight} cm`,
                material: `${reliefState.material.toUpperCase()} (Relief ${reliefState.thickness})`,
                finish: reliefState.material === "ral-lacquer" ? `Laquage RAL ${reliefState.ralCode}` : "Finition Usine",
                customText: text,
                font: reliefState.font,
                options: {
                    heightCm: reliefState.heightCm,
                    thickness: reliefState.thickness,
                    material: reliefState.material,
                    led: reliefState.led,
                    fixing: reliefState.fixing,
                    template: reliefState.template,
                    ralCode: reliefState.ralCode
                },
                image: product.image || "images/3d-raised-letters.jpg"
            };
        }

        if (reliefInputText) reliefInputText.addEventListener("input", renderRelief);
        if (reliefFontSelect) {
            reliefFontSelect.addEventListener("change", function () {
                reliefState.font = this.value;
                renderRelief();
            });
        }
        if (reliefHeightSelect) {
            reliefHeightSelect.addEventListener("change", function () {
                reliefState.heightCm = parseFloat(this.value) || 20;
                renderRelief();
            });
        }

        // Relief method toggle (text vs upload)
        document.querySelectorAll(".relief-method-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".relief-method-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                const method = this.getAttribute("data-method") || "text";
                const textGroup = document.getElementById("reliefTextGroup");
                const uploadGroup = document.getElementById("reliefUploadGroup");
                if (textGroup) textGroup.style.display = (method === 'text') ? 'block' : 'none';
                if (uploadGroup) uploadGroup.style.display = (method === 'upload') ? 'block' : 'none';
                renderRelief();
            });
        });

        // Relief file upload handler
        const reliefFileInput = document.getElementById("reliefFileInput");
        if (reliefFileInput) {
            reliefFileInput.addEventListener("change", function () {
                const file = this.files && this.files[0];
                if (!file) return;
                const reliefLogoDisplay = document.getElementById("reliefLogoDisplay");
                if (reliefLogoDisplay && (file.type.startsWith('image/') || /\.svg$/i.test(file.name))) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        reliefLogoDisplay.src = e.target.result;
                        reliefLogoDisplay.style.display = 'block';
                        if (reliefTextDisplay) reliefTextDisplay.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Thickness buttons
        document.querySelectorAll(".relief-thick-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".relief-thick-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                reliefState.thickness = this.getAttribute("data-thick") || "10mm";
                reliefState.thicknessPrice = parseFloat(this.getAttribute("data-price")) || 15;
                if (reliefState.thickness === "5mm") reliefState.thicknessMult = 0.08;
                else if (reliefState.thickness === "10mm") reliefState.thicknessMult = 0.12;
                else if (reliefState.thickness === "19mm") reliefState.thicknessMult = 0.18;
                else if (reliefState.thickness === "30mm") reliefState.thicknessMult = 0.28;
                renderRelief();
            });
        });

        const reliefMaterialSelectEl = document.getElementById("reliefMaterialSelect");
        if (reliefMaterialSelectEl) {
            reliefMaterialSelectEl.addEventListener("change", function () {
                const val = this.value;
                reliefState.material = val;
                // Map material to color and price
                const matMap = {
                    'pvc-white': { color: '#ffffff', price: 0 },
                    'pvc-black': { color: '#1f2024', price: 0 },
                    'pvc-ral': { color: '#383e42', price: 35 },
                    'dibond-silver': { color: '#c0c0c0', price: 25 },
                    'dibond-gold': { color: '#c5a059', price: 30 },
                    'acrylic-clear': { color: '#e0f0ff', price: 20 },
                    'acrylic-frosted': { color: '#d8e8f0', price: 25 },
                    'acrylic-black': { color: '#1a1a1a', price: 25 }
                };
                const entry = matMap[val] || { color: '#ffffff', price: 0 };
                reliefState.materialColor = entry.color;
                reliefState.materialPrice = entry.price;

                // Show/hide RAL picker row
                const ralPickerRow = document.getElementById("reliefRalPickerRow");
                if (ralPickerRow) {
                    ralPickerRow.style.display = (val === 'pvc-ral') ? 'flex' : 'none';
                }
                renderRelief();
            });
        }

        if (reliefColorPicker) {
            reliefColorPicker.addEventListener("input", function () {
                reliefState.materialColor = this.value;
                renderRelief();
            });
        }
        if (reliefRalInput) {
            reliefRalInput.addEventListener("input", function () {
                reliefState.ralCode = this.value;
                renderRelief();
            });
        }

        // LED lighting buttons
        document.querySelectorAll(".relief-led-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".relief-led-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                reliefState.led = this.getAttribute("data-led") || "none";
                reliefState.ledPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderRelief();
            });
        });

        // Fixing buttons
        document.querySelectorAll(".relief-fix-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".relief-fix-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                reliefState.fixing = this.getAttribute("data-fix") || "none";
                reliefState.fixingPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderRelief();
            });
        });

        if (reliefTemplateCheck) {
            reliefTemplateCheck.addEventListener("change", function () {
                reliefState.template = this.checked;
                renderRelief();
            });
        }

        if (product.id === "lettres-3d-lumineuses") {
            reliefState.led = "front";
        } else if (product.id === "lettres-3d-retro-halo" || product.id === "lettres-3d-lateral") {
            reliefState.led = "halo";
        }
        document.querySelectorAll(".relief-led-btn").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-led") === reliefState.led);
        });

        renderRelief();
        return renderRelief;
    }

    /* ---------------------------------------------------------
       ENGINE 3: COMMERCIAL FACADES, SIGNS, AWNINGS, CEILINGS
       (`business-signs`, `aluminium-facades`, `retractable-awnings`, `suspended-ceilings`)
    --------------------------------------------------------- */
    const facadeState = {
        signText: "MY STOREFRONT",
        font: "'Montserrat', sans-serif",
        widthCm: 200,
        heightCm: 50,
        type: "lightbox",
        substrate: "alu-black",
        substratePrice: 0,
        lighting: "led-backlit",
        lightingPrice: 0,
        typePrice: 0,
        awningFabricColor: "#2b2f33",
        awningMotor: "manual",
        ceilingArea: 25,
        ceilingLedCount: 4
    };

    function initEngine3Facade(product) {
        const isAwning = product.id === "retractable-awnings";
        const isCeiling = product.id === "suspended-ceilings";

        if (isAwning) facadeState.type = "awning";
        else if (isCeiling) facadeState.type = "ceiling";
        else facadeState.type = "lightbox";

        // Set active button in Step 1
        document.querySelectorAll(".facade-type-btn").forEach(btn => {
            btn.classList.toggle("active", btn.getAttribute("data-type") === facadeState.type);
        });

        const facadeSignSubView = document.getElementById("facadeSignSubView");
        const facadeAwningSubView = document.getElementById("facadeAwningSubView");
        const facadeCeilingSubView = document.getElementById("facadeCeilingSubView");

        function updateSubViews() {
            const currentType = facadeState.type;
            if (facadeSignSubView) facadeSignSubView.style.display = (currentType !== "awning" && currentType !== "ceiling") ? "flex" : "none";
            if (facadeAwningSubView) facadeAwningSubView.style.display = (currentType === "awning") ? "flex" : "none";
            if (facadeCeilingSubView) facadeCeilingSubView.style.display = (currentType === "ceiling") ? "flex" : "none";
        }

        updateSubViews();

        function renderFacade() {
            updateSubViews();
            const currentType = facadeState.type;
            let unitPrice = Number(product.price) || 99;

            if (currentType === "awning") {
                // Awning rendering
                const fabricSlope = document.getElementById("awningFabricSlope");
                const valance = document.getElementById("awningValance");
                const valanceText = document.getElementById("awningValanceText");

                if (fabricSlope) fabricSlope.style.background = facadeState.awningFabricColor;
                if (valance) valance.style.background = facadeState.awningFabricColor;
                if (valanceText) {
                    valanceText.textContent = facadeState.signText || "LE BISTROT PARISIEN";
                    if (facadeState.font) valanceText.style.fontFamily = facadeState.font;
                }

                updateHudPill(facadeState.widthCm || 300, 250, 1, "Store Banne");

                const baseAwning = 299;
                const universalAddons = getUniversalServicesFee(facadeState.widthCm || 300, 250);
                unitPrice = Math.round(baseAwning + facadeState.substratePrice + facadeState.lightingPrice + facadeState.typePrice + universalAddons);

                customizerItemPayload = {
                    id: product.id,
                    name: `Store Banne Rétractable (${facadeState.widthCm} cm)`,
                    price: unitPrice,
                    quantity: Math.max(1, parseInt(productQuantity?.value, 10) || 1),
                    size: `${facadeState.widthCm} × 250 cm`,
                    dimensions: `${facadeState.widthCm} × 250 cm`,
                    material: "Toile Déperlante Anti-UV Dickson",
                    finish: `Motorisation & Éclairage: ${facadeState.lighting.toUpperCase()}`,
                    customText: facadeState.signText,
                    font: facadeState.font,
                    options: {
                        type: "awning",
                        widthCm: facadeState.widthCm,
                        lighting: facadeState.lighting
                    },
                    image: product.image
                };

            } else if (currentType === "ceiling") {
                // Ceiling rendering
                updateHudPill(500, 500, facadeState.ceilingArea, `${facadeState.ceilingArea} m²`);
                const universalAddons = getUniversalServicesFee(500, 500);

                unitPrice = Math.round(399 + (facadeState.ceilingArea * 28) + (facadeState.ceilingLedCount * 45) + facadeState.typePrice + universalAddons);

                customizerItemPayload = {
                    id: product.id,
                    name: `Faux Plafond Dalles 600×600 (${facadeState.ceilingArea} m²)`,
                    price: unitPrice,
                    quantity: Math.max(1, parseInt(productQuantity?.value, 10) || 1),
                    size: `${facadeState.ceilingArea} m²`,
                    dimensions: `${facadeState.ceilingArea} m²`,
                    material: "Dalles Minérales Acoustiques 600×600 mm",
                    finish: `${facadeState.ceilingLedCount} Pavés LED Inclus`,
                    customText: "",
                    options: {
                        type: "ceiling",
                        area: facadeState.ceilingArea,
                        ledCount: facadeState.ceilingLedCount
                    },
                    image: product.image
                };

            } else {
                // Business signs & Aluminium facades & Lightbox
                const facadeSignText = document.getElementById("facadeSignText");
                const ledTroughRamp = document.getElementById("ledTroughRamp");
                const facadeCassetteBoard = document.getElementById("facadeCassetteBoard");

                if (facadeSignText) {
                    facadeSignText.textContent = facadeState.signText || "BUSINESS SIGN";
                    if (facadeState.font) facadeSignText.style.fontFamily = facadeState.font;
                }

                if (ledTroughRamp) {
                    const isRamp = facadeState.lighting === "spotlights";
                    ledTroughRamp.style.display = isRamp ? "block" : "none";
                    ledTroughRamp.classList.toggle("ramp-active", isNightMode && isRamp);
                }

                if (facadeCassetteBoard) {
                    const isBacklit = facadeState.lighting === "led-backlit" || facadeState.lighting === "led-edge";
                    facadeCassetteBoard.classList.toggle("board-backlit-glow", isNightMode && isBacklit);
                }

                updateHudPill(facadeState.widthCm, facadeState.heightCm, 1, "Façade Magasin");

                const areaM2 = (facadeState.widthCm * facadeState.heightCm) / 10000;
                const universalAddons = getUniversalServicesFee(facadeState.widthCm, facadeState.heightCm);

                if (product.id === "caisson-lumineux") {
                    // Item 10: Caisson lumineux (Plexi + LED): 460 € / m² (PVC face: 390 € / m²)
                    const m2Rate = (facadeState.substrate === "plexi-opal") ? 460 : 390;
                    unitPrice = Math.round(Math.max(460, areaM2 * m2Rate) + facadeState.lightingPrice + universalAddons);
                } else if (product.id === "enseigne-drapeau") {
                    // Item 11: Enseigne drapeau double face: 850 € non-LED / 1 250 € LED
                    const isLed = (facadeState.lighting === "led-backlit" || facadeState.lighting === "led-edge");
                    const baseRate = isLed ? 1250 : 850;
                    unitPrice = Math.round(baseRate + facadeState.typePrice + universalAddons);
                } else if (product.id === "aluminium-facades") {
                    // Item 2: Enseigne ACP / Dibond: 175 € / m² brut / 225 € / m² imprimé
                    const isPrinted = (facadeState.substrate === "alu-anthracite" || facadeState.substrate === "plexi-opal");
                    const m2Rate = isPrinted ? 225 : 175;
                    unitPrice = Math.round(Math.max(175, areaM2 * m2Rate) + facadeState.lightingPrice + universalAddons);
                } else {
                    // Item 1: Enseigne 2D Plate (PVC / Alu): 100 € / m²
                    unitPrice = Math.round(Math.max(100, areaM2 * 100) + facadeState.substratePrice + facadeState.lightingPrice + universalAddons);
                }

                customizerItemPayload = {
                    id: product.id,
                    name: `${product.name} (${facadeState.widthCm} × ${facadeState.heightCm} cm)`,
                    price: unitPrice,
                    quantity: Math.max(1, parseInt(productQuantity?.value, 10) || 1),
                    size: `${facadeState.widthCm} × ${facadeState.heightCm} cm`,
                    dimensions: `${facadeState.widthCm} × ${facadeState.heightCm} cm`,
                    material: facadeState.substrate.toUpperCase(),
                    finish: `Éclairage ${facadeState.lighting.toUpperCase()}`,
                    customText: facadeState.signText,
                    font: facadeState.font,
                    options: {
                        type: currentType,
                        widthCm: facadeState.widthCm,
                        heightCm: facadeState.heightCm,
                        substrate: facadeState.substrate,
                        lighting: facadeState.lighting
                    },
                    image: product.image
                };
            }

            customizerCalculatedUnitPrice = unitPrice;
            const qty = Math.max(1, parseInt(productQuantity?.value, 10) || 1);
            customizerCalculatedTotal = unitPrice * qty;

            if (productPriceDisplay) {
                productPriceDisplay.textContent = formatPrice(customizerCalculatedTotal);
                triggerPricePulse();
            }
        }

        // Facade type buttons (lightbox, flat, awning, ceiling)
        document.querySelectorAll(".facade-type-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".facade-type-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                facadeState.type = this.getAttribute("data-type") || "lightbox";
                facadeState.typePrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderFacade();
            });
        });

        // Facade Substrate dropdown
        const facadeSubstrateSelect = document.getElementById("facadeSubstrateSelect");
        if (facadeSubstrateSelect) {
            facadeSubstrateSelect.addEventListener("change", function () {
                facadeState.substrate = this.value;
                const subMap = {
                    "alu-black": 0, "alu-white": 0, "alu-anthracite": 25,
                    "plexi-opal": 45, "awning-bordeaux": 0, "awning-anthracite": 0, "awning-striped": 30
                };
                facadeState.substratePrice = subMap[this.value] || 0;
                if (this.value === "awning-bordeaux") facadeState.awningFabricColor = "#800020";
                else if (this.value === "awning-anthracite") facadeState.awningFabricColor = "#2b2f33";
                else if (this.value === "awning-striped") facadeState.awningFabricColor = "repeating-linear-gradient(90deg, #2b2f33, #2b2f33 20px, #ffffff 20px, #ffffff 40px)";
                renderFacade();
            });
        }

        // Facade dimension buttons
        document.querySelectorAll(".facade-dim-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".facade-dim-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                facadeState.widthCm = parseFloat(this.getAttribute("data-w")) || 200;
                facadeState.heightCm = parseFloat(this.getAttribute("data-h")) || 50;
                renderFacade();
            });
        });

        // Facade text input
        const facadeTextInput = document.getElementById("facadeTextInput");
        if (facadeTextInput) {
            facadeTextInput.addEventListener("input", function () {
                facadeState.signText = this.value;
                renderFacade();
            });
        }

        // Facade font style select
        const facadeFontSelect = document.getElementById("facadeFontSelect");
        if (facadeFontSelect) {
            facadeFontSelect.addEventListener("change", function () {
                facadeState.font = this.value;
                renderFacade();
            });
        }

        // Facade lighting dropdown
        const facadeLightingSelect = document.getElementById("facadeLightingSelect");
        if (facadeLightingSelect) {
            facadeLightingSelect.addEventListener("change", function () {
                facadeState.lighting = this.value;
                const lightMap = {
                    "led-backlit": 0, "led-edge": 45, "spotlights": 65,
                    "awning-manual": 0, "awning-somfy": 140
                };
                facadeState.lightingPrice = lightMap[this.value] || 0;
                renderFacade();
            });
        }

        renderFacade();
        return renderFacade;
    }

    /* ---------------------------------------------------------
       ENGINE 4: COMMERCIAL FLEET VEHICLE GRAPHICS
       (`vehicle-wrapping`, `vehicle-lettering-graphics`)
    --------------------------------------------------------- */
    const vehicleState = {
        type: "medium-van",
        typePrice: 249,
        makeModel: "Renault Trafic L2H1",
        year: 2024,
        coverage: "lettering",
        coveragePrice: 0,
        windowOpt: "none",
        windowPrice: 0,
        brandingText: "MY BRAND FLEET",
        font: "'Libre Franklin', sans-serif",
        phone: "06 98 71 00 50",
        siret: "SIRET 848972827"
    };

    function initEngine4Vehicle(product) {
        const vehicleDoorText = document.getElementById("vehicleDoorText");
        const vehicleSiretText = document.getElementById("vehicleSiretText");
        const vehicleCoverageZone = document.getElementById("vehicleCoverageZone");
        const vehicleCoverageBadge = document.getElementById("vehicleCoverageBadge");
        const vehicleBrandingText = document.getElementById("vehicleBrandingText");
        const vehiclePhone = document.getElementById("vehiclePhone");
        const vehicleSiret = document.getElementById("vehicleSiret");

        function renderVehicle() {
            if (vehicleDoorText) {
                vehicleDoorText.textContent = vehicleState.brandingText;
                if (vehicleState.font) {
                    vehicleDoorText.setAttribute("font-family", vehicleState.font);
                    vehicleDoorText.style.fontFamily = vehicleState.font;
                }
            }
            if (vehicleSiretText) vehicleSiretText.textContent = `${vehicleState.phone} · ${vehicleState.siret}`;

            if (vehicleCoverageZone) {
                if (vehicleState.coverage === "lettering") {
                    vehicleCoverageZone.setAttribute("fill", "transparent");
                    vehicleCoverageZone.setAttribute("stroke-dasharray", "4 4");
                    vehicleCoverageZone.setAttribute("stroke", "#ff0f39");
                } else if (vehicleState.coverage === "half") {
                    vehicleCoverageZone.setAttribute("fill", "rgba(255, 15, 57, 0.45)");
                    vehicleCoverageZone.removeAttribute("stroke-dasharray");
                    vehicleCoverageZone.setAttribute("stroke", "#ff0f39");
                } else if (vehicleState.coverage === "full") {
                    vehicleCoverageZone.setAttribute("fill", "rgba(255, 15, 57, 0.75)");
                    vehicleCoverageZone.removeAttribute("stroke-dasharray");
                    vehicleCoverageZone.setAttribute("stroke", "#ffffff");
                }
            }

            if (vehicleCoverageBadge) {
                let covLabel = "Lettrage 2 Portes + Arrière";
                if (vehicleState.coverage === "half") covLabel = "Semi-Covering 50% Carrosserie Arrière";
                if (vehicleState.coverage === "full") covLabel = "Total Covering 100% Intégral";
                vehicleCoverageBadge.textContent = `${vehicleState.makeModel} · ${covLabel}`;
            }

            updateHudPill(508, 197, 1, `${vehicleState.makeModel}`);

            // 2026 Commercial Schedule: 350 € lettrage / 750 € 50% semi-covering / 1350 € 100% total covering
            let coverageBase = 350;
            if (vehicleState.coverage === "half") coverageBase = 750;
            else if (vehicleState.coverage === "full") coverageBase = 1350;

            let vanSizeExtra = 0;
            if (vehicleState.type === "medium-van") vanSizeExtra = 100;
            else if (vehicleState.type === "large-van") vanSizeExtra = 200;

            const universalAddons = getUniversalServicesFee(500, 200);
            const unitPrice = Math.round(coverageBase + vanSizeExtra + vehicleState.windowPrice + universalAddons);
            customizerCalculatedUnitPrice = unitPrice;
            const qty = Math.max(1, parseInt(productQuantity?.value, 10) || 1);
            customizerCalculatedTotal = unitPrice * qty;

            if (productPriceDisplay) {
                productPriceDisplay.textContent = formatPrice(customizerCalculatedTotal);
                triggerPricePulse();
            }

            customizerItemPayload = {
                id: product.id,
                name: `${product.name} — ${vehicleState.makeModel} (${vehicleState.coverage.toUpperCase()})`,
                price: unitPrice,
                quantity: qty,
                size: vehicleState.makeModel,
                dimensions: "Gabarit Vectoriel Constructeur",
                material: "Vinyle Coulé 3D Polymère Hexis / 3M",
                finish: `Finition Anti-UV Protection Carrosserie · Vitre: ${vehicleState.windowOpt.toUpperCase()}`,
                customText: `${vehicleState.brandingText} (${vehicleState.phone})`,
                font: vehicleState.font,
                options: {
                    vehicleType: vehicleState.type,
                    makeModel: vehicleState.makeModel,
                    coverage: vehicleState.coverage,
                    window: vehicleState.windowOpt
                },
                image: product.image
            };
        }

        const vehicleMakeModelInput = document.getElementById("vehicleMakeModel");
        if (vehicleMakeModelInput) {
            vehicleMakeModelInput.addEventListener("input", function () {
                vehicleState.makeModel = this.value || "Renault Trafic L2H1";
                renderVehicle();
            });
        }
        const vehicleYearInput = document.getElementById("vehicleYear");
        if (vehicleYearInput) {
            vehicleYearInput.addEventListener("input", function () {
                vehicleState.year = parseInt(this.value, 10) || 2024;
                renderVehicle();
            });
        }
        if (vehicleBrandingText) {
            vehicleBrandingText.addEventListener("input", function () {
                vehicleState.brandingText = this.value || "MY BRAND FLEET";
                renderVehicle();
            });
        }
        const vehicleFontSelect = document.getElementById("vehicleFontSelect");
        if (vehicleFontSelect) {
            vehicleFontSelect.addEventListener("change", function () {
                vehicleState.font = this.value;
                renderVehicle();
            });
        }
        if (vehiclePhone) {
            vehiclePhone.addEventListener("input", function () {
                vehicleState.phone = this.value;
                renderVehicle();
            });
        }
        if (vehicleSiret) {
            vehicleSiret.addEventListener("input", function () {
                vehicleState.siret = this.value;
                renderVehicle();
            });
        }

        document.querySelectorAll(".vehicle-type-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".vehicle-type-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                vehicleState.type = this.getAttribute("data-type") || "medium-van";
                vehicleState.typePrice = parseFloat(this.getAttribute("data-price")) || 249;
                renderVehicle();
            });
        });

        document.querySelectorAll(".vehicle-coverage-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".vehicle-coverage-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                vehicleState.coverage = this.getAttribute("data-cov") || "lettering";
                vehicleState.coveragePrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderVehicle();
            });
        });

        document.querySelectorAll(".vehicle-window-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".vehicle-window-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                vehicleState.windowOpt = this.getAttribute("data-win") || "none";
                vehicleState.windowPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderVehicle();
            });
        });

        renderVehicle();
        return renderVehicle;
    }

    /* ---------------------------------------------------------
       ENGINE 5: CUSTOM STICKERS & WALL MURALS
       (`adhesive-stickers`, `wall-stickers`)
    --------------------------------------------------------- */
    const stickerState = {
        widthCm: 15,
        heightCm: 15,
        text: "CUSTOM STICKER",
        font: "'Libre Franklin', sans-serif",
        cut: "die-cut",
        cutPrice: 0,
        sheen: "gloss",
        sheenPrice: 0,
        prepress: false
    };

    function initEngine5Stickers(product) {
        const stickerArtworkCanvas = document.getElementById("stickerArtworkCanvas");
        const stickerGraphicText = document.getElementById("stickerGraphicText");
        const stickerCutBadge = document.getElementById("stickerCutBadge");
        const stickerWidthCm = document.getElementById("stickerWidthCm");
        const stickerHeightCm = document.getElementById("stickerHeightCm");
        const stickerText = document.getElementById("stickerText");
        const stickerPrepressCheck = document.getElementById("stickerPrepressCheck");

        function renderStickers() {
            const rawText = (stickerText ? stickerText.value : "") || "CUSTOM STICKER";
            stickerState.text = rawText;
            if (stickerGraphicText) {
                stickerGraphicText.textContent = rawText;
                if (stickerState.font) stickerGraphicText.style.fontFamily = stickerState.font;
            }

            if (stickerArtworkCanvas) {
                stickerArtworkCanvas.className = "sticker-artwork-canvas";
                stickerArtworkCanvas.classList.add(`sticker-${stickerState.cut}`);
                stickerArtworkCanvas.classList.add(`sheen-${stickerState.sheen}`);
            }

            if (stickerCutBadge) {
                let badgeText = "✂️ Découpe à la Forme (Die-Cut)";
                if (stickerState.cut === "kiss-cut") badgeText = "✂️ Mi-Chair en Planche (Kiss-Cut)";
                if (stickerState.cut === "transfer") badgeText = "✂️ Lettrage Vinyle Transfert Échenillé";
                stickerCutBadge.textContent = badgeText;
            }

            updateHudPill(stickerState.widthCm, stickerState.heightCm, 1, "Sticker Pro");

            // Tiered volume discount logic:
            // 1–9: 100%, 10–49: -15%, 50–99: -30%, 100+: -45%
            const qty = Math.max(1, parseInt(productQuantity?.value, 10) || 1);
            let discountFactor = 1.0;
            const b1 = document.getElementById("bracket1");
            const b2 = document.getElementById("bracket2");
            const b3 = document.getElementById("bracket3");
            const b4 = document.getElementById("bracket4");

            [b1, b2, b3, b4].forEach(b => b?.classList.remove("active-bracket"));

            if (qty >= 100) {
                discountFactor = 0.55;
                if (b4) b4.classList.add("active-bracket");
            } else if (qty >= 50) {
                discountFactor = 0.70;
                if (b3) b3.classList.add("active-bracket");
            } else if (qty >= 10) {
                discountFactor = 0.85;
                if (b2) b2.classList.add("active-bracket");
            } else {
                if (b1) b1.classList.add("active-bracket");
            }

            const baseRate = Number(product.price) || 29;
            const areaCm2 = stickerState.widthCm * stickerState.heightCm;
            const surfaceRate = areaCm2 * 0.02;
            const prepressFee = stickerState.prepress ? 10 : 0;
            const calculatedUnit = Math.max(8, Math.round((baseRate + surfaceRate + stickerState.cutPrice + stickerState.sheenPrice + prepressFee) * discountFactor));

            customizerCalculatedUnitPrice = calculatedUnit;
            customizerCalculatedTotal = calculatedUnit * qty;

            if (productPriceDisplay) {
                productPriceDisplay.textContent = formatPrice(customizerCalculatedTotal);
                triggerPricePulse();
            }

            customizerItemPayload = {
                id: product.id,
                name: `${product.name} (${stickerState.widthCm} × ${stickerState.heightCm} cm)`,
                price: calculatedUnit,
                quantity: qty,
                size: `${stickerState.widthCm} × ${stickerState.heightCm} cm`,
                dimensions: `${stickerState.widthCm} × ${stickerState.heightCm} cm`,
                material: `Vinyle Adhésif Haute Résistance (${stickerState.sheen.toUpperCase()})`,
                finish: `Découpe ${stickerState.cut.toUpperCase()}`,
                customText: rawText,
                font: stickerState.font,
                options: {
                    widthCm: stickerState.widthCm,
                    heightCm: stickerState.heightCm,
                    cut: stickerState.cut,
                    sheen: stickerState.sheen,
                    prepress: stickerState.prepress
                },
                image: product.image
            };
        }

        if (stickerWidthCm) {
            stickerWidthCm.addEventListener("input", function () {
                stickerState.widthCm = parseFloat(this.value) || 15;
                renderStickers();
            });
        }
        if (stickerHeightCm) {
            stickerHeightCm.addEventListener("input", function () {
                stickerState.heightCm = parseFloat(this.value) || 15;
                renderStickers();
            });
        }
        if (stickerText) {
            stickerText.addEventListener("input", function () {
                renderStickers();
            });
        }
        const stickerFontSelect = document.getElementById("stickerFontSelect");
        if (stickerFontSelect) {
            stickerFontSelect.addEventListener("change", function () {
                stickerState.font = this.value;
                renderStickers();
            });
        }

        document.querySelectorAll(".sticker-cut-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".sticker-cut-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                stickerState.cut = this.getAttribute("data-cut") || "die-cut";
                stickerState.cutPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderStickers();
            });
        });

        document.querySelectorAll(".sticker-sheen-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".sticker-sheen-btn").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                stickerState.sheen = this.getAttribute("data-sheen") || "gloss";
                stickerState.sheenPrice = parseFloat(this.getAttribute("data-price")) || 0;
                renderStickers();
            });
        });

        if (stickerPrepressCheck) {
            stickerPrepressCheck.addEventListener("change", function () {
                stickerState.prepress = this.checked;
                renderStickers();
            });
        }

        renderStickers();
        return renderStickers;
    }

    /* ---------------------------------------------------------
       MAIN ROUTER & PRODUCT PAGE INITIALIZER
    --------------------------------------------------------- */
    let activeEngineRenderFn = null;

    function updateProductPage() {
        if (!window.location.pathname.includes("product.html") && !document.querySelector(".product-customizer-grid, #productTitle")) {
            return;
        }

        const product = getCurrentProduct();
        if (!product) return;

        selectedProduct = product;

        try {
            document.title = `${product.name} — MY STICKERZ ENSEIGNE`;
        } catch (e) {}

        // Populate Header Info
        const titleEl = document.getElementById("productTitle");
        const categoryBadge = document.getElementById("productCategoryText");
        const descEl = document.getElementById("productDescription");
        const breadcrumbEl = document.getElementById("breadcrumbProduct");

        if (titleEl) titleEl.textContent = product.name;
        if (categoryBadge) categoryBadge.textContent = (product.category || "ENSEIGNE").toUpperCase();
        if (descEl) descEl.textContent = product.description || "Solution visuelle haut de gamme sur-mesure.";
        if (breadcrumbEl) breadcrumbEl.textContent = product.name;

        // Route to Engine
        const engine = ENGINE_MAP[product.id] || "relief";
        activeCustomizerEngine = engine;

        // Hide all stage visualizers
        ["stageNeon", "stageRelief3D", "stageFacade", "stageVehicle", "stageStickers"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });

        // Hide all option panels
        ["panelEngineNeon", "panelEngineRelief", "panelEngineFacade", "panelEngineVehicle", "panelEngineStickers"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });

        // Mount active stage and panel
        if (engine === "neon") {
            const stage = document.getElementById("stageNeon");
            const panel = document.getElementById("panelEngineNeon");
            if (stage) stage.style.display = "flex";
            if (panel) panel.style.display = "block";
            activeEngineRenderFn = initEngine1Neon();

        } else if (engine === "relief") {
            const stage = document.getElementById("stageRelief3D");
            const panel = document.getElementById("panelEngineRelief");
            if (stage) stage.style.display = "block";
            if (panel) panel.style.display = "block";
            activeEngineRenderFn = initEngine2Relief(product);

        } else if (engine === "facade") {
            const stage = document.getElementById("stageFacade");
            const panel = document.getElementById("panelEngineFacade");
            if (stage) stage.style.display = "flex";
            if (panel) panel.style.display = "block";
            activeEngineRenderFn = initEngine3Facade(product);

        } else if (engine === "vehicle") {
            const stage = document.getElementById("stageVehicle");
            const panel = document.getElementById("panelEngineVehicle");
            if (stage) stage.style.display = "flex";
            if (panel) panel.style.display = "block";
            activeEngineRenderFn = initEngine4Vehicle(product);

        } else if (engine === "stickers") {
            const stage = document.getElementById("stageStickers");
            const panel = document.getElementById("panelEngineStickers");
            if (stage) stage.style.display = "flex";
            if (panel) panel.style.display = "block";
            activeEngineRenderFn = initEngine5Stickers(product);
        }

        // Configure Universal Services visibility based on engine/product
        const frameRow = document.getElementById("serviceFrameRow");
        const diffuserRow = document.getElementById("serviceDiffuserRow");
        if (frameRow) {
            frameRow.style.display = (engine === "facade" || engine === "relief" || product.id === "caisson-lumineux") ? "flex" : "none";
        }
        if (diffuserRow) {
            diffuserRow.style.display = (engine === "facade" || product.id === "caisson-lumineux" || product.id === "lettres-3d-lumineuses") ? "flex" : "none";
        }
    }

    // Universal Service Options change listeners
    const serviceInstallSelect = document.getElementById("serviceInstallationSelect");
    if (serviceInstallSelect) {
        serviceInstallSelect.addEventListener("change", function () {
            if (typeof activeEngineRenderFn === "function") activeEngineRenderFn();
        });
    }

    ["serviceElectricalCheck", "serviceSurveyCheck", "serviceFrameCheck", "serviceDiffuserCheck"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("change", function () {
                if (typeof activeEngineRenderFn === "function") activeEngineRenderFn();
            });
        }
    });

    // Wall background selector
    document.querySelectorAll(".wall-pill-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".wall-pill-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            const wallClass = this.getAttribute("data-wall") || "wall-anthracite";
            if (workshopStageBox) {
                workshopStageBox.classList.remove("wall-clean-white", "wall-anthracite", "wall-brick", "wall-wood");
                workshopStageBox.classList.add(wallClass);
            }
        });
    });

    // Day / Night Lighting toggle
    if (stageDayNightToggle) {
        stageDayNightToggle.addEventListener("click", function () {
            isNightMode = !isNightMode;
            if (workshopStageBox) {
                workshopStageBox.classList.toggle("mode-night", isNightMode);
            }
            this.classList.toggle("lights-active", isNightMode);

            const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
            if (dayNightIcon) dayNightIcon.textContent = isNightMode ? "🌙" : "☀️";
            if (dayNightLabel) dayNightLabel.textContent = isNightMode ? (isFr ? "Éclairage ON" : "Lights ON") : (isFr ? "Éclairage OFF" : "Lights OFF");

            // Trigger re-render of active visualizer
            if (typeof activeEngineRenderFn === "function") {
                activeEngineRenderFn();
            }
        });
    }

    // Stepper actions
    if (quantityMinus && productQuantity) {
        quantityMinus.addEventListener("click", function () {
            const cur = parseInt(productQuantity.value, 10) || 1;
            productQuantity.value = Math.max(1, cur - 1);
            if (typeof activeEngineRenderFn === "function") activeEngineRenderFn();
        });
    }

    if (quantityPlus && productQuantity) {
        quantityPlus.addEventListener("click", function () {
            const cur = parseInt(productQuantity.value, 10) || 1;
            productQuantity.value = Math.min(500, cur + 1);
            if (typeof activeEngineRenderFn === "function") activeEngineRenderFn();
        });
    }

    if (productQuantity) {
        productQuantity.addEventListener("change", function () {
            const cur = parseInt(productQuantity.value, 10) || 1;
            productQuantity.value = Math.max(1, Math.min(500, cur));
            if (typeof activeEngineRenderFn === "function") activeEngineRenderFn();
        });
    }

    // Add to Cart Action
    if (productAddToCart) {
        productAddToCart.addEventListener("click", function (e) {
            e.preventDefault();
            if (customizerItemPayload) {
                addToCart(customizerItemPayload);
            }
        });
    }

    // Buy Now Action
    if (buyNow) {
        buyNow.addEventListener("click", function (e) {
            e.preventDefault();
            if (customizerItemPayload) {
                addToCart(customizerItemPayload);
                window.location.href = "checkout.html";
            }
        });
    }

    // Wishlist Toggle
    if (productWishlist) {
        productWishlist.addEventListener("click", function (e) {
            e.preventDefault();
            if (customizerItemPayload) {
                const index = wishlist.findIndex(item => String(item.id) === String(customizerItemPayload.id));
                const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
                if (index !== -1) {
                    wishlist.splice(index, 1);
                    showToast(isFr ? "Retiré des favoris" : "Removed from wishlist", "♡");
                    this.classList.remove("active");
                } else {
                    wishlist.push(customizerItemPayload);
                    showToast(isFr ? "Ajouté aux favoris !" : "Added to wishlist!", "❤️");
                    this.classList.add("active");
                }
                saveWishlist();
                updateAllWishlistButtons();
            }
        });
    }

    window.onSiteLanguageChanged = function (lang) {
        updateProductPage();
        if (typeof activeEngineRenderFn === "function") {
            try { activeEngineRenderFn(); } catch (e) {}
        }
        const isFr = (lang === "fr" || (window.getCurrentLanguage && window.getCurrentLanguage() === "fr"));
        if (dayNightLabel) {
            dayNightLabel.textContent = isNightMode ? (isFr ? "Éclairage ON" : "Lights ON") : (isFr ? "Éclairage OFF" : "Lights OFF");
        }
        renderCartPage();
        renderWishlistPage();
        updateAllWishlistButtons();
    };

    /* =========================================================
       10. WISHLIST ENGINE & PAGE RENDERER
    ========================================================= */

    function getWishlistButtons() {
        return document.querySelectorAll(".wishlist, #productWishlist, .wishlist-product-button");
    }

    function isInWishlist(productId) {
        return wishlist.some(item => String(item.id) === String(productId));
    }

    function toggleWishlist(button) {
        const card = button.closest(".shop-product, .product-card");
        const product = card ? getCardProduct(button, card) : (customizerItemPayload || selectedProduct);
        if (!product) return;

        const index = wishlist.findIndex(item => String(item.id) === String(product.id));
        const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
        if (index !== -1) {
            wishlist.splice(index, 1);
            showToast(isFr ? `${product.name} retiré des favoris` : `${product.name} removed from wishlist`, "♡");
        } else {
            wishlist.push(product);
            showToast(isFr ? `${product.name} ajouté aux favoris !` : `${product.name} added to wishlist!`, "❤️");
        }

        saveWishlist();
        updateAllWishlistButtons();
        renderWishlistPage();
    }

    function updateAllWishlistButtons() {
        getWishlistButtons().forEach(button => {
            const card = button.closest(".shop-product, .product-card");
            const product = card ? getCardProduct(button, card) : selectedProduct;
            if (!product) return;

            const active = isInWishlist(product.id);
            button.classList.toggle("active", active);
            const icon = button.querySelector("i");
            if (icon) {
                icon.className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
            }
        });
    }

    getWishlistButtons().forEach(button => {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            toggleWishlist(button);
        });
    });

    function renderWishlistPage() {
        const grid = document.getElementById("wishlistGrid");
        const emptyState = document.getElementById("wishlistEmpty");
        const toolbar = document.getElementById("wishlistToolbar");
        const countText = document.getElementById("wishlistCount");

        if (!grid) return;

        if (wishlist.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            if (toolbar) toolbar.style.display = "none";
            grid.innerHTML = "";
            return;
        }

        if (emptyState) emptyState.style.display = "none";
        if (toolbar) toolbar.style.display = "flex";
        if (countText) {
            countText.textContent = wishlist.length === 1 ? "1 item" : `${wishlist.length} items`;
        }

        grid.innerHTML = wishlist.map((item, index) => `
            <div class="wishlist-card">
                <div class="card-img-wrap">
                    <a href="product.html?id=${encodeURIComponent(item.id || 'neon-signs')}">
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.src='images/company-logo.jpeg'">
                    </a>
                    <button type="button" class="wishlist-remove-btn" data-index="${index}" title="Remove item">×</button>
                </div>
                <div class="card-body">
                    <h3><a href="product.html?id=${encodeURIComponent(item.id || 'neon-signs')}">${escapeHtml(item.name)}</a></h3>
                    <div class="card-price">${formatPrice(item.price)}</div>
                    <div class="card-actions">
                        <button type="button" class="wishlist-to-cart-btn" data-index="${index}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join("");

        grid.querySelectorAll(".wishlist-remove-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = Number(this.getAttribute("data-index"));
                wishlist.splice(idx, 1);
                saveWishlist();
                renderWishlistPage();
                updateAllWishlistButtons();
            });
        });

        grid.querySelectorAll(".wishlist-to-cart-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const idx = Number(this.getAttribute("data-index"));
                if (wishlist[idx]) addToCart(wishlist[idx]);
            });
        });
    }

    const clearWishlistBtn = document.getElementById("clearWishlistBtn");
    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener("click", function () {
            if (wishlist.length === 0) return;
            wishlist = [];
            saveWishlist();
            renderWishlistPage();
            updateAllWishlistButtons();
        });
    }

    renderWishlistPage();

    /* =========================================================
       11. CART PAGE RENDERER
    ========================================================= */

    const cartContent = document.querySelector("#cartContent");

    function renderCartPage() {
        if (!cartContent) return;

        const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";

        if (!cart.length) {
            cartContent.innerHTML = `
                <div class="empty-cart" style="text-align:center;padding:70px 20px;background:#fbfbf9;border:1px dashed #dcdcd8;border-radius:8px;">
                    <div style="font-size:44px;margin-bottom:14px;">🛒</div>
                    <h2 style="font-family:var(--font-heading);font-size:28px;margin-bottom:8px;">${isFr ? "Votre panier est vide" : "Your cart is empty"}</h2>
                    <p style="color:#666;max-width:440px;margin:0 auto 24px;">${isFr ? "Explorez nos enseignes, néons LED et créations sur-mesure pour donner vie à votre projet." : "Browse our custom signage, neon signs, and stickers to create your project."}</p>
                    <a href="products.html" class="primary-button btn btn-dark" style="display:inline-block;padding:14px 28px;background:#111;color:#fff;text-decoration:none;border-radius:4px;font-weight:700;">
                        ${isFr ? "Découvrir tous nos produits →" : "Explore All Products →"}
                    </a>
                </div>
            `;
            updateCartCount();
            return;
        }

        const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        const shipping = subtotal > 0 ? 10 : 0;
        const tva = (subtotal + shipping) * 0.20;
        const totalTTC = subtotal + shipping + tva;
        const formatTTC = (val) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(val);

        let itemsHtml = "";
        cart.forEach((item, index) => {
            let details = "";
            if (item.dimensions || item.size) details += `<p><strong>${isFr ? "Dimensions" : "Size"}:</strong> ${escapeHtml(item.dimensions || item.size)}</p>`;
            if (item.material) details += `<p><strong>${isFr ? "Matériau" : "Material"}:</strong> ${escapeHtml(item.material)}</p>`;
            if (item.finish) details += `<p><strong>${isFr ? "Finition" : "Finish"}:</strong> ${escapeHtml(item.finish)}</p>`;
            if (item.customText) details += `<p><strong>${isFr ? "Texte" : "Text"}:</strong> ${escapeHtml(item.customText)}</p>`;
            if (item.font) details += `<p><strong>${isFr ? "Police" : "Font"}:</strong> ${escapeHtml(item.font)}</p>`;

            itemsHtml += `
                <div class="cart-item">
                    <div class="cart-product">
                        <img src="${escapeHtml(item.image || 'images/company-logo.jpeg')}" alt="${escapeHtml(item.name)}" class="cart-product-image" onerror="this.src='images/company-logo.jpeg'">
                        <div class="cart-product-info">
                            <h3>${escapeHtml(item.name)}</h3>
                            <p>${formatPrice(item.price)} each</p>
                            ${details}
                            <button type="button" class="remove-item" data-index="${index}">✕ ${isFr ? "Supprimer" : "Remove"}</button>
                        </div>
                    </div>
                    <div class="quantity-control">
                        <button type="button" class="cart-minus" data-index="${index}">−</button>
                        <span>${Number(item.quantity) || 1}</span>
                        <button type="button" class="cart-plus" data-index="${index}">+</button>
                    </div>
                    <div class="cart-item-total">
                        ${formatPrice((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                    </div>
                </div>
            `;
        });

        cartContent.innerHTML = `
            <div class="cart-layout">
                <div class="cart-items">${itemsHtml}</div>
                <aside class="cart-summary">
                    <h2>${isFr ? "Récapitulatif" : "Order Summary"}</h2>
                    <div class="summary-row"><span>${isFr ? "Sous-total HT" : "Subtotal HT"}</span><strong>${formatPrice(subtotal)}</strong></div>
                    <div class="summary-row"><span>${isFr ? "Livraison atelier HT" : "Shipping HT"}</span><strong>${formatPrice(shipping)}</strong></div>
                    <div class="summary-row"><span>${isFr ? "TVA (20%)" : "VAT (20%)"}</span><strong>${formatTTC(tva)}</strong></div>
                    <div class="summary-row total"><span>${isFr ? "Total TTC" : "Total TTC"}</span><strong>${formatTTC(totalTTC)} TTC</strong></div>
                    <a href="checkout.html" class="primary-button checkout-button" style="display:flex;align-items:center;justify-content:center;height:48px;background:#111;color:#fff;text-decoration:none;font-weight:700;border-radius:4px;margin-top:20px;">
                        ${isFr ? "Passer la Commande →" : "Proceed to Checkout →"}
                    </a>
                    <button type="button" id="clearCartBtn" style="display:block;width:100%;margin-top:10px;padding:10px;background:transparent;border:1px solid #ddd;color:#777;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;">
                        ${isFr ? "🗑️ Vider le panier" : "🗑️ Clear Cart"}
                    </button>
                </aside>
            </div>
        `;

        const clearCartBtn = cartContent.querySelector("#clearCartBtn");
        if (clearCartBtn) {
            clearCartBtn.addEventListener("click", () => {
                if (confirm(isFr ? "Êtes-vous sûr de vouloir vider le panier ?" : "Are you sure you want to clear your cart?")) {
                    cart = [];
                    saveCart();
                    renderCartPage();
                }
            });
        }

        cartContent.querySelectorAll(".cart-minus").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-index"));
                if (cart[i]) {
                    if ((Number(cart[i].quantity) || 1) <= 1) {
                        cart.splice(i, 1);
                    } else {
                        cart[i].quantity = (Number(cart[i].quantity) || 1) - 1;
                    }
                    saveCart();
                    renderCartPage();
                }
            });
        });

        cartContent.querySelectorAll(".cart-plus").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-index"));
                if (cart[i]) {
                    cart[i].quantity = (Number(cart[i].quantity) || 1) + 1;
                    saveCart();
                    renderCartPage();
                }
            });
        });

        cartContent.querySelectorAll(".remove-item").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = Number(btn.getAttribute("data-index"));
                cart.splice(i, 1);
                saveCart();
                renderCartPage();
            });
        });

        updateCartCount();
    }

    renderCartPage();

    /* =========================================================
       12. CATALOG FILTERS & SORT
    ========================================================= */

    const filterButtons = document.querySelectorAll(".filter-btn");
    const shopProductsList = document.querySelectorAll(".shop-product");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(item => item.classList.remove("active"));
            button.classList.add("active");

            const filter = button.getAttribute("data-filter");
            shopProductsList.forEach(function (product) {
                const category = product.getAttribute("data-category");
                const visible = filter === "all" || !filter || category === filter;
                product.style.display = visible ? "" : "none";
            });
        });
    });

    const sortSelect = document.querySelector("#sortProducts");
    const productsGrid = document.querySelector("#productsGrid");

    if (sortSelect && productsGrid) {
        sortSelect.addEventListener("change", function () {
            const sortValue = sortSelect.value;
            const products = Array.from(productsGrid.querySelectorAll(".shop-product"));

            products.sort(function (a, b) {
                const priceA = parseFloat(a.getAttribute("data-price")) || 0;
                const priceB = parseFloat(b.getAttribute("data-price")) || 0;
                const nameA = (a.getAttribute("data-name") || "").toLowerCase();
                const nameB = (b.getAttribute("data-name") || "").toLowerCase();

                if (sortValue === "low") return priceA - priceB;
                if (sortValue === "high") return priceB - priceA;
                if (sortValue === "name-az") return nameA.localeCompare(nameB);
                if (sortValue === "name-za") return nameB.localeCompare(nameA);
                return 0;
            });

            products.forEach(product => productsGrid.appendChild(product));
        });
    }

    /* =========================================================
       13. INTERACTIVE COOKIE CONSENT BANNER
    ========================================================= */

    function initCookieConsentBanner() {
        // Do not show on cookies.html itself
        if (window.location.pathname.includes("cookies.html")) return;

        let consent = null;
        try {
            consent = JSON.parse(localStorage.getItem("mse_cookie_consent"));
        } catch (e) {}

        if (consent && consent.updatedAt) return; // User already made a choice

        let banner = document.getElementById("cookieConsentBanner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "cookieConsentBanner";
            banner.className = "cookie-banner";
            banner.innerHTML = `
                <div class="cookie-banner-content">
                    <div class="cookie-banner-text">
                        🍪 <strong>Cookie & Privacy Settings:</strong> We use cookies to secure your session, store custom signage specs in your cart, and remember your language choice. You can customize your preferences anytime in our <a href="cookies.html">Cookie Policy</a>.
                    </div>
                    <div class="cookie-banner-buttons">
                        <button type="button" id="cookieAcceptAll" class="btn btn-dark" style="padding:10px 18px;font-size:12px;">Accept All</button>
                        <a href="cookies.html" class="btn" style="border:1px solid #777;color:#fff;padding:10px 16px;font-size:12px;">Customize</a>
                        <button type="button" id="cookieRejectNonEssential" class="btn" style="background:#333;color:#bbb;padding:10px 14px;font-size:12px;">Decline</button>
                    </div>
                </div>
            `;
            document.body.appendChild(banner);
        }

        setTimeout(() => banner.classList.add("show"), 800);

        document.getElementById("cookieAcceptAll")?.addEventListener("click", () => {
            localStorage.setItem("mse_cookie_consent", JSON.stringify({
                necessary: true, functional: true, analytics: true, marketing: true, updatedAt: new Date().toISOString()
            }));
            banner.classList.remove("show");
            showToast("Cookie preferences saved", "✓");
        });

        document.getElementById("cookieRejectNonEssential")?.addEventListener("click", () => {
            localStorage.setItem("mse_cookie_consent", JSON.stringify({
                necessary: true, functional: false, analytics: false, marketing: false, updatedAt: new Date().toISOString()
            }));
            banner.classList.remove("show");
            showToast("Non-essential cookies disabled", "🛡️");
        });
    }

    initCookieConsentBanner();

    /* =========================================================
       14. SECURE FORM SUBMISSIONS (NEWSLETTER & CONTACT)
    ========================================================= */

    const WEB3FORMS_ACCESS_KEY = "3509eeff-f80f-4989-8d2d-fe5f6ddcf417";

    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
            const emailInput = document.getElementById("newsletterEmail");
            const cleanEmail = sanitizeInput(emailInput ? emailInput.value : "");

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanEmail)) {
                showToast(isFr ? "Veuillez entrer une adresse email valide." : "Please enter a valid email address.", "⚠️");
                return;
            }

            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            const origText = submitBtn ? submitBtn.textContent : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "...";
            }

            try {
                const res = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        from_name: "MY STICKERZ ENSEIGNE Newsletter",
                        subject: "New Newsletter Subscription - MY STICKERZ ENSEIGNE",
                        email: cleanEmail
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showToast(isFr ? "Merci pour votre inscription !" : "Thank you for subscribing!", "✉️");
                    newsletterForm.reset();
                    if (window.DB && window.DB.saveNewsletterSubscriber) {
                        window.DB.saveNewsletterSubscriber(cleanEmail);
                    }
                } else {
                    showToast(data.message || (isFr ? "Échec de l'abonnement." : "Subscription failed."), "⚠️");
                }
            } catch (err) {
                showToast(isFr ? "Erreur réseau lors de l'inscription." : "Network error during subscription.", "⚠️");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText || "Subscribe →";
                }
            }
        });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const isFr = window.getCurrentLanguage && window.getCurrentLanguage() === "fr";
            const name = sanitizeInput(document.getElementById("contactName")?.value || "");
            const email = sanitizeInput(document.getElementById("contactEmail")?.value || "");
            const phone = sanitizeInput(document.getElementById("contactPhone")?.value || "");
            const subject = sanitizeInput(document.getElementById("contactSubject")?.value || "");
            const message = sanitizeInput(document.getElementById("contactMessage")?.value || "");

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showToast(isFr ? "Veuillez entrer une adresse email valide." : "Please enter a valid email address.", "⚠️");
                return;
            }

            const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
            if (phone && !phoneRegex.test(phone.replace(/\s+/g, ""))) {
                showToast(isFr ? "Numéro de téléphone français non valide (ex: 06 12 34 56 78)." : "Invalid French phone number format (e.g. 06 12 34 56 78).", "⚠️");
                return;
            }

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const origBtnText = submitBtn ? submitBtn.textContent : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = isFr ? "Envoi en cours..." : "Sending...";
            }

            try {
                const res = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        from_name: "MY STICKERZ ENSEIGNE Website",
                        subject: subject || (isFr ? "Demande de contact - MY STICKERZ ENSEIGNE" : "New Contact Inquiry - MY STICKERZ ENSEIGNE"),
                        name,
                        email,
                        phone,
                        message
                    })
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    showToast(isFr ? "Votre message a bien été envoyé ! Réponse sous 24h." : "Your message has been received! Our workshop will reply within 24h.", "✉️");
                    contactForm.reset();
                    if (window.DB && window.DB.saveContactMessage) {
                        window.DB.saveContactMessage({ name, email, phone, subject, message });
                    }
                } else {
                    showToast(data.message || (isFr ? "Erreur d'envoi du message." : "Could not send message."), "⚠️");
                }
            } catch (err) {
                showToast(isFr ? "Erreur de connexion. Veuillez nous contacter via WhatsApp ou réessayer." : "Connection error. Please contact us via WhatsApp or try again.", "⚠️");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origBtnText || (isFr ? "Envoyer le message" : "Send Message");
                }
            }
        });
    }

    /* =========================================================
       16. REAL WORK SERVICES PORTFOLIO & LIGHTBOX MODAL
    ========================================================= */

    function initServicesPortfolio() {
        const filterBtns = document.querySelectorAll(".portfolio-filter-btn");
        const items = document.querySelectorAll(".portfolio-item");

        if (filterBtns.length > 0 && items.length > 0) {
            filterBtns.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    filterBtns.forEach(function (b) { b.classList.remove("active"); });
                    btn.classList.add("active");
                    const filter = btn.getAttribute("data-portfolio-filter");

                    items.forEach(function (item) {
                        const itemCat = item.getAttribute("data-portfolio-category");
                        if (filter === "all" || itemCat === filter) {
                            item.style.display = "flex";
                        } else {
                            item.style.display = "none";
                        }
                    });
                });
            });
        }

        const modal = document.getElementById("serviceLightboxModal");
        const modalImg = document.getElementById("serviceLightboxImg");
        const modalTitle = document.getElementById("serviceLightboxTitle");
        const modalDesc = document.getElementById("serviceLightboxDesc");
        const modalWhatsapp = document.getElementById("serviceLightboxWhatsapp");
        const modalClose = document.getElementById("serviceLightboxClose");

        function openLightbox(imgSrc, title, desc) {
            if (!modal || !modalImg) return;
            modalImg.src = imgSrc;
            modalImg.alt = title || "Enseigne Atelier MY STICKERZ";
            if (modalTitle) modalTitle.textContent = title || "";
            if (modalDesc) modalDesc.textContent = desc || "";
            if (modalWhatsapp) {
                const encodedMsg = encodeURIComponent("Bonjour atelier MY STICKERZ, je souhaite un renseignement / devis concernant le projet : " + (title || ""));
                modalWhatsapp.href = "https://wa.me/33698710050?text=" + encodedMsg;
            }
            modal.classList.add("active");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        }

        function closeLightbox() {
            if (!modal) return;
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }

        document.querySelectorAll(".portfolio-zoom-trigger, .portfolio-btn-view").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                const card = btn.closest(".portfolio-item");
                if (!card) return;
                const img = card.querySelector(".portfolio-img-box img");
                const title = card.querySelector(".portfolio-info h4") ? card.querySelector(".portfolio-info h4").textContent : "";
                const desc = card.querySelector(".portfolio-info p") ? card.querySelector(".portfolio-info p").textContent : "";
                const fullSrc = card.getAttribute("data-full-img") || (img ? img.currentSrc || img.src : "");
                openLightbox(fullSrc, title, desc);
            });
        });

        if (modalClose) {
            modalClose.addEventListener("click", closeLightbox);
        }

        if (modal) {
            modal.addEventListener("click", function (e) {
                if (e.target === modal) {
                    closeLightbox();
                }
            });
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal && modal.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    /* =========================================================
       17. HERO CLIENT WORK SLIDESHOW
    ========================================================= */

    function initHeroSlideshow() {
        const slides = document.querySelectorAll(".hero-slide");
        const dots = document.querySelectorAll(".hero-dot");
        const prevBtn = document.getElementById("heroSlidePrev");
        const nextBtn = document.getElementById("heroSlideNext");
        const container = document.querySelector(".hero-slideshow-container");

        if (slides.length === 0) return;

        let currentIndex = 0;
        let timer = null;
        const intervalTime = 4800;

        function showSlide(index) {
            if (index < 0) {
                currentIndex = slides.length - 1;
            } else if (index >= slides.length) {
                currentIndex = 0;
            } else {
                currentIndex = index;
            }

            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === currentIndex);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === currentIndex);
            });
        }

        function nextSlide() {
            showSlide(currentIndex + 1);
        }

        function prevSlide() {
            showSlide(currentIndex - 1);
        }

        function startTimer() {
            stopTimer();
            timer = setInterval(nextSlide, intervalTime);
        }

        function stopTimer() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                prevSlide();
                startTimer();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                nextSlide();
                startTimer();
            });
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                showSlide(idx);
                startTimer();
            });
        });

        if (container) {
            container.addEventListener("mouseenter", stopTimer);
            container.addEventListener("mouseleave", startTimer);

            let touchStartX = 0;
            let touchEndX = 0;

            container.addEventListener("touchstart", function (e) {
                touchStartX = e.changedTouches[0].screenX;
                stopTimer();
            }, { passive: true });

            container.addEventListener("touchend", function (e) {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 45) {
                    nextSlide();
                } else if (touchEndX - touchStartX > 45) {
                    prevSlide();
                }
                startTimer();
            }, { passive: true });
        }

        startTimer();
    }

    /* =========================================================
       15. INITIALIZATION
    ========================================================= */

    updateProductPage();
    updateCartCount();
    updateAllWishlistButtons();
    initServicesPortfolio();
    initHeroSlideshow();
});
