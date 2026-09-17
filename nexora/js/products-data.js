/**
 * NEXORA ELECTRONICS — MASTER STORE CONFIGURATION & DATASET
 * Centralized Single Source of Truth for Showroom Metadata, Content & Products
 */

const NEXORA_CONFIG = {
  storeName: "NEXORA ELECTRONICS",
  brandTitle: "NEXORA",
  brandSub: "Explore Plus ⚡",
  tagline: "Technology That Fits Your Life.",
  subtitle: "Bengaluru's Premier Authorized Electronics Showroom & Digital Storefront",
  whatsappNumber: "919000000000",
  phone: "+91 90000 00000",
  email: "concierge@nexora-electronics.com",
  address: "123 Commercial Street, Tasker Town, Bengaluru, Karnataka, India - 560001",
  shortAddress: "123 Commercial Street, Bengaluru",
  openingHours: "Mon – Sat: 10:00 AM – 8:30 PM | Sun: 11:00 AM – 6:00 PM",
  currency: "₹",
  copyright: "© 2026 NEXORA ELECTRONICS. All rights reserved. Zero Payment Gateway Fees • WhatsApp Direct Showroom.",
  
  // Bank promotions & Festive Offers
  bankOffers: [
    { icon: '<i class="fa-solid fa-credit-card"></i>', title: "HDFC & ICICI Cards", desc: "Flat 10% Instant Discount on All Flagship Devices (Up to ₹7,500)" },
    { icon: '<i class="fa-solid fa-truck-fast"></i>', title: "Free Bengaluru Express", desc: "Same-Day Delivery or Fast-Track 30-Min Showroom Pickup Counter" },
    { icon: '<i class="fa-solid fa-shield-halved"></i>', title: "Official Brand Warranty", desc: "100% Genuine Sealed Tech with Hassle-Free Authorized Support" },
    { icon: '<i class="fa-solid fa-arrows-rotate"></i>', title: "Instant Trade-In", desc: "Exchange Old Smartphones & Laptops for up to ₹65,000 Spot Discount" }
  ],

  // Active Promo Discount Codes
  coupons: [
    { code: "NEXORA10", discountPercent: 10, maxDiscount: 10000, minCart: 50000, desc: "10% Off on Orders above ₹50,000" },
    { code: "FESTIVE2026", discountPercent: 5, maxDiscount: 5000, minCart: 20000, desc: "5% Off on Orders above ₹20,000" },
    { code: "VIPSHOWROOM", flatDiscount: 2000, minCart: 30000, desc: "Flat ₹2,000 Off on VIP Storefront Orders" }
  ],

  // Showroom Value Props / Trust Indicators
  trustFeatures: [
    { icon: '<i class="fa-solid fa-shield-halved"></i>', title: "100% Genuine Tech", desc: "Brand sealed with manufacturer serial warranty" },
    { icon: '<i class="fa-solid fa-bolt"></i>', title: "Instant Concierge", desc: "Direct WhatsApp booking & personalized quotes" },
    { icon: '<i class="fa-solid fa-store"></i>', title: "6,500 Sq.Ft Showroom", desc: "Live experience zones & acoustic audio rooms" },
    { icon: '<i class="fa-solid fa-calculator"></i>', title: "0% No-Cost EMI", desc: "Up to 24-month zero interest finance options" }
  ],

  // Showroom Experience Zones
  experienceZones: [
    { name: "Apple & Ultra-Flagship Island", icon: '<i class="fa-solid fa-mobile-screen"></i>', desc: "Experience the complete iPhone 17 Pro, iPad Pro, and M3/M4 Silicon Mac family live." },
    { name: "Acoustic Audio & Soundbar Lounge", icon: '<i class="fa-solid fa-headphones"></i>', desc: "Sound-isolated acoustically calibrated studio for Bose, Sony, and Dolby Atmos testing." },
    { name: "Esports & High-Refresh Gaming Rig", icon: '<i class="fa-solid fa-gamepad"></i>', desc: "240Hz OLED monitors, RTX 4090 rigs, PlayStation 5 Pro, and custom mechanical switches." },
    { name: "4K & 8K Cinema Display Wall", icon: '<i class="fa-solid fa-tv"></i>', desc: "Side-by-side comparison of Sony BRAVIA XR OLED, Samsung Neo QLED, and LG G4 panels." }
  ],

  // Frequently Asked Questions
  faqs: [
    { q: "How does the WhatsApp Showroom Ordering work?", a: "Add items to your Nexora cart and click 'Order via WhatsApp'. Our system instantly formats an itemized invoice quote with your selected variants, warranty, and delivery address, opening a direct chat with our showroom concierge manager." },
    { q: "Are all products 100% genuine with official brand warranty?", a: "Yes. Nexora is an authorized dealer for Apple, Sony, Samsung, Dell, Bose, Asus, and leading brands. Every product comes brand-sealed in retail packaging with standard manufacturer warranty valid nationwide." },
    { q: "Can I collect my device at the Bengaluru showroom today?", a: "Absolutely! Choose 'Fast-Track Showroom Pickup' during WhatsApp confirmation or checkout. Your unit will be unboxed, inspected, and ready at our 123 Commercial Street pickup desk within 30 minutes." },
    { q: "How do Trade-in and No-Cost EMI work?", a: "Use our interactive Trade-in and EMI calculators on the website. We accept working smartphones, tablets, and laptops for instant spot discounts, and support Bajaj Finserv, HDFC, and ICICI 0% EMI schemes." }
  ],

  // Social & Concierge Contact Links
  links: {
    whatsappUrl: "https://wa.me/919000000000?text=Hi%20Nexora,%20I%20would%20like%20to%20inquire%20about%20your%20products.",
    mapsUrl: "https://maps.google.com/?q=123+Commercial+Street+Bengaluru",
    home: "index.html",
    shop: "shop.html",
    product: "product.html",
    cart: "cart.html",
    checkout: "checkout.html",
    wishlist: "wishlist.html",
    about: "about.html",
    contact: "contact.html"
  }
};

const NEXORA_OCCASIONS = [
  { id: "all", name: "All Occasions", icon: '<i class="fa-solid fa-wand-magic-sparkles"></i>', tag: "Everyday Tech" },
  { id: "gaming", name: "Gaming & Esports", icon: '<i class="fa-solid fa-gamepad"></i>', tag: "144Hz+, RTX GPUs, Mechanical Keys" },
  { id: "work", name: "Work & Productivity", icon: '<i class="fa-solid fa-briefcase"></i>', tag: "Laptops, ANC Audio, Ergonomics" },
  { id: "creator", name: "Content Creation & Studio", icon: '<i class="fa-solid fa-video"></i>', tag: "4K Video, Mirrorless, Color Accurate" },
  { id: "cinema", name: "Home Cinema & Entertainment", icon: '<i class="fa-solid fa-film"></i>', tag: "OLED TVs, Dolby Atmos, Soundbars" },
  { id: "fitness", name: "Fitness & Outdoor", icon: '<i class="fa-solid fa-person-running"></i>', tag: "Smartwatches, Heart Rate, GPS" },
  { id: "student", name: "Student & Campus Tech", icon: '<i class="fa-solid fa-graduation-cap"></i>', tag: "Tablets, Ultrabooks, Power Banks" },
  { id: "gifting", name: "Festive & Luxury Gifting", icon: '<i class="fa-solid fa-gift"></i>', tag: "Premium Bundles & Curated Tech" }
];

