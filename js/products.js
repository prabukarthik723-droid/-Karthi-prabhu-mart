/**
 * KarthiMart Product Catalog Data
 * Real high-resolution photography with embedded vector fallback
 */

// Helper to generate vector fallback graphics
function createProductSVG(bgGradStart, bgGradEnd, iconSVG, title, category) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)"/>
    <circle cx="200" cy="130" r="75" fill="rgba(255,255,255,0.14)"/>
    <g transform="translate(165, 95) scale(3)" stroke="#ffffff" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      ${iconSVG}
    </g>
    <rect y="235" width="100%" height="65" fill="rgba(0,0,0,0.5)"/>
    <text x="20" y="260" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#99f6e4" letter-spacing="1">${category.toUpperCase()}</text>
    <text x="20" y="282" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff">${title.length > 32 ? title.substring(0, 32) + '...' : title}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

const ICONS = {
  headphones: `<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>`,
  smartwatch: `<rect x="6" y="4" width="12" height="16" rx="3"/><path d="M9 1h6M9 23h6"/><circle cx="12" cy="12" r="3"/>`,
  keyboard: `<rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8.01"/><line x1="10" y1="8" x2="10" y2="8.01"/><line x1="14" y1="8" x2="14" y2="8.01"/><line x1="18" y1="8" x2="18" y2="8.01"/><line x1="6" y1="12" x2="6" y2="12.01"/><line x1="10" y1="12" x2="10" y2="12.01"/><line x1="14" y1="12" x2="14" y2="12.01"/><line x1="18" y1="12" x2="18" y2="12.01"/><line x1="7" y1="16" x2="17" y2="16"/>`,
  monitor: `<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
  chair: `<path d="M6 19v2M18 19v2M6 11h12M7 11V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6M5 11h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/>`,
  coffee: `<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>`,
  lamp: `<line x1="12" y1="2" x2="12" y2="12"/><path d="M5 12h14l-2-7H7l-2 7z"/><line x1="12" y1="12" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/>`,
  watch: `<circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 14.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83M7.49 6.65l.35-3.83A2 2 0 0 1 9.83 1h4.34a2 2 0 0 1 2 1.82l.35 3.83"/>`,
  hoodie: `<path d="M6 3l6 4 6-4 4 8-4 1-2-2v11H8V10L6 12 2 11l4-8z"/><path d="M10 7a2 2 0 0 0 4 0"/>`,
  wallet: `<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12a2 2 0 0 1 2-2h4v4h-4a2 2 0 0 1-2-2z"/>`,
  serum: `<path d="M10 2h4M12 2v4M8 8h8v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8z"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>`,
  cream: `<rect x="3" y="10" width="18" height="11" rx="2"/><path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"/>`,
  beans: `<circle cx="12" cy="12" r="8"/><path d="M12 4c2 4 2 12 0 16"/><path d="M12 4c-2 4-2 12 0 16"/>`,
  honey: `<path d="M8 3h8v3H8zM6 6h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6z"/><circle cx="12" cy="13" r="3"/><line x1="12" y1="10" x2="12" y2="16"/>`,
  bottle: `<path d="M9 2h6v3H9zM7 5h10l-1 16H8L7 5z"/><line x1="7" y1="10" x2="17" y2="10"/>`,
  yoga: `<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 6v12M16 6v12M4 12h16"/>`
};

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Aura Pro Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: 8999.00,
    originalPrice: 12999.00,
    stock: 24,
    rating: 4.8,
    reviewsCount: 142,
    sellerId: 2,
    sellerName: "Apex Electronics",
    badge: "Bestseller",
    featured: true,
    description: "Immersive spatial audio with dynamic head tracking, active noise cancellation up to 40dB, and 36-hour battery life. Designed with ultra-soft memory foam earcups.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#042f2e", "#0f766e", ICONS.headphones, "Aura Pro Headphones", "Electronics"),
    tags: ["audio", "wireless", "bluetooth", "music"]
  },
  {
    id: 2,
    name: "Zenith Ultra Slim Smartwatch 2.0",
    category: "Electronics",
    price: 4499.00,
    originalPrice: 6999.00,
    stock: 35,
    rating: 4.6,
    reviewsCount: 98,
    sellerId: 2,
    sellerName: "Apex Electronics",
    badge: "Trending",
    featured: true,
    description: "1.78\" AMOLED curved display with always-on mode, SpO2 blood oxygen monitor, 100+ sport modes, and IP68 water resistance. 10-day battery backup.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#1e1b4b", "#4338ca", ICONS.smartwatch, "Zenith Smartwatch 2.0", "Electronics"),
    tags: ["smartwatch", "fitness", "wearable"]
  },
  {
    id: 3,
    name: "Veloce Mechanical Gaming Keyboard RGB",
    category: "Electronics",
    price: 3299.00,
    originalPrice: 4999.00,
    stock: 18,
    rating: 4.7,
    reviewsCount: 64,
    sellerId: 2,
    sellerName: "Apex Electronics",
    badge: "Hot Deal",
    featured: false,
    description: "Hot-swappable custom red linear switches, PBT double-shot keycaps, aluminum frame, and customizable per-key RGB backlighting with dedicated media dial.",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#311042", "#701a75", ICONS.keyboard, "Veloce RGB Keyboard", "Electronics"),
    tags: ["keyboard", "gaming", "rgb", "pc"]
  },
  {
    id: 4,
    name: "Optix 27-inch 4K UHD IPS Frameless Monitor",
    category: "Electronics",
    price: 21999.00,
    originalPrice: 28999.00,
    stock: 12,
    rating: 4.9,
    reviewsCount: 53,
    sellerId: 2,
    sellerName: "Apex Electronics",
    badge: "Top Rated",
    featured: true,
    description: "Ultra HD 3840x2160 resolution, 99% sRGB color gamut, HDR400, USB-C 65W power delivery for laptops, and ergonomic height-adjustable swivel stand.",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#0c4a6e", "#0284c7", ICONS.monitor, "Optix 27\" 4K Monitor", "Electronics"),
    tags: ["monitor", "4k", "display", "workspace"]
  },
  {
    id: 5,
    name: "Aerocool Pro Ergonomic Office Chair",
    category: "Home & Living",
    price: 13499.00,
    originalPrice: 18999.00,
    stock: 15,
    rating: 4.7,
    reviewsCount: 89,
    sellerId: 4,
    sellerName: "Karthi Living Hub",
    badge: "Popular",
    featured: true,
    description: "Full mesh breathable backrest with dynamic 3D lumbar support, multi-adjustable 4D armrests, heavy-duty aluminum base, and 135-degree tilt recline mechanism.",
    image: "https://images.unsplash.com/photo-1580481077195-c3c2b972e276?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#14532d", "#15803d", ICONS.chair, "Aerocool Pro Chair", "Home & Living"),
    tags: ["chair", "ergonomic", "furniture", "home-office"]
  },
  {
    id: 6,
    name: "Barista Artisanal Ceramic Pour-Over Set",
    category: "Home & Living",
    price: 1899.00,
    originalPrice: 2499.00,
    stock: 40,
    rating: 4.9,
    reviewsCount: 77,
    sellerId: 4,
    sellerName: "Karthi Living Hub",
    badge: "New",
    featured: false,
    description: "Handcrafted matte ceramic dripper with thermal stability, heat-resistant borosilicate glass server (600ml), and walnut wood base collar.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#78350f", "#b45309", ICONS.coffee, "Ceramic Pour-Over Set", "Home & Living"),
    tags: ["coffee", "kitchen", "ceramic", "lifestyle"]
  },
  {
    id: 7,
    name: "Lumina Touch LED Desk Lamp with Wireless Charger",
    category: "Home & Living",
    price: 2299.00,
    originalPrice: 3499.00,
    stock: 28,
    rating: 4.5,
    reviewsCount: 42,
    sellerId: 4,
    sellerName: "Karthi Living Hub",
    badge: "Eco",
    featured: false,
    description: "5 color temperature modes, 7 brightness levels, built-in 15W Qi wireless charging pad, 45-minute auto-off timer, and flicker-free eye care technology.",
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#1e293b", "#334155", ICONS.lamp, "Lumina Touch LED Lamp", "Home & Living"),
    tags: ["lamp", "lighting", "charger", "decor"]
  },
  {
    id: 8,
    name: "Urban Minimalist Chronograph Leather Watch",
    category: "Fashion",
    price: 3799.00,
    originalPrice: 5999.00,
    stock: 20,
    rating: 4.8,
    reviewsCount: 110,
    sellerId: 5,
    sellerName: "Velvet & Thread",
    badge: "Bestseller",
    featured: true,
    description: "Surgical-grade 316L stainless steel casing, genuine Italian vegetable-tanned leather strap, sapphire crystal glass, and Japanese quartz chronograph movement.",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#451a03", "#78350f", ICONS.watch, "Chrono Leather Watch", "Fashion"),
    tags: ["watch", "fashion", "accessories", "leather"]
  },
  {
    id: 9,
    name: "Solstice Heavyweight Organic Cotton Hoodie",
    category: "Fashion",
    price: 2499.00,
    originalPrice: 3499.00,
    stock: 32,
    rating: 4.6,
    reviewsCount: 84,
    sellerId: 5,
    sellerName: "Velvet & Thread",
    badge: "Trending",
    featured: false,
    description: "420 GSM 100% GOTS certified French terry organic cotton. Double-layered hood, hidden side seam pockets, relaxed dropped-shoulder streetwear fit.",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#3b0764", "#6b21a8", ICONS.hoodie, "Cotton Hoodie", "Fashion"),
    tags: ["hoodie", "streetwear", "apparel", "cotton"]
  },
  {
    id: 10,
    name: "Strata Premium Heritage Leather Bifold Wallet",
    category: "Fashion",
    price: 1299.00,
    originalPrice: 1999.00,
    stock: 45,
    rating: 4.7,
    reviewsCount: 135,
    sellerId: 5,
    sellerName: "Velvet & Thread",
    badge: "Popular",
    featured: false,
    description: "Full-grain pull-up leather that patinas beautifully over time. Integrated RFID blocking protection, 8 card slots, quick-access thumb slot, and dual currency pocket.",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#713f12", "#a16207", ICONS.wallet, "Heritage Leather Wallet", "Fashion"),
    tags: ["wallet", "leather", "rfid", "accessories"]
  },
  {
    id: 11,
    name: "Radiance 20% Vitamin C + Ferulic Acid Serum",
    category: "Beauty & Wellness",
    price: 999.00,
    originalPrice: 1499.00,
    stock: 50,
    rating: 4.9,
    reviewsCount: 215,
    sellerId: 6,
    sellerName: "PureBotanica",
    badge: "Top Rated",
    featured: true,
    description: "Dermatologist-tested potent antioxidant formulation. Brightens dull complexion, fades dark spots, boosts collagen synthesis, and protects against environmental stress.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#c2410c", "#ea580c", ICONS.serum, "Radiance 20% Vit-C Serum", "Beauty & Wellness"),
    tags: ["skincare", "serum", "vitaminc", "beauty"]
  },
  {
    id: 12,
    name: "Botanical Deep Hydration Barrier Cream (50ml)",
    category: "Beauty & Wellness",
    price: 849.00,
    originalPrice: 1199.00,
    stock: 38,
    rating: 4.7,
    reviewsCount: 92,
    sellerId: 6,
    sellerName: "PureBotanica",
    badge: "Cruelty Free",
    featured: false,
    description: "Infused with 5 multi-molecular ceramides, hyaluronic acid, and centella asiatica extract. Deeply restores compromised skin barrier without greasiness.",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#065f46", "#047857", ICONS.cream, "Hydration Barrier Cream", "Beauty & Wellness"),
    tags: ["skincare", "cream", "moisturizer", "organic"]
  },
  {
    id: 13,
    name: "Single-Estate Coorg Dark Roast Arabica Beans (500g)",
    category: "Groceries & Gourmet",
    price: 699.00,
    originalPrice: 899.00,
    stock: 60,
    rating: 4.9,
    reviewsCount: 180,
    sellerId: 7,
    sellerName: "Karthi Farms & Roastery",
    badge: "Organic",
    featured: true,
    description: "Shade-grown at 3800 ft elevation in Coorg, Karnataka. Rich notes of dark chocolate, hazelnut, and toasted caramel with low acidity. Freshly roasted in small batches.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#3f2e18", "#78350f", ICONS.beans, "Coorg Arabica Beans 500g", "Groceries & Gourmet"),
    tags: ["coffee", "coorg", "arabica", "gourmet"]
  },
  {
    id: 14,
    name: "Raw Himalayan Multi-Flora Forest Honey (500g)",
    category: "Groceries & Gourmet",
    price: 549.00,
    originalPrice: 750.00,
    stock: 45,
    rating: 4.8,
    reviewsCount: 165,
    sellerId: 7,
    sellerName: "Karthi Farms & Roastery",
    badge: "Pure Raw",
    featured: false,
    description: "100% unpasteurized, unprocessed raw honey harvested by indigenous beekeepers in high-altitude Himalayan valleys. Natural enzyme rich and NMR-tested pure.",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#b45309", "#d97706", ICONS.honey, "Raw Himalayan Honey 500g", "Groceries & Gourmet"),
    tags: ["honey", "organic", "pure", "superfood"]
  },
  {
    id: 15,
    name: "HydroFlow Pro 1000ml Insulated Sports Bottle",
    category: "Sports & Fitness",
    price: 1199.00,
    originalPrice: 1799.00,
    stock: 30,
    rating: 4.8,
    reviewsCount: 88,
    sellerId: 2,
    sellerName: "Apex Electronics",
    badge: "Trending",
    featured: false,
    description: "Triple-walled vacuum insulation keeps drinks ice-cold for 24 hours or steaming hot for 12 hours. Sweat-free powder coating with leakproof chug lid.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#0369a1", "#0284c7", ICONS.bottle, "HydroFlow Sports Bottle", "Sports & Fitness"),
    tags: ["fitness", "bottle", "hydration", "gym"]
  },
  {
    id: 16,
    name: "EcoGrip 6mm Extra Dense Natural Rubber Yoga Mat",
    category: "Sports & Fitness",
    price: 1999.00,
    originalPrice: 2899.00,
    stock: 22,
    rating: 4.9,
    reviewsCount: 104,
    sellerId: 4,
    sellerName: "Karthi Living Hub",
    badge: "Top Rated",
    featured: false,
    description: "Biodegradable tree rubber with laser-engraved alignment lines. Supreme wet & dry non-slip grip, optimal joint cushioning, and complimentary carry strap.",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=700&q=80",
    fallbackImage: createProductSVG("#166534", "#15803d", ICONS.yoga, "EcoGrip Dense Yoga Mat", "Sports & Fitness"),
    tags: ["yoga", "fitness", "eco", "exercise"]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INITIAL_PRODUCTS, createProductSVG };
}
