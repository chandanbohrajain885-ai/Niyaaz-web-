/* =========================================================================
   NIYAAZ — SITE DATA & CONFIG  (single source of truth)
   Edit this file to change menu, prices, branches, phone numbers, offers.
   Items with  verify:true  have prices/details that are PLACEHOLDERS and
   must be confirmed with Niyaaz management before go-live.
   ========================================================================= */
window.NIYAAZ = {
  config: {
    brand: "Niyaaz",
    tagline: "The Original Belgaum Biryani",
    since: 1989,
    currency: "₹",
    // WhatsApp number that receives online orders / bookings (country code, no +).
    // REPLACE with Niyaaz's official WhatsApp Business number before go-live.
    orderWhatsApp: "917066022789",
    googleReviewUrl: "https://www.google.com/search?q=Niyaaz+Restaurant+Belgaum+reviews",
    instagram: "https://www.instagram.com/explore/search/keyword/?q=niyaaz",
    loyaltyRate: 10,           // 1 Royal point per ₹10 spent
    pointValue: 0.5,           // 1 point = ₹0.50 on redemption
    deliveryFee: 40,
    freeDeliveryAbove: 799,
    gstRate: 0.05,
    // ---- Optional cloud backend (Supabase). Leave blank = demo mode (browser storage).
    supabaseUrl: "",
    supabaseAnonKey: "",
    // Demo admin PIN (only used in demo mode). Production uses Supabase email login.
    demoAdminPin: "1989"
  },

  branches: [
    { id: "khade-bazaar", city: "Belagavi", name: "Khade Bazaar (Flagship)", address: "Opp. Market Police Station, Old P.B. Road, Khade Bazaar, Belagavi 590001", phone: "", open: "11:00", close: "23:00", lat: 15.8573, lng: 74.5133, flagship: true, delivery: true, seats: 120 },
    { id: "tilakwadi", city: "Belagavi", name: "Tilakwadi", address: "Swaroop Plaza, Shukrawar Peth Road, Tilakwadi, Belagavi 590006", phone: "", open: "11:00", close: "23:00", lat: 15.8357, lng: 74.5072, delivery: true, seats: 90 },
    { id: "nehru-nagar", city: "Belagavi", name: "Nehru Nagar", address: "Beside Muzawar Arcade, Nehru Nagar, Belagavi 590010", phone: "", open: "11:00", close: "23:00", lat: 15.8691, lng: 74.5191, delivery: true, seats: 80 },
    { id: "food-plaza", city: "Belagavi", name: "Food Plaza", address: "269/3A, Railway Station Road, Near Head Post Office, Belagavi", phone: "", open: "11:00", close: "23:00", lat: 15.8497, lng: 74.5160, delivery: true, seats: 60 },
    { id: "azam-nagar", city: "Belagavi", name: "Azam Nagar", address: "Bauxite Road, Union Society, Azam Nagar, Belagavi 590010", phone: "", open: "11:00", close: "23:00", lat: 15.8740, lng: 74.5260, delivery: true, seats: 60 },
    { id: "goa-bambolim", city: "Goa", name: "Bambolim", address: "Kenkre Center, Shop 4-5, NH 66, Near Goa Medical College, Bambolim, Goa", phone: "", open: "11:00", close: "23:00", lat: 15.4636, lng: 73.8542, delivery: true, seats: 70 },
    { id: "kolhapur", city: "Kolhapur", name: "Tararani Chowk", address: "517, Tararani Chowk, Station Road, E Ward, Kawala Naka, Kolhapur 416003", phone: "+917066022789", open: "11:00", close: "23:00", lat: 16.7050, lng: 74.2433, delivery: true, seats: 110 }
  ],

  categories: [
    { id: "biryani", name: "House of Biryanis", icon: "🍚" },
    { id: "kebab", name: "Awadhi Kebabs & Starters", icon: "🍢" },
    { id: "main", name: "Main Course", icon: "🍛" },
    { id: "bread", name: "Indian Breads", icon: "🫓" },
    { id: "rice", name: "Pilaf & Rice", icon: "🥘" },
    { id: "chinese", name: "Chinese & Oriental", icon: "🥢" },
    { id: "dessert", name: "Sweet Treats", icon: "🍮" },
    { id: "drinks", name: "Cool Refreshments", icon: "🥤" }
  ],

  // cost = estimated food cost % (for menu-engineering in admin) — ASSUMPTION, replace with real recipe costing.
  menu: [
    { id: "b1", cat: "biryani", name: "Niyaaz Signature Mutton Dum Biryani", price: 285, veg: false, signature: true, spice: 2, cost: 0.42, desc: "The dish that built the name. Tender mutton sealed in a handi with long-grain basmati and the house masala, slow-cooked on dum." },
    { id: "b2", cat: "biryani", name: "Niyaaz Signature Chicken Dum Biryani", price: 195, veg: false, signature: true, spice: 2, cost: 0.34, desc: "The original Belgaum-style chicken dum biryani — fragrant, fluffy, medium spiced." },
    { id: "b3", cat: "biryani", name: "Prawns Tawa Biryani", price: 450, veg: false, spice: 2, cost: 0.45, desc: "Juicy prawns tossed on the tawa with spices and layered with basmati." },
    { id: "b4", cat: "biryani", name: "Paneer Tawa Biryani", price: 245, veg: true, spice: 2, cost: 0.30, desc: "Paneer cooked on the tawa with spices and layered with basmati rice." },
    { id: "b5", cat: "biryani", name: "Firangi Subz Biryani", price: 190, veg: true, spice: 1, cost: 0.26, desc: "Garden vegetables, gently spiced and dum-cooked." },
    { id: "b6", cat: "biryani", name: "Vegetable Biryani", price: 165, veg: true, spice: 1, cost: 0.25, desc: "Classic vegetable biryani, light and aromatic." },
    { id: "b7", cat: "biryani", name: "Family Handi — Mutton (serves 4)", price: 1049, veg: false, signature: true, spice: 2, cost: 0.40, verify: true, desc: "A sealed clay handi of signature mutton dum biryani with raita & salan. Built for sharing." },
    { id: "b8", cat: "biryani", name: "Family Handi — Chicken (serves 4)", price: 729, veg: false, spice: 2, cost: 0.33, verify: true, desc: "Signature chicken dum biryani for four, with raita & salan." },

    { id: "k1", cat: "kebab", name: "Sholay Kebab", price: 295, veg: false, signature: true, spice: 3, cost: 0.36, verify: true, desc: "Fiery, smoky and succulent — a regulars' favourite." },
    { id: "k2", cat: "kebab", name: "Mutton Seekh Kebab", price: 325, veg: false, spice: 2, cost: 0.40, verify: true, desc: "Hand-pressed minced mutton on skewers, char-grilled." },
    { id: "k3", cat: "kebab", name: "Chicken Nizami Kebab", price: 285, veg: false, spice: 2, cost: 0.34, verify: true, desc: "Rich Nizami-style marinade, grilled in the tandoor." },
    { id: "k4", cat: "kebab", name: "Chicken Malai Kebab", price: 285, veg: false, spice: 1, cost: 0.35, verify: true, desc: "Cream, cheese and mild spices — melts in the mouth." },
    { id: "k5", cat: "kebab", name: "Royal Kebab Platter", price: 699, veg: false, signature: true, spice: 2, cost: 0.38, verify: true, desc: "A sampler of our best kebabs for the table." },
    { id: "k6", cat: "kebab", name: "Paneer Tikka", price: 245, veg: true, spice: 2, cost: 0.30, verify: true, desc: "Tandoor-charred paneer with peppers and onion." },

    { id: "m1", cat: "main", name: "Butter Chicken", price: 295, veg: false, spice: 1, cost: 0.33, verify: true, desc: "Silky tomato-butter gravy, tandoori chicken." },
    { id: "m2", cat: "main", name: "Mutton Rogan Josh", price: 345, veg: false, spice: 2, cost: 0.41, verify: true, desc: "Slow-braised mutton in a deep red Kashmiri gravy." },
    { id: "m3", cat: "main", name: "Chicken Sauthe", price: 285, veg: false, spice: 2, cost: 0.33, verify: true, desc: "House-style chicken preparation loved by regulars." },
    { id: "m4", cat: "main", name: "Paneer Butter Masala", price: 245, veg: true, spice: 1, cost: 0.29, verify: true, desc: "Paneer in a rich, mildly sweet makhani gravy." },
    { id: "m5", cat: "main", name: "Dal Makhani", price: 195, veg: true, spice: 1, cost: 0.20, verify: true, desc: "Black lentils simmered overnight with butter and cream." },

    { id: "r1", cat: "bread", name: "Butter Naan", price: 55, veg: true, spice: 0, cost: 0.15, verify: true, desc: "Tandoor-fresh and buttered." },
    { id: "r2", cat: "bread", name: "Rumali Roti", price: 40, veg: true, spice: 0, cost: 0.12, verify: true, desc: "Thin as a handkerchief, perfect with kebabs." },
    { id: "r3", cat: "bread", name: "Garlic Naan", price: 70, veg: true, spice: 0, cost: 0.15, verify: true, desc: "Naan with roasted garlic and coriander." },

    { id: "p1", cat: "rice", name: "Khushka — Dum Rice", price: 145, veg: true, spice: 0, cost: 0.18, verify: true, desc: "Classic dum-cooked rice with whole spices." },
    { id: "p2", cat: "rice", name: "Jeera Rice", price: 135, veg: true, spice: 0, cost: 0.17, verify: true, desc: "Basmati tempered with cumin." },

    { id: "c1", cat: "chinese", name: "Chicken Triple Schezwan Rice", price: 265, veg: false, spice: 3, cost: 0.30, verify: true, desc: "Rice and noodles with chicken, egg and fiery schezwan sauce." },
    { id: "c2", cat: "chinese", name: "Chicken Hakka Noodles", price: 215, veg: false, spice: 1, cost: 0.27, verify: true, desc: "Wok-tossed noodles with chicken and vegetables." },
    { id: "c3", cat: "chinese", name: "Veg Schezwan Fried Rice", price: 175, veg: true, spice: 3, cost: 0.22, verify: true, desc: "Spicy wok-fried rice with crunchy vegetables." },

    { id: "d1", cat: "dessert", name: "Malai Phirni", price: 95, veg: true, signature: true, spice: 0, cost: 0.22, verify: true, desc: "Chilled ground-rice pudding set in a clay pot." },
    { id: "d2", cat: "dessert", name: "Shahi Tukda", price: 125, veg: true, spice: 0, cost: 0.25, verify: true, desc: "Fried bread soaked in saffron rabdi." },
    { id: "d3", cat: "dessert", name: "Royal Falooda", price: 165, veg: true, spice: 0, cost: 0.28, verify: true, desc: "Rose, vermicelli, basil seeds and ice-cream." },
    { id: "d4", cat: "dessert", name: "House Mango Ice-cream", price: 110, veg: true, spice: 0, cost: 0.25, verify: true, desc: "A Niyaaz favourite." },

    { id: "x1", cat: "drinks", name: "Fresh Lime Soda", price: 75, veg: true, spice: 0, cost: 0.12, verify: true, desc: "Sweet, salted or mixed." },
    { id: "x2", cat: "drinks", name: "Sweet Lassi", price: 95, veg: true, spice: 0, cost: 0.18, verify: true, desc: "Thick churned yoghurt." },
    { id: "x3", cat: "drinks", name: "Mint Mojito (Mocktail)", price: 125, veg: true, spice: 0, cost: 0.14, verify: true, desc: "Mint, lime and soda over crushed ice." }
  ],

  // Smart up-sells shown in cart (raises average order value)
  pairings: { biryani: ["d1", "x1", "k1"], kebab: ["r2", "x3"], main: ["r1", "p1"], chinese: ["x1"] },

  offers: [
    { code: "ROYAL10", type: "percent", value: 10, minOrder: 499, active: true, label: "10% off on orders above ₹499" },
    { code: "FIRSTBIRYANI", type: "flat", value: 75, minOrder: 299, active: true, label: "₹75 off your first online order" },
    { code: "HANDI150", type: "flat", value: 150, minOrder: 999, active: true, label: "₹150 off on Family Handi orders above ₹999" }
  ],

  cateringPackages: [
    { id: "classic", name: "Classic Dawat", perPlate: 349, includes: "Chicken Dum Biryani, raita, salan, phirni", verify: true },
    { id: "royal", name: "Royal Dawat", perPlate: 549, includes: "Mutton Dum Biryani, 1 kebab, raita, salan, phirni, soft drink", verify: true },
    { id: "nawabi", name: "Nawabi Feast", perPlate: 849, includes: "Mutton + Chicken biryani, 2 kebabs, curry, naan, 2 desserts, welcome drink, live counter", verify: true },
    { id: "veg", name: "Shahi Veg", perPlate: 299, includes: "Paneer Tawa Biryani, veg curry, raita, phirni", verify: true }
  ],

  // TIMELINE: years after 1989 are placeholders — confirm exact milestones with the family.
  timeline: [
    { year: "1989", text: "A small eatery opens in Belagavi to feed travellers — and the Belgaum Biryani is born." },
    { year: "Growth", text: "Word spreads. The dum biryani becomes a Belagavi ritual for families and festivals." },
    { year: "Belagavi", text: "More branches across the city — Khade Bazaar, Tilakwadi, Nehru Nagar and more." },
    { year: "Beyond", text: "Niyaaz crosses state lines — Kolhapur and Goa welcome the Original Belgaum Biryani." },
    { year: "Today", text: "Three decades on, the same recipe, the same handi, a new generation of guests." }
  ]
};