const NEXORA_CATEGORIES = [
  { id: "smartphones", name: "Smartphones", count: 8, icon: '<i class="fa-solid fa-mobile-screen-button"></i>', image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=85" },
  { id: "laptops", name: "Laptops & Computing", count: 6, icon: '<i class="fa-solid fa-laptop"></i>', image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=85" },
  { id: "televisions", name: "Televisions & Entertainment", count: 5, icon: '<i class="fa-solid fa-tv"></i>', image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=85" },
  { id: "audio", name: "Audio & Headphones", count: 7, icon: '<i class="fa-solid fa-headphones"></i>', image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=85" },
  { id: "cameras", name: "Cameras & Lenses", count: 4, icon: '<i class="fa-solid fa-camera"></i>', image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=85" },
  { id: "gaming", name: "Gaming & Consoles", count: 5, icon: '<i class="fa-solid fa-gamepad"></i>', image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=85" },
  { id: "smartwatches", name: "Smartwatches & Wearables", count: 4, icon: '<i class="fa-solid fa-clock"></i>', image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=85" },
  { id: "tablets", name: "Tablets & iPads", count: 3, icon: '<i class="fa-solid fa-tablet-screen-button"></i>', image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=85" },
  { id: "home-appliances", name: "Smart Home Appliances", count: 4, icon: '<i class="fa-solid fa-house-laptop"></i>', image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=85" },
  { id: "computer-accessories", name: "Computer Accessories", count: 6, icon: '<i class="fa-solid fa-keyboard"></i>', image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=85" },
  { id: "mobile-accessories", name: "Mobile Accessories", count: 6, icon: '<i class="fa-solid fa-plug"></i>', image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=85" },
  { id: "networking", name: "Networking & Wi-Fi", count: 3, icon: '<i class="fa-solid fa-wifi"></i>', image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=85" },
  { id: "storage", name: "Storage & SSDs", count: 4, icon: '<i class="fa-solid fa-hard-drive"></i>', image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=85" },
  { id: "printers", name: "Printers & Scanners", count: 2, icon: '<i class="fa-solid fa-print"></i>', image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=85" },
  { id: "smarthome", name: "Smart Home & IoT", count: 4, icon: '<i class="fa-solid fa-lightbulb"></i>', image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=85" },
  { id: "wearables", name: "Fitness Bands", count: 3, icon: '<i class="fa-solid fa-heart-pulse"></i>', image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=85" }
];

const NEXORA_PRODUCTS = [
  {
    id: "iphone-17-pro",
    sku: "NX-APL-001",
    name: "Apple iPhone 17 Pro Max",
    brand: "Apple",
    category: "Smartphones",
    subcategory: "Flagship",
    description: "Forged in Grade 5 aerospace titanium with the ground-breaking A19 Pro 2nm silicon. Features an expansive 6.9-inch Super Retina XDR ProMotion display with quantum anti-reflective micro-coating, 5x optical telephoto periscope zoom, and next-generation satellite emergency relay.",
    shortDescription: "A19 Pro chip • 6.9\" Super Retina XDR • 48MP Fusion Triple Camera • Titanium chassis",
    price: 139900,
    originalPrice: 149900,
    discount: 7,
    currency: "₹",
    rating: 4.9,
    reviewCount: 342,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Apple India Comprehensive Warranty",
    occasions: ["work", "creator", "gifting"],
    tags: ["5G", "Titanium", "Flagship", "iOS", "OLED", "4K 120fps", "ProRAW"],
    isFeatured: true,
    isNew: true,
    isBestSeller: true,
    isDeal: false,
    frequentlyBoughtTogether: ["apple-watch-10", "bose-qc-ultra"],
    bundleDiscount: 2500,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Natural Titanium", "Black Titanium", "Desert Titanium", "White Titanium"],
      storage: ["256GB", "512GB", "1TB"],
      ram: ["8GB Unified"]
    },
    specifications: {
      display: "6.9\" Super Retina XDR OLED ProMotion (1-120Hz), 3000 nits peak",
      processor: "Apple A19 Pro (6-core CPU, 6-core GPU, 16-core Neural Engine)",
      camera: "48MP Fusion Main + 48MP Ultra-Wide + 48MP 5X Periscope Telephoto",
      battery: "Up to 33 hours video playback, MagSafe 25W Fast Wireless",
      ram: "8GB Unified High-Bandwidth Memory",
      storage: "256GB / 512GB / 1TB NVMe Flash",
      os: "iOS 19 with Apple Intelligence",
      connectivity: "5G Ultra Wideband, Wi-Fi 7, Bluetooth 5.4, USB-C 3.2 Gen 2 (10Gbps)"
    },
    features: [
      "Aerospace-grade Grade 5 titanium frame with contoured edges",
      "A19 Pro chip with hardware-accelerated ray tracing for console gaming",
      "Pro camera system with 48MP sensors across all three focal lengths",
      "Action Button customizable for instant camera, torch, and shortcuts",
      "Crash Detection and Satellite Emergency SOS"
    ]
  },
  {
    id: "samsung-galaxy-s26-ultra",
    sku: "NX-SAM-002",
    name: "Samsung Galaxy S26 Ultra 5G",
    brand: "Samsung",
    category: "Smartphones",
    subcategory: "Flagship",
    description: "The pinnacle of Android engineering. Featuring an ultra-bright 6.8-inch Dynamic AMOLED 2X flat display, integrated S-Pen stylus, Snapdragon 8 Elite Gen 4 for Galaxy, and an industry-leading 200MP Quad Telephoto imaging system.",
    shortDescription: "Snapdragon 8 Elite • 200MP Quad Camera • Built-in S-Pen • 5000mAh Battery",
    price: 129999,
    originalPrice: 144999,
    discount: 10,
    currency: "₹",
    rating: 4.8,
    reviewCount: 285,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Samsung India Manufacturer Warranty",
    occasions: ["work", "creator", "gaming"],
    tags: ["5G", "S-Pen", "200MP", "Android", "AMOLED", "Snapdragon", "AI Phone"],
    isFeatured: true,
    isNew: true,
    isBestSeller: true,
    isDeal: true,
    frequentlyBoughtTogether: ["sony-wh1000xm6", "samsung-990-pro-ssd"],
    bundleDiscount: 2000,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Titanium Gray", "Titanium Black", "Titanium Violet", "Titanium Yellow"],
      storage: ["256GB", "512GB", "1TB"],
      ram: ["12GB LPDDR5X", "16GB LPDDR5X"]
    },
    specifications: {
      display: "6.8\" QHD+ Dynamic AMOLED 2X, 1-120Hz Adaptive, 2600 nits, Corning Gorilla Armor",
      processor: "Qualcomm Snapdragon 8 Elite for Galaxy (3nm)",
      camera: "200MP Wide + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultra-Wide",
      battery: "5000mAh with 45W Super Fast Charging 2.0 & Fast Wireless 2.0",
      ram: "12GB / 16GB LPDDR5X",
      storage: "256GB / 512GB / 1TB UFS 4.0",
      os: "One UI 7 on Android 15 (7 Years OS Updates)",
      connectivity: "5G SA/NSA, Wi-Fi 7, Bluetooth 5.4, UWB, USB-C 3.2"
    },
    features: [
      "Built-in Bluetooth S-Pen with air gestures and 2.8ms low latency",
      "Galaxy AI Live Translate, Circle to Search, and Generative Photo Edit",
      "Armor Aluminum & Titanium structural frame with IP68 water resistance"
    ]
  },
  {
    id: "macbook-air-m3",
    sku: "NX-APL-003",
    name: "Apple MacBook Air 15\" (M3 Chip)",
    brand: "Apple",
    category: "Laptops",
    subcategory: "Ultrabook",
    description: "Impossibly thin and fast. Powered by Apple M3 silicon with an 8-core CPU and 10-core GPU. Liquid Retina display, MagSafe 3 charging, dual external display support, and silent fanless aluminum architecture.",
    shortDescription: "Apple M3 Chip • 15.3\" Liquid Retina • 18-hr Battery • 1.51 kg Fanless Design",
    price: 134900,
    originalPrice: 144900,
    discount: 7,
    currency: "₹",
    rating: 4.9,
    reviewCount: 198,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Apple India Warranty",
    occasions: ["work", "student", "creator"],
    tags: ["M3", "MacBook", "Ultrabook", "Apple Silicon", "Liquid Retina", "Fanless"],
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
    isDeal: false,
    frequentlyBoughtTogether: ["logitech-mx-master-3s", "keychron-q1-pro"],
    bundleDiscount: 1800,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Midnight", "Starlight", "Space Gray", "Silver"],
      storage: ["256GB", "512GB", "1TB SSD"],
      ram: ["16GB Unified", "24GB Unified"]
    },
    specifications: {
      display: "15.3\" Liquid Retina display with True Tone, 500 nits, P3 Wide color",
      processor: "Apple M3 (8-core CPU with 4 performance & 4 efficiency cores, 10-core GPU)",
      camera: "1080p FaceTime HD camera with advanced computational video",
      battery: "66.5Wh lithium-polymer battery with up to 18 hours battery life",
      ram: "16GB / 24GB Unified Memory",
      storage: "256GB / 512GB / 1TB PCIe SSD",
      os: "macOS Sequoia",
      connectivity: "MagSafe 3, 2x Thunderbolt / USB 4 ports, 3.5mm headphone jack, Wi-Fi 6E"
    },
    features: [
      "Fanless silent design running cool under heavy multitasking",
      "Spatial Audio six-speaker sound system with force-cancelling woofers",
      "Magic Keyboard with Touch ID sensor and Force Touch trackpad"
    ]
  },
  {
    id: "dell-xps-14",
    sku: "NX-DEL-004",
    name: "Dell XPS 14 OLED (Intel Core Ultra 7)",
    brand: "Dell",
    category: "Laptops",
    subcategory: "Ultrabook",
    description: "Crafted from machined aluminum and Gorilla Glass 3. Powered by Intel Core Ultra 7 with dedicated NPU for AI acceleration and NVIDIA GeForce RTX 4050 graphics, paired with a 3.2K 120Hz OLED InfinityEdge touchscreen.",
    shortDescription: "Intel Core Ultra 7 • RTX 4050 6GB • 3.2K 120Hz OLED Touch • CNC Aluminum",
    price: 199990,
    originalPrice: 224990,
    discount: 11,
    currency: "₹",
    rating: 4.7,
    reviewCount: 114,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Dell Premium Support with Onsite Service",
    occasions: ["work", "creator", "gaming"],
    tags: ["Intel Ultra", "RTX 4050", "OLED", "InfinityEdge", "AI PC", "Windows 11"],
    isFeatured: true,
    isNew: true,
    isBestSeller: false,
    isDeal: true,
    frequentlyBoughtTogether: ["logitech-mx-master-3s", "sony-wh1000xm6"],
    bundleDiscount: 3000,
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Platinum Silver", "Graphite"],
      storage: ["1TB NVMe PCIe 4.0", "2TB NVMe PCIe 4.0"],
      ram: ["32GB LPDDR5X (7467MHz)"]
    },
    specifications: {
      display: "14.5\" 3.2K (3200x2000) OLED Touch, 120Hz VRR, 400 nits, 100% DCI-P3",
      processor: "Intel Core Ultra 7 155H (16 cores, up to 4.8 GHz, Intel AI Boost NPU)",
      camera: "1080p FHD RGB-IR webcam with Windows Hello facial recognition",
      battery: "69.5Wh with ExpressCharge 100W Type-C adapter",
      ram: "32GB LPDDR5X Dual Channel",
      storage: "1TB / 2TB M.2 PCIe Gen 4 NVMe SSD",
      os: "Windows 11 Home / Pro",
      connectivity: "3x Thunderbolt 4 (Type-C), MicroSD card reader, Wi-Fi 7, Bluetooth 5.4"
    },
    features: [
      "Seamless glass touchpad with haptic feedback and touch function row",
      "NVIDIA Studio certified for Blender, Premiere Pro, and Unreal Engine",
      "Quad-speaker design with Waves MaxxAudio Pro and Dolby Atmos"
    ]
  },
  {
    id: "sony-bravia-xr-oled",
    sku: "NX-SNY-005",
    name: "Sony BRAVIA XR 65\" 4K HDR OLED TV (A95L Series)",
    brand: "Sony",
    category: "Televisions",
    subcategory: "OLED TV",
    description: "Sony's flagship QD-OLED TV. Powered by the Cognitive Processor XR with XR Triluminos Max producing unmatched color spectrum and infinite contrast. Features Acoustic Surface Audio+ where sound comes directly from the screen.",
    shortDescription: "QD-OLED 4K 120Hz • Cognitive Processor XR • Dolby Vision/Atmos • Acoustic Surface Audio+",
    price: 249990,
    originalPrice: 289990,
    discount: 14,
    currency: "₹",
    rating: 4.9,
    reviewCount: 88,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "2 Years Comprehensive Sony India Warranty with Free Wall Installation",
    occasions: ["cinema", "gaming", "gifting"],
    tags: ["QD-OLED", "4K HDR", "120Hz", "Dolby Vision", "PS5 Ready", "Google TV"],
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    frequentlyBoughtTogether: ["playstation-5-pro", "sony-wh1000xm6"],
    bundleDiscount: 5000,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Seamless Edge Black"],
      storage: ["65-inch Screen", "77-inch Screen"],
      ram: ["32GB Onboard Google TV Storage"]
    },
    specifications: {
      display: "65\" Quantum Dot OLED (3840x2160), 120Hz VRR, ALLM, IMAX Enhanced",
      processor: "Cognitive Processor XR with XR Clear Image",
      camera: "BRAVIA CAM Included for ambient room optimization & gesture control",
      sound: "Acoustic Surface Audio+ with Dual Actuators & Dual Subwoofers (60W)",
      ram: "4GB RAM / 32GB Internal Flash",
      os: "Google TV with Hands-Free Google Assistant",
      connectivity: "4x HDMI (2x HDMI 2.1 4K@120Hz, eARC), Wi-Fi 6, Bluetooth 5.2, Optical Audio"
    },
    features: [
      "Auto HDR Tone Mapping & Auto Genre Picture Mode built for PS5",
      "Dolby Vision, HDR10, HLG and Netflix Adaptive Calibrated Mode",
      "Eco Dashboard with energy saving presets and ambient light sensor"
    ]
  },
  {
    id: "sony-wh1000xm6",
    sku: "NX-SNY-006",
    name: "Sony WH-1000XM6 Wireless Noise-Cancelling Headphones",
    brand: "Sony",
    category: "Audio",
    subcategory: "Headphones",
    description: "Industry-leading noise cancellation engineered with Dual V2 processors and 8 microphones. Features custom 30mm carbon fiber precision drivers, LDAC high-res audio codec, 360 Reality Audio, and 30-hour battery life with ultra-fast charging.",
    shortDescription: "Industry-leading ANC • 30-Hr Battery • LDAC Hi-Res Audio • Multipoint Bluetooth",
    price: 29990,
    originalPrice: 34990,
    discount: 14,
    currency: "₹",
    rating: 4.9,
    reviewCount: 420,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Sony India Warranty",
    occasions: ["work", "creator", "student", "gifting"],
    tags: ["ANC", "LDAC", "Hi-Res", "Multipoint", "Bluetooth 5.3", "Audiophile"],
    isFeatured: true,
    isNew: true,
    isBestSeller: true,
    isDeal: false,
    frequentlyBoughtTogether: ["iphone-17-pro", "apple-watch-10"],
    bundleDiscount: 1500,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Obsidian Black", "Platinum Silver", "Midnight Blue"],
      storage: ["Standard Studio Edition"],
      ram: ["Integrated HD Noise Cancelling Processor QN1"]
    },
    specifications: {
      display: "Touch Sensor Control Panel with Speak-to-Chat function",
      processor: "Dual Processor V2 & HD Noise Cancelling Processor QN2",
      battery: "Up to 30 hours (ANC On) / 40 hours (ANC Off); 3 min charge = 3 hours playback",
      connectivity: "Bluetooth 5.3, LDAC, AAC, SBC, 3.5mm gold-plated jack, Multipoint (2 devices)"
    },
    features: [
      "Auto NC Optimizer automatically adjusts cancelling based on atmospheric pressure",
      "Precise Voice Pickup Technology with beamforming AI noise reduction",
      "Foldable ultra-comfort soft-fit leather headband and magnetic ear pads"
    ]
  },
  {
    id: "bose-qc-ultra",
    sku: "NX-BOS-007",
    name: "Bose QuietComfort Ultra Wireless Earbuds",
    brand: "Bose",
    category: "Audio",
    subcategory: "Earbuds",
    description: "Breakthrough spatialized audio with Bose Immersive Audio. World-class active noise cancellation customized specifically to the shape of your ear canals using CustomTune technology.",
    shortDescription: "Bose Immersive Spatial Audio • CustomTune ANC • 24-hr Total Battery • IPX4",
    price: 24900,
    originalPrice: 29900,
    discount: 17,
    currency: "₹",
    rating: 4.8,
    reviewCount: 165,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Bose India Warranty",
    occasions: ["fitness", "work", "student", "gifting"],
    tags: ["Bose", "TWS", "CustomTune", "ANC", "Spatial Audio", "IPX4"],
    isFeatured: false,
    isNew: true,
    isBestSeller: false,
    isDeal: true,
    frequentlyBoughtTogether: ["apple-watch-10", "iphone-17-pro"],
    bundleDiscount: 1000,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Black", "White Smoke", "Moonstone Blue"],
      storage: ["Standard Charging Case", "Wireless Charging Case"],
      ram: ["Custom DSP Engine"]
    },
    specifications: {
      display: "LED battery level indicators on charging case",
      processor: "Bose CustomTune Digital Signal Processor",
      battery: "6 hours per charge (up to 24 hours total with case); USB-C fast charging",
      connectivity: "Bluetooth 5.3, Snapdragon Sound certified, aptX Adaptive, AAC"
    },
    features: [
      "Immersive Audio mode places acoustic stage right in front of you",
      "9 pairs of eartips and stability bands included for personalized seal",
      "Simple touch controls for volume, track skip, and ANC modes"
    ]
  },
  {
    id: "playstation-5-pro",
    sku: "NX-SNY-008",
    name: "Sony PlayStation 5 Pro Console (2TB Edition)",
    brand: "Sony",
    category: "Gaming",
    subcategory: "Console",
    description: "The most powerful console in gaming history. Powered by PlayStation Spectral Super Resolution (PSSR) AI upscaling, 67% more compute units than base PS5, advanced hardware ray tracing, and ultra-high-speed 2TB NVMe SSD.",
    shortDescription: "2TB Ultra-High-Speed SSD • PSSR AI Upscaling • 4K 120fps Ray Tracing • Wi-Fi 7",
    price: 68990,
    originalPrice: 74990,
    discount: 8,
    currency: "₹",
    rating: 4.9,
    reviewCount: 310,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Sony India Warranty",
    occasions: ["gaming", "cinema", "gifting"],
    tags: ["PS5 Pro", "4K 120fps", "Ray Tracing", "PSSR", "DualSense", "2TB SSD"],
    isFeatured: true,
    isNew: true,
    isBestSeller: true,
    isDeal: false,
    frequentlyBoughtTogether: ["sony-bravia-xr-oled", "sony-wh1000xm6"],
    bundleDiscount: 4000,
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Classic Dual-Tone White/Black"],
      storage: ["2TB PCIe Gen 4 Custom SSD"],
      ram: ["16GB GDDR6 + 2GB DDR5"]
    },
    specifications: {
      processor: "AMD Ryzen Zen 2 (8-core/16-thread up to 3.85GHz) + RDNA 3 GPU (16.7 TFLOPs)",
      storage: "2TB Custom NVMe SSD (5.5GB/s Raw) + M.2 Expansion Slot",
      connectivity: "HDMI 2.1 (4K@120Hz, 8K, VRR), Wi-Fi 7, USB-C 10Gbps, Bluetooth 5.1"
    },
    features: [
      "PlayStation Spectral Super Resolution (PSSR) machine learning upscaler",
      "DualSense Wireless Controller with adaptive triggers and haptic feedback",
      "Tempest 3D AudioTech engine for spatial acoustic immersion"
    ]
  },
  {
    id: "apple-watch-10",
    sku: "NX-APL-009",
    name: "Apple Watch Series 10 (Titanium GPS + Cellular)",
    brand: "Apple",
    category: "Smartwatches",
    subcategory: "Smartwatch",
    description: "The thinnest Apple Watch ever with the biggest wide-angle OLED display. Features aerospace-grade polished titanium, ECG, blood oxygen, sleep apnea notifications, water depth gauge to 6m, and fast charging to 80% in 30 minutes.",
    shortDescription: "Polished Titanium • Wide-Angle OLED • Sleep Apnea Detection • Fast S10 SiP",
    price: 79900,
    originalPrice: 84900,
    discount: 6,
    currency: "₹",
    rating: 4.8,
    reviewCount: 142,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Apple India Warranty",
    occasions: ["fitness", "work", "gifting"],
    tags: ["Apple Watch", "Titanium", "ECG", "Cellular", "watchOS", "OLED"],
    isFeatured: true,
    isNew: true,
    isBestSeller: false,
    isDeal: false,
    frequentlyBoughtTogether: ["iphone-17-pro", "bose-qc-ultra"],
    bundleDiscount: 1500,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Natural Titanium", "Gold Titanium", "Slate Titanium"],
      storage: ["46mm Case", "42mm Case"],
      ram: ["64GB Internal Storage"]
    },
    specifications: {
      display: "Wide-Angle LTPO3 Always-On OLED, up to 2000 nits, sapphire crystal",
      processor: "Apple S10 SiP with 64-bit dual-core processor & 4-core Neural Engine",
      battery: "Up to 18 hours normal use / 36 hours in Low Power Mode",
      connectivity: "LTE Cellular, Wi-Fi 4, Bluetooth 5.3, UWB 2nd Gen, Apple Pay"
    },
    features: [
      "FDA-cleared ECG app, irregular rhythm notifications, and wrist temperature sensing",
      "Depth gauge and water temperature sensor for snorkeling down to 6 meters",
      "Double Tap gesture to answer calls, pause music, and scroll widgets hands-free"
    ]
  },
  {
    id: "ipad-pro-m4",
    sku: "NX-APL-010",
    name: "Apple iPad Pro 13\" (M4 Chip Ultra Retina XDR)",
    brand: "Apple",
    category: "Tablets",
    subcategory: "Tablet",
    description: "Unbelievably thin at just 5.1mm. Powered by the groundbreaking Apple M4 silicon with revolutionary Tandem OLED display technology, Apple Pencil Pro support, and studio-quality 4-speaker array.",
    shortDescription: "M4 Chip • Tandem OLED 1000 nits • 5.1mm Thin • Apple Pencil Pro Ready",
    price: 129900,
    originalPrice: 139900,
    discount: 7,
    currency: "₹",
    rating: 4.9,
    reviewCount: 95,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Apple India Warranty",
    occasions: ["creator", "work", "student"],
    tags: ["M4", "iPad Pro", "Tandem OLED", "Apple Pencil Pro", "ProMotion", "Tablet"],
    isFeatured: true,
    isNew: true,
    isBestSeller: false,
    isDeal: false,
    frequentlyBoughtTogether: ["macbook-air-m3", "apple-watch-10"],
    bundleDiscount: 2000,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Space Black", "Silver"],
      storage: ["256GB", "512GB", "1TB"],
      ram: ["8GB Unified", "16GB Unified"]
    },
    specifications: {
      display: "13\" Ultra Retina XDR Tandem OLED, 1-120Hz ProMotion, 1600 nits HDR",
      processor: "Apple M4 chip (9-core / 10-core CPU, 10-core GPU, 16-core NPU)",
      connectivity: "Thunderbolt / USB 4 port, Wi-Fi 6E, Bluetooth 5.3, Smart Connector"
    },
    features: [
      "Tandem OLED panel combining two OLED layers for extreme brightness and contrast",
      "Apple Pencil Pro support with barrel roll, squeeze, and haptic feedback",
      "Landscape 12MP Center Stage camera optimized for FaceTime & video meetings"
    ]
  },
  {
    id: "sony-alpha-7-iv",
    sku: "NX-SNY-011",
    name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera",
    brand: "Sony",
    category: "Cameras",
    subcategory: "Mirrorless",
    description: "The definitive hybrid mirrorless camera. 33MP full-frame Exmor R back-illuminated CMOS sensor, BIONZ XR processing engine, 4K 60p 10-bit 4:2:2 recording, S-Cinetone, and 759-point real-time phase detection AF.",
    shortDescription: "33MP Full-Frame • BIONZ XR • 4K 60p 10-Bit • Real-Time Eye AF",
    price: 219990,
    originalPrice: 242990,
    discount: 9,
    currency: "₹",
    rating: 4.9,
    reviewCount: 78,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "2 Years Official Sony India Camera Warranty",
    occasions: ["creator", "work", "gifting"],
    tags: ["Full-Frame", "Sony Alpha", "4K 60p", "Mirrorless", "S-Cinetone", "33MP"],
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
    isDeal: false,
    frequentlyBoughtTogether: ["samsung-990-pro-ssd", "macbook-air-m3"],
    bundleDiscount: 3500,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Magnesium Alloy Body Black"],
      storage: ["Body Only", "With 28-70mm Zoom Lens Kit"],
      ram: ["Dual CFexpress Type A & SD UHS-II Slots"]
    },
    specifications: {
      display: "3.0\" Vari-angle touch LCD (1.03M dots) + 3.68M-dot OLED EVF",
      processor: "BIONZ XR processor (8x more processing power than A7 III)",
      connectivity: "Full-size HDMI, USB-C 3.2 Gen 2 (10Gbps), Mic in, Headphone out, Wi-Fi 5GHz"
    },
    features: [
      "5.5-step 5-axis optical in-body image stabilization (IBIS)",
      "Real-time Eye AF for Humans, Animals, and Birds in both photo and video",
      "Direct 4K USB live streaming capability with UVC/UAC support"
    ]
  },
  {
    id: "logitech-mx-master-3s",
    sku: "NX-LOG-012",
    name: "Logitech MX Master 3S Wireless Performance Mouse",
    brand: "Logitech",
    category: "Computer Accessories",
    subcategory: "Mouse",
    description: "The gold standard for workspace productivity. Features 8,000 DPI Darkfield tracking that works on glass, MagSpeed electromagnetic scrolling (1,000 lines per second), Quiet Clicks, and Flow cross-computer control.",
    shortDescription: "8K DPI Glass Tracking • MagSpeed Scroll • Quiet Clicks • 70-Day Battery",
    price: 8995,
    originalPrice: 10995,
    discount: 18,
    currency: "₹",
    rating: 4.8,
    reviewCount: 520,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Logitech India Replacement Warranty",
    occasions: ["work", "creator", "student"],
    tags: ["Logitech", "MX Master", "Ergonomic", "Quiet Click", "8K DPI", "Bluetooth"],
    isFeatured: false,
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    frequentlyBoughtTogether: ["keychron-q1-pro", "macbook-air-m3"],
    bundleDiscount: 800,
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Space Graphite", "Pale Grey"],
      storage: ["Standard Ergonomic Right-Hand"],
      ram: ["Logi Bolt USB Receiver + Bluetooth LE"]
    },
    specifications: {
      processor: "Darkfield high precision sensor (200 to 8000 DPI)",
      battery: "500mAh rechargeable Li-Po; 1 min quick charge = 3 hours use",
      connectivity: "Bluetooth Low Energy & Logi Bolt USB Receiver (connect up to 3 PCs)"
    },
    features: [
      "MagSpeed wheel shifts automatically from ratchet to hyper-fast free spin",
      "Quiet Click buttons reduce click noise by 90% while keeping tactile feel",
      "Ergonomic sculpted silhouette supports palm and wrist throughout the day"
    ]
  },
  {
    id: "keychron-q1-pro",
    sku: "NX-KEY-013",
    name: "Keychron Q1 Pro Custom Wireless Mechanical Keyboard",
    brand: "Keychron",
    category: "Computer Accessories",
    subcategory: "Keyboard",
    description: "Fully custom QMK/VIA wireless mechanical keyboard in a full CNC machined 6063 aluminum body. Double-gasket mount design, hot-swappable Keychron K Pro Banana tactile switches, and south-facing RGB.",
    shortDescription: "Full CNC Aluminum • Hot-Swappable • QMK/VIA Programmable • Mac & Win",
    price: 18499,
    originalPrice: 20999,
    discount: 12,
    currency: "₹",
    rating: 4.9,
    reviewCount: 84,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "1 Year Official Keychron India Warranty",
    occasions: ["work", "gaming", "creator"],
    tags: ["Mechanical", "Keychron", "Hot-Swap", "QMK/VIA", "CNC Aluminum", "RGB"],
    isFeatured: false,
    isNew: true,
    isBestSeller: false,
    isDeal: false,
    frequentlyBoughtTogether: ["logitech-mx-master-3s", "macbook-air-m3"],
    bundleDiscount: 1200,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Carbon Black", "Silver Grey", "Navy Blue"],
      storage: ["K Pro Red Linear", "K Pro Banana Tactile", "K Pro Brown"],
      ram: ["Double-Shot KSA PBT Keycaps"]
    },
    specifications: {
      processor: "Ultra-low-power ARM Cortex-M4 32-bit STM32L432 (128KB Flash)",
      battery: "4000mAh rechargeable Li-polymer; up to 300 hours (backlight off)",
      connectivity: "Bluetooth 5.1 & Type-C wired (1000Hz polling rate in wired mode)"
    },
    features: [
      "Double-gasket acoustic mounting absorbs hollow resonance for deep sound profile",
      "Full VIA web app support for remapping any key or macro on macOS & Windows",
      "Customizable aluminum rotary encoder knob for volume, zoom, and brush sizing"
    ]
  },
  {
    id: "samsung-990-pro-ssd",
    sku: "NX-SAM-014",
    name: "Samsung 990 PRO 2TB NVMe M.2 PCIe 4.0 SSD (With Heatsink)",
    brand: "Samsung",
    category: "Storage",
    subcategory: "SSD",
    description: "The ultimate PCIe 4.0 NVMe SSD for high-performance computing, 4K/8K video editing, and PlayStation 5 expansion. Up to 7,450 MB/s sequential read and 6,900 MB/s write speeds with smart thermal management heatsink.",
    shortDescription: "7,450 MB/s Read • Integrated Heatsink • PS5 Compatible • V-NAND TLC",
    price: 18999,
    originalPrice: 22999,
    discount: 17,
    currency: "₹",
    rating: 4.9,
    reviewCount: 215,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "5 Years Official Samsung India Limited Warranty",
    occasions: ["gaming", "creator", "work"],
    tags: ["SSD", "NVMe", "PCIe 4.0", "7450MB/s", "PS5 Ready", "Heatsink"],
    isFeatured: false,
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    frequentlyBoughtTogether: ["playstation-5-pro", "dell-xps-14"],
    bundleDiscount: 1000,
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Heatsink Edition Black"],
      storage: ["1TB NVMe", "2TB NVMe", "4TB NVMe"],
      ram: ["2GB LPDDR4 DRAM Cache"]
    },
    specifications: {
      display: "Samsung Magician software dashboard with health monitoring",
      processor: "Samsung In-House Pascal Controller (8nm)",
      connectivity: "PCIe Gen 4.0 x4, NVMe 2.0 interface (Form Factor M.2 2280)"
    },
    features: [
      "Sequential read speeds up to 7,450 MB/s and write speeds up to 6,900 MB/s",
      "Slim integrated heatsink fits seamlessly inside PlayStation 5 console expansion slot",
      "50% improved power efficiency per watt compared to previous 980 PRO"
    ]
  },
  {
    id: "dyson-v15-detect",
    sku: "NX-DYS-015",
    name: "Dyson V15 Detect Absolute Cordless Vacuum Cleaner",
    brand: "Dyson",
    category: "Home Appliances",
    subcategory: "Cleaning",
    description: "Dyson's most powerful, intelligent cordless vacuum. Features a Fluffy Optic cleaner head that reveals invisible dust on hard floors, a piezo sensor that counts and sizes microscopic particles, and LCD screen proof of a deep clean.",
    shortDescription: "Laser Dust Reveal • 240 AW Suction • Piezo Particle Sensor • 60-min Runtime",
    price: 62900,
    originalPrice: 69900,
    discount: 10,
    currency: "₹",
    rating: 4.8,
    reviewCount: 92,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "2 Years Official Dyson India Warranty with Free Home Demo",
    occasions: ["cinema", "gifting"],
    tags: ["Dyson", "V15", "Cordless", "HEPA", "Smart Home", "Laser Detect"],
    isFeatured: true,
    isNew: false,
    isBestSeller: true,
    isDeal: false,
    frequentlyBoughtTogether: ["philips-hue-starter-kit"],
    bundleDiscount: 2000,
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["Yellow / Iron / Nickel"],
      storage: ["Absolute Full Tool Kit (7 Attachments)"],
      ram: ["Dyson Hyperdymium Motor (125,000 RPM)"]
    },
    specifications: {
      display: "Interactive LCD screen showing real-time run time & particle count breakdown",
      processor: "Piezo acoustic sensor sampling dust particles 15,000 times a second",
      battery: "Click-in 7-cell battery delivering up to 60 minutes of fade-free suction"
    },
    features: [
      "Calculates particle size and volume, automatically increasing suction when debris spikes",
      "Fully-sealed HEPA filtration traps 99.99% of microscopic particles down to 0.1 microns",
      "Hair screw tool de-tangles pet hair and long strands automatically"
    ]
  },
  {
    id: "philips-hue-starter-kit",
    sku: "NX-PHI-016",
    name: "Philips Hue White & Color Ambiance Smart Bulb Starter Kit",
    brand: "Philips",
    category: "Smart Home",
    subcategory: "Lighting",
    description: "Transform your living space with 16 million colors and tunable warm-to-cool white light. Includes 3 smart LED bulbs, Hue Bridge hub, and wireless smart dimmer switch with Apple HomeKit, Alexa, and Google Assistant compatibility.",
    shortDescription: "16 Million Colors • Hue Bridge Hub Included • Music & TV Sync • Apple HomeKit",
    price: 12999,
    originalPrice: 15999,
    discount: 19,
    currency: "₹",
    rating: 4.8,
    reviewCount: 135,
    availability: "In Stock",
    stockStatus: "In Stock",
    warranty: "2 Years Official Philips India Warranty",
    occasions: ["cinema", "gaming", "gifting"],
    tags: ["Smart Light", "Philips Hue", "HomeKit", "Zigbee", "16M Colors", "RGB"],
    isFeatured: false,
    isNew: false,
    isBestSeller: true,
    isDeal: true,
    frequentlyBoughtTogether: ["dyson-v15-detect", "sony-bravia-xr-oled"],
    bundleDiscount: 1000,
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=85"
    ],
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80",
    variants: {
      color: ["16 Million Colors + Tunable White"],
      storage: ["E27 Screw Base Kit", "B22 Bayonet Base Kit"],
      ram: ["Hue Bridge Included (Up to 50 lights)"]
    },
    specifications: {
      processor: "Zigbee Light Link Protocol + Bluetooth Low Energy",
      connectivity: "Ethernet Hue Bridge, Apple HomeKit, Amazon Alexa, Google Assistant, Matter"
    },
    features: [
      "Sync lighting with Spotify music, PC gaming, and TV movies seamlessly",
      "Automated wake up and sleep routines simulate natural sunrise and sunset",
      "Control lights away from home via Philips Hue mobile app"
    ]
  }
];

