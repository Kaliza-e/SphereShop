export function formatRWF(amount: number): string {
  const rounded = Math.floor(amount || 0);
  return `${rounded.toLocaleString("en-RW")} RWF`;
}

// Curated high quality real photography from Unsplash
export const SKU_IMAGE_MAP: Record<string, { main: string; gallery: string[]; brand: string; rating: number; reviews: number; specs: Record<string, string> }> = {
  "HDP-01": {
    main: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Sony",
    rating: 4.8,
    reviews: 142,
    specs: {
      "Model": "WH-CH720N Active Wireless",
      "Battery Life": "Up to 35 hours",
      "Connectivity": "Bluetooth 5.2 / 3.5mm AUX",
      "Weight": "192 g",
      "Warranty": "12 Months Official Rwanda Warranty"
    }
  },
  "CASE-02": {
    main: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Spigen",
    rating: 4.6,
    reviews: 89,
    specs: {
      "Material": "Shockproof Liquid Silicone",
      "Compatibility": "Universal 6.1\" - 6.7\"",
      "Finish": "Anti-fingerprint Soft Touch",
      "Wireless Charging": "MagSafe Compatible"
    }
  },
  "LAMP-03": {
    main: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Baseus",
    rating: 4.9,
    reviews: 64,
    specs: {
      "Illumination": "Adjustable 3000K-6000K CCT",
      "Power Source": "USB-C 10W",
      "Features": "Touch Dimming, Memory Mode",
      "Eye Care": "No Blue Light Hazard (RG0)"
    }
  },
  "CABLE-04": {
    main: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Anker",
    rating: 4.9,
    reviews: 310,
    specs: {
      "Length": "2.0 Meters (Nylon Braided)",
      "Max Output": "100W Power Delivery (5A)",
      "Data Transfer": "480 Mbps USB 2.0",
      "Durability": "25,000+ Bend Lifespan"
    }
  },
  "LOW-05": {
    main: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Anker PowerCore",
    rating: 4.7,
    reviews: 77,
    specs: {
      "Capacity": "10,000 mAh / 37Wh",
      "Output Ports": "1x USB-C PD (20W), 1x USB-A (18W)",
      "Recharge Time": "3.5 Hours via 18W Wall Charger",
      "Protection": "MultiProtect Safety System"
    }
  },
  "GIFT-08": {
    main: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Cloud Sphere Digital",
    rating: 5.0,
    reviews: 42,
    specs: {
      "Type": "Digital Code Delivered by SMS/Email",
      "Validity": "12 Months from Issue",
      "Refundable": "Non-Returnable (SRS-SEC)",
      "Redemption": "Online or In-Store Kigali"
    }
  },
  "OOS-09": {
    main: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Ugreen",
    rating: 4.8,
    reviews: 95,
    specs: {
      "Material": "Solid Aluminum Alloy + Silicone Pads",
      "Angle Adjustment": "Multi-angle 0° - 100°",
      "Weight": "180 g Foldable Pocket Size",
      "Compatibility": "Phones and Tablets 4.7\" - 12\""
    }
  },
  "DRAFT-07": {
    main: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
    ],
    brand: "Sphere Labs",
    rating: 4.5,
    reviews: 12,
    specs: {
      "Display": "1.4\" AMOLED Always-On",
      "Sensors": "Heart Rate, SpO2, Sleep Tracker",
      "Water Resistance": "5 ATM",
      "Battery": "7 Days Typical Use"
    }
  }
};

// Category fallback image generator
export function getProductMedia(sku: string, categoryId?: string, index = 0) {
  if (SKU_IMAGE_MAP[sku]) {
    return SKU_IMAGE_MAP[sku];
  }

  // Generate deterministic curated photography for pagination products
  const extraPool = [
    {
      main: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
      gallery: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80"],
      brand: "Dell Pro",
      rating: 4.7,
      reviews: 58,
      specs: { "Category": "Laptops & Computers", "Processor": "Intel Core i7", "RAM": "16GB DDR5", "Storage": "512GB NVMe SSD" }
    },
    {
      main: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      gallery: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"],
      brand: "Keychron",
      rating: 4.9,
      reviews: 112,
      specs: { "Switches": "Gateron Brown Mechanical", "Connectivity": "Bluetooth 5.1 / Type-C", "Backlight": "White LED" }
    },
    {
      main: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
      gallery: ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80"],
      brand: "Logitech",
      rating: 4.8,
      reviews: 93,
      specs: { "Sensor": "Darkfield 8000 DPI", "Battery": "Up to 70 days", "Scroll Wheel": "MagSpeed Electromagnetic" }
    },
    {
      main: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80",
      gallery: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"],
      brand: "SphereFit",
      rating: 4.6,
      reviews: 34,
      specs: { "Type": "Active Smartwatch", "Battery": "14 Days", "GPS": "Built-in Dual Band" }
    },
    {
      main: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      gallery: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"],
      brand: "Anker GaN",
      rating: 4.9,
      reviews: 180,
      specs: { "Power": "65W GaN III Fast Charge", "Ports": "2x USB-C, 1x USB-A", "Size": "Compact Travel Format" }
    }
  ];

  const hash = sku.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selected = extraPool[(hash + index) % extraPool.length];
  return selected;
}

export const KIGALI_DISTRICTS = [
  { id: "Gasabo", name: "Gasabo District", standardFee: 1500, expressFee: 3500 },
  { id: "Kicukiro", name: "Kicukiro District", standardFee: 1500, expressFee: 3500 },
  { id: "Nyarugenge", name: "Nyarugenge District", standardFee: 1500, expressFee: 3500 }
];

export const KIGALI_PICKUP_POINTS = [
  { id: "pk-1", name: "SphereShop Flagship Hub", address: "KG 7 Ave, Kigali Heights Ground Floor", hours: "Mon-Sat 08:30 - 19:30" },
  { id: "pk-2", name: "Downtown Kigali Collection Center", address: "KN 2 St, UTC Building Entrance B", hours: "Mon-Sat 09:00 - 18:30" },
  { id: "pk-3", name: "Remera Service Center", address: "KG 11 Ave, Near Amahoro Stadium", hours: "Mon-Sat 08:30 - 18:00" }
];