const NEXORA_REVIEWS = [
  {
    name: "Dr. Vikramaditya Rao",
    location: "Indiranagar, Bengaluru",
    rating: 5,
    product: "Apple iPhone 17 Pro Max 512GB",
    comment: "Ordered via WhatsApp in the morning after confirming stock. Showroom staff packed it with a sealed tempered glass and delivered it to my clinic in under 3 hours. Outstanding white-glove service!"
  },
  {
    name: "Ananya Deshmukh",
    location: "Koramangala, Bengaluru",
    rating: 5,
    product: "Dell XPS 14 OLED Laptop",
    comment: "I visited the Commercial Street showroom to compare the Dell XPS and MacBook M3 screens side-by-side. The hardware engineers gave honest benchmarks for my 3D rendering workflow. 10/10 showroom experience."
  },
  {
    name: "Karthik Subramaniam",
    location: "Whitefield, Bengaluru",
    rating: 5,
    product: "Sony BRAVIA XR 65\" OLED TV",
    comment: "The team coordinated same-day installation and PS5 HDR calibration at my apartment. The WhatsApp ordering process was smooth with zero payment gateway failures. Highly recommended!"
  },
  {
    name: "Pooja Hegde",
    location: "Jayanagar, Bengaluru",
    rating: 5,
    product: "Sony WH-1000XM6 Headphones",
    comment: "Genuine sealed piece with official warranty registration on the spot. Great showroom bundle savings too!"
  }
];

const NEXORA_FAQS = [
  {
    q: "How does the WhatsApp order process work without online payment?",
    a: "When you browse products and click 'Send Order to WhatsApp', our website automatically prepares an itemized text message containing your selected models, variants (color, storage, RAM), delivery address, and pricing. Our Bengaluru showroom concierge receives this instantly, verifies immediate stock allocation, and confirms your delivery or store pickup slot."
  },
  {
    q: "Are all products 100% genuine with official brand warranty?",
    a: "Yes, Nexora Electronics is an authorized retail distributor for Apple, Samsung, Sony, Dell, Lenovo, Bose, Dyson, and Philips. Every device is brand-new, sealed in box, and includes official manufacturer warranty and tax GST invoice."
  },
  {
    q: "Can I pick up my order in person from your Commercial Street showroom?",
    a: "Absolutely! Simply select 'Showroom Pickup' during checkout. Your order will be prepared at our fast-track counter at 123 Commercial Street, Bengaluru for instant handover."
  },
  {
    q: "Do you offer same-day delivery across Bengaluru?",
    a: "Yes, all order requests confirmed before 2:00 PM are delivered same-day across Bengaluru via our insured local courier fleet."
  }
];

const NEXORA_SERVICES = [
  { icon: "🛡️", title: "Authorized Warranty Care", description: "Direct liaison with official Apple, Sony, Samsung, and Dell service centers for hassle-free claims." },
  { icon: "🚚", title: "Same-Day Insured Delivery", description: "Expedited door-to-door delivery with live transit updates across Bengaluru." },
  { icon: "🛠️", title: "In-Store Hardware Setup", description: "Complimentary screen protection application, OS upgrades, and seamless data transfer." },
  { icon: "🏢", title: "Corporate Bulk Procurement", description: "Custom GST invoicing and volume quotes for tech startups, architecture firms, and studios." }
];

const NEXORA_BANNERS = {
  miniBanners: [
    {
      id: "banner-apple",
      tag: "APPLE ECOSYSTEM",
      badge: "FLAGSHIP SPOTLIGHT",
      title: "MacBook Air M3 & iPhone 17 Pro",
      sub: "Up to ₹12,000 Trade-In Bonus + 6 Months 0% No-Cost EMI with instant showroom setup.",
      btnText: "Explore Apple Hub",
      link: "shop.html?brand=Apple",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=450&q=80",
      accent: "cyan",
      bgGradient: "linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
      borderColor: "rgba(0, 240, 255, 0.3)"
    },
    {
      id: "banner-sony-oled",
      tag: "HOME CINEMA",
      badge: "CINEMA GRADE",
      title: "Sony BRAVIA XR 4K OLED",
      sub: "Complimentary 5.1 Dolby Atmos Soundbar with every 65\" & 77\" OLED master panel.",
      btnText: "Shop OLED TVs",
      link: "shop.html?category=Televisions",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=450&q=80",
      accent: "rose",
      bgGradient: "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)",
      borderColor: "rgba(244, 63, 94, 0.3)"
    },
    {
      id: "banner-gaming-rog",
      tag: "ESPORTS ARENA",
      badge: "240HZ ULTRA",
      title: "ASUS ROG & RTX 40-Series Gaming",
      sub: "Liquid-cooled compute, mechanical RGB keyboards, and ultra low-latency esports rigs.",
      btnText: "Explore Gaming Zone",
      link: "shop.html?category=Gaming",
      image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=450&q=80",
      accent: "emerald",
      bgGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)",
      borderColor: "rgba(16, 185, 129, 0.3)"
    },
    {
      id: "banner-studio-audio",
      tag: "STUDIO FIDELITY",
      badge: "AUDIOPHILE PICK",
      title: "Bose QC Ultra & Sony XM6",
      sub: "Custom acoustic tuning, lossless spatial Dolby Atmos, and class-leading noise cancellation.",
      btnText: "Discover Studio Audio",
      link: "shop.html?category=Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=450&q=80",
      accent: "violet",
      bgGradient: "linear-gradient(135deg, rgba(129, 140, 248, 0.12) 0%, rgba(236, 72, 153, 0.12) 100%)",
      borderColor: "rgba(129, 140, 248, 0.3)"
    }
  ],
  festiveBanner: {
    tag: "FESTIVE SHOWROOM EXCLUSIVE",
    badge: "LIMITED EDITION",
    title: "Bengaluru Cyber Tech Festival 2026",
    sub: "Up to 35% Showroom Discount • Extra 10% Instant Bank Cashback • Free 30-Min Fast-Track Pickup",
    couponCode: "FESTIVE2026",
    couponDesc: "Use coupon FESTIVE2026 for flat 5% off + combined trade-in vouchers",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
  }
};

const NEXORA_BRANDS = [
  { name: "Apple", icon: '<i class="fa-brands fa-apple"></i>', offer: "Official Authorized Reseller" },
  { name: "Sony", icon: '<i class="fa-solid fa-tv"></i>', offer: "BRAVIA & Alpha Flagship Hub" },
  { name: "Samsung", icon: '<i class="fa-solid fa-mobile-screen"></i>', offer: "Galaxy Galaxy AI & Neo QLED" },
  { name: "Dell", icon: '<i class="fa-solid fa-laptop"></i>', offer: "XPS & Alienware Station" },
  { name: "ASUS ROG", icon: '<i class="fa-solid fa-gamepad"></i>', offer: "Official Esports Arena Partner" },
  { name: "Bose", icon: '<i class="fa-solid fa-headphones"></i>', offer: "Acoustic Noise Cancelling Lounge" },
  { name: "LG", icon: '<i class="fa-solid fa-display"></i>', offer: "OLED evo Gallery Editions" },
  { name: "Nikon", icon: '<i class="fa-solid fa-camera"></i>', offer: "Z-Series Mirrorless Studio" },
  { name: "Lenovo", icon: '<i class="fa-solid fa-laptop-code"></i>', offer: "ThinkPad & Legion Flagships" },
  { name: "OnePlus", icon: '<i class="fa-solid fa-bolt"></i>', offer: "Never Settle Flagship Store" },
  { name: "JBL", icon: '<i class="fa-solid fa-volume-high"></i>', offer: "PartyBox & Studio Monitors" },
  { name: "Logitech", icon: '<i class="fa-solid fa-keyboard"></i>', offer: "MX Master & PRO G series" }
];

const NEXORA_INSTAGRAM_FEED = [
  {
    id: "reel-1",
    title: "Unboxing the Titanium iPhone 17 Pro Max in Commercial St. Showroom! 📱✨",
    caption: "First batch arrived brand-sealed in Bengaluru! Hands-on color comparison & camera test. 30-min pickup counter live.",
    author: "@nexora_electronics",
    views: "148K",
    likes: "14.2K",
    comments: "380",
    videoDuration: "0:45",
    productTag: "iPhone 17 Pro Max",
    productId: "phone-s26-ultra",
    thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=500&q=80",
    badge: "VIRAL REEL"
  },
  {
    id: "reel-2",
    title: "Sony BRAVIA XR 65\" 4K OLED vs Samsung Neo QLED Dark Room Shootout! 🎬🔥",
    caption: "Testing pure OLED blacks vs mini-LED peak brightness in our dedicated private cinema suite.",
    author: "@nexora_electronics",
    views: "112K",
    likes: "9.8K",
    comments: "215",
    videoDuration: "0:58",
    productTag: "Sony BRAVIA 65 OLED",
    productId: "tv-sony-65-oled",
    thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80",
    badge: "CINEMA TEST"
  },
  {
    id: "reel-3",
    title: "Customer Audio Blind Test: Bose QC Ultra vs Sony WH-1000XM6! 🎧🔊",
    caption: "We invited audio engineers into the Acoustic Lounge to test spatial Dolby Atmos fidelity.",
    author: "@nexora_electronics",
    views: "89K",
    likes: "7.6K",
    comments: "190",
    videoDuration: "0:42",
    productTag: "Sony WH-1000XM6",
    productId: "audio-sony-xm6",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
    badge: "ACOUSTIC DEMO"
  },
  {
    id: "reel-4",
    title: "240Hz OLED Gaming Rig Benchmark with ASUS ROG RTX 4090! 🎮⚡",
    caption: "Cyberpunk ray tracing at max settings in our Bengaluru showroom esports zone. 0 frame drops.",
    author: "@nexora_electronics",
    views: "195K",
    likes: "18.5K",
    comments: "540",
    videoDuration: "1:15",
    productTag: "ASUS ROG Strix Scar 18",
    productId: "laptop-dell-xps-14",
    thumbnail: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=500&q=80",
    badge: "ESPORTS DEMO"
  },
  {
    id: "reel-5",
    title: "MacBook Air M3 Dual-Display Studio Setup Guide for Creators! 💻🎨",
    caption: "How to connect dual 4K monitors to the M3 MacBook Air with zero lag. Tested live in Bengaluru.",
    author: "@nexora_electronics",
    views: "74K",
    likes: "6.3K",
    comments: "142",
    videoDuration: "0:50",
    productTag: "Apple MacBook Pro 16 M3",
    productId: "laptop-macbook-pro-16",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80",
    badge: "CREATOR TIPS"
  },
  {
    id: "reel-6",
    title: "30-Minute Fast-Track Showroom Pickup in Action! ⏱️📦",
    caption: "Ordered on WhatsApp at 2:00 PM → Unboxed, serial registered & ready at Counter #2 by 2:28 PM.",
    author: "@nexora_electronics",
    views: "52K",
    likes: "4.9K",
    comments: "98",
    videoDuration: "0:35",
    productTag: "Showroom Concierge",
    productId: "phone-s26-ultra",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=500&q=80",
    badge: "SHOWROOM LIVE"
  }
];

const NEXORA_HERO_SLIDES = [
  {
    tag: "SHOWROOM EXCLUSIVE FESTIVE SALE",
    badge: "FLAGSHIP LAUNCH",
    title: "Next-Gen Flagships.<br /><span style=\"color: var(--accent-cyan);\">Up to 30% Off</span>",
    sub: "Apple iPhone 17 Pro Max, MacBook Air M3, Sony 4K OLED & studio audio available with instant WhatsApp quotation & 30-minute Bengaluru pickup.",
    btnPrimary: "Explore Catalogue",
    btnPrimaryLink: "shop.html",
    btnSecondary: "Shop Smartphones",
    btnSecondaryLink: "shop.html?category=Smartphones",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"
  },
  {
    tag: "HOME CINEMA & SOUNDBAR BUNDLE",
    badge: "THEATER GRADE",
    title: "Sony 4K OLED Master Series.<br /><span style=\"color: #f59e0b;\">Save ₹45,000</span>",
    sub: "Get a free 5.1 Dolby Atmos Wireless Soundbar with every 65-inch or 77-inch BRAVIA XR OLED TV purchase this week.",
    btnPrimary: "View 4K OLED Deals",
    btnPrimaryLink: "shop.html?category=Televisions",
    btnSecondary: "Book VIP Demo Room",
    btnSecondaryLink: "javascript:void(0)",
    btnSecondaryAction: "window.NexoraApp.openBookingModal()",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80"
  },
  {
    tag: "PRO WORKSTATIONS & COMPUTING",
    badge: "SILICON M3 / M4",
    title: "MacBook Pro & Studio Rigs.<br /><span style=\"color: #10b981;\">₹12,000 Exchange Bonus</span>",
    sub: "Trade in your old Windows or Mac laptop for instant spot credit. Zero interest 12-month EMI with official warranty.",
    btnPrimary: "Explore Laptops",
    btnPrimaryLink: "shop.html?category=Laptops",
    btnSecondary: "Calculate Trade-In",
    btnSecondaryLink: "javascript:void(0)",
    btnSecondaryAction: "window.NexoraApp.openExchangeModal()",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"
  }
];

if (typeof window !== 'undefined') {
  window.NEXORA_CONFIG = NEXORA_CONFIG;
  window.NEXORA_CATEGORIES = NEXORA_CATEGORIES;
  window.NEXORA_OCCASIONS = NEXORA_OCCASIONS;
  window.NEXORA_PRODUCTS = NEXORA_PRODUCTS;
  window.NEXORA_REVIEWS = NEXORA_REVIEWS;
  window.NEXORA_FAQS = NEXORA_FAQS;
  window.NEXORA_SERVICES = NEXORA_SERVICES;
  window.NEXORA_BANNERS = NEXORA_BANNERS;
  window.NEXORA_BRANDS = NEXORA_BRANDS;
  window.NEXORA_INSTAGRAM_FEED = NEXORA_INSTAGRAM_FEED;
  window.NEXORA_HERO_SLIDES = NEXORA_HERO_SLIDES;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NEXORA_CONFIG,
    NEXORA_CATEGORIES,
    NEXORA_OCCASIONS,
    NEXORA_PRODUCTS,
    NEXORA_REVIEWS,
    NEXORA_FAQS,
    NEXORA_SERVICES,
    NEXORA_BANNERS,
    NEXORA_BRANDS,
    NEXORA_INSTAGRAM_FEED,
    NEXORA_HERO_SLIDES
  };
}



