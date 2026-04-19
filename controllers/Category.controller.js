import Category from "../api/models/Category.model.js";

// ═══════════════════════════════════════════════════════════════════
// SEED DATA — mirrors the original hardcoded MEGA_MENU on the frontend
// POST /api/admin/categories/seed
// ═══════════════════════════════════════════════════════════════════
const SEED_CATEGORIES = [
  {
    name: "Men", slug: "men", label: "Men", icon: "👔", order: 1, color: "#1e3a5f",
    featuredLabel: "New Arrivals",
    featuredImg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1200&q=80",
    columns: [
      { title: "Clothing",    order: 0, subCategories: [{ name:"Shirts" },{ name:"T-Shirts" },{ name:"Jeans" },{ name:"Trousers" },{ name:"Kurtas" },{ name:"Jackets" },{ name:"Suits & Blazers" },{ name:"Shorts" },{ name:"Track Pants" },{ name:"Innerwear" }] },
      { title: "Footwear",    order: 1, subCategories: [{ name:"Sneakers" },{ name:"Formal Shoes" },{ name:"Loafers" },{ name:"Sandals" },{ name:"Boots" },{ name:"Sports Shoes" },{ name:"Slippers" }] },
      { title: "Accessories", order: 2, subCategories: [{ name:"Watches" },{ name:"Sunglasses" },{ name:"Wallets" },{ name:"Belts" },{ name:"Bags & Backpacks" },{ name:"Caps & Hats" },{ name:"Jewellery" }] },
      { title: "Grooming",    order: 3, subCategories: [{ name:"Skincare" },{ name:"Hair Care" },{ name:"Fragrances" },{ name:"Beard Care" },{ name:"Bath & Body" }] },
    ],
  },
  {
    name: "Women", slug: "women", label: "Women", icon: "👗", order: 2, color: "#9d174d",
    featuredLabel: "Trending Now",
    featuredImg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    columns: [
      { title: "Clothing",    order: 0, subCategories: [{ name:"Kurtas & Suits" },{ name:"Sarees" },{ name:"Dresses" },{ name:"Tops & Tees" },{ name:"Jeans" },{ name:"Leggings" },{ name:"Skirts" },{ name:"Ethnic Wear" },{ name:"Nightwear" },{ name:"Activewear" }] },
      { title: "Footwear",    order: 1, subCategories: [{ name:"Heels" },{ name:"Flats" },{ name:"Sandals" },{ name:"Sneakers" },{ name:"Boots" },{ name:"Kolhapuris" },{ name:"Wedges" }] },
      { title: "Accessories", order: 2, subCategories: [{ name:"Handbags" },{ name:"Clutches" },{ name:"Jewellery" },{ name:"Sunglasses" },{ name:"Watches" },{ name:"Scarves" }] },
      { title: "Beauty",      order: 3, subCategories: [{ name:"Lipstick" },{ name:"Foundation" },{ name:"Moisturisers" },{ name:"Serums" },{ name:"Perfumes" },{ name:"Skincare Kits" }] },
    ],
  },
  {
    name: "Kids", slug: "kids", label: "Kids", icon: "🧒", order: 3, color: "#0284c7",
    featuredLabel: "Back to School",
    featuredImg: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
    columns: [
      { title: "Boys",          order: 0, subCategories: [{ name:"T-Shirts & Shirts" },{ name:"Jeans & Trousers" },{ name:"Ethnic Wear" },{ name:"Shorts" },{ name:"Jackets" },{ name:"Shoes" }] },
      { title: "Girls",         order: 1, subCategories: [{ name:"Dresses" },{ name:"Tops & Tees" },{ name:"Ethnic Wear" },{ name:"Jeans & Leggings" },{ name:"Skirts" },{ name:"Shoes" }] },
      { title: "Infants (0–2)", order: 2, subCategories: [{ name:"Bodysuits" },{ name:"Sleepsuits" },{ name:"Rompers" },{ name:"Booties" },{ name:"Bibs" }] },
      { title: "Essentials",    order: 3, subCategories: [{ name:"School Bags" },{ name:"Lunch Boxes" },{ name:"Stationery" },{ name:"Toys" }] },
    ],
  },
  {
    name: "Beauty & Health", slug: "beauty", label: "Beauty", icon: "💄", order: 4, color: "#be185d",
    featuredLabel: "Bestsellers",
    featuredImg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
    columns: [
      { title: "Skincare",          order: 0, subCategories: [{ name:"Moisturisers" },{ name:"Serums" },{ name:"Sunscreen" },{ name:"Face Wash" },{ name:"Toners" },{ name:"Eye Cream" },{ name:"Sheet Masks" }] },
      { title: "Makeup",            order: 1, subCategories: [{ name:"Lipstick" },{ name:"Foundation" },{ name:"Concealer" },{ name:"Blush & Bronzer" },{ name:"Mascara" },{ name:"Kajal" },{ name:"Eyeshadow" }] },
      { title: "Hair Care",         order: 2, subCategories: [{ name:"Shampoo" },{ name:"Conditioner" },{ name:"Hair Masks" },{ name:"Oils" },{ name:"Styling" },{ name:"Dry Shampoo" }] },
      { title: "Fragrances & More", order: 3, subCategories: [{ name:"Perfumes" },{ name:"Deodorants" },{ name:"Body Mists" },{ name:"Bath & Body" },{ name:"Vitamins" }] },
    ],
  },
  {
    name: "Home & Living", slug: "home", label: "Home", icon: "🏡", order: 5, color: "#0f766e",
    featuredLabel: "Trending Décor",
    featuredImg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
    columns: [
      { title: "Decor",   order: 0, subCategories: [{ name:"Wall Art" },{ name:"Cushions & Throws" },{ name:"Candles & Diffusers" },{ name:"Plants & Pots" },{ name:"Vases" }] },
      { title: "Bedding", order: 1, subCategories: [{ name:"Bed Sheets" },{ name:"Duvet Covers" },{ name:"Pillowcases" },{ name:"Blankets" },{ name:"Comforters" }] },
      { title: "Kitchen", order: 2, subCategories: [{ name:"Cookware" },{ name:"Bakeware" },{ name:"Storage & Jars" },{ name:"Cutlery" },{ name:"Mugs & Glasses" }] },
      { title: "Bath",    order: 3, subCategories: [{ name:"Towels" },{ name:"Bath Mats" },{ name:"Shower Curtains" },{ name:"Organisers" }] },
    ],
  },
  {
    name: "Electronics", slug: "electronics", label: "Electronics", icon: "💻", order: 6, color: "#1f2937",
    featuredLabel: "Tech Picks",
    featuredImg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
    columns: [
      { title: "Wearables",      order: 0, subCategories: [{ name:"Smart Watches" },{ name:"Fitness Bands" },{ name:"Earbuds" },{ name:"Headphones" },{ name:"Wireless Speakers" }] },
      { title: "Mobiles & Tabs", order: 1, subCategories: [{ name:"Smartphones" },{ name:"Tablets" },{ name:"Chargers & Cables" },{ name:"Power Banks" },{ name:"Mobile Covers" }] },
      { title: "Computing",      order: 2, subCategories: [{ name:"Laptops" },{ name:"Keyboards" },{ name:"Mouse" },{ name:"Monitors" },{ name:"Storage Drives" }] },
      { title: "Smart Home",     order: 3, subCategories: [{ name:"Smart Bulbs" },{ name:"Security Cameras" },{ name:"Smart Plugs" },{ name:"Routers" },{ name:"Voice Assistants" }] },
    ],
  },
  {
    name: "Sports", slug: "sports", label: "Sports", icon: "⚽", order: 7, color: "#0891b2",
    featuredLabel: "New Season Gear",
    featuredImg: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80",
    heroImg: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
    columns: [
      { title: "Sports Clothing", order: 0, subCategories: [{ name:"Running" },{ name:"Yoga & Pilates" },{ name:"Gym & Fitness" },{ name:"Cycling" },{ name:"Swimming" },{ name:"Cricket" }] },
      { title: "Footwear",        order: 1, subCategories: [{ name:"Running Shoes" },{ name:"Training Shoes" },{ name:"Hiking Boots" },{ name:"Cricket Shoes" },{ name:"Football Cleats" }] },
      { title: "Equipment",       order: 2, subCategories: [{ name:"Yoga Mats" },{ name:"Resistance Bands" },{ name:"Dumbbells" },{ name:"Gym Bags" },{ name:"Supplements" }] },
      { title: "Outdoor",         order: 3, subCategories: [{ name:"Camping" },{ name:"Trekking" },{ name:"Cycling" },{ name:"Adventure Gear" }] },
    ],
  },
  {
    name: "Sale", slug: "sale", label: "Sale", icon: "🏷️", order: 8, noMenu: true,
    badge: "UP TO 70% OFF", badgeColor: "#ef4444", color: "#ef4444",
    featuredImg: "",
    columns: [],
  },
];

// ── GET all active categories (public — used by dashboard + category page) ──
export const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({ active: true }).sort({ order: 1, name: 1 });
    res.json({ categories: cats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET all categories including inactive (admin) ────────────────
export const adminGetCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1, name: 1 });
    res.json({ categories: cats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET single category by id or slug ───────────────────────────
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findOne(
      id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id }
    );
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CREATE category (admin) ──────────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const data = req.body;
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    const cat = await Category.create(data);
    res.status(201).json({ category: cat, message: "Category created" });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Category name/slug already exists" });
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE category (admin) ──────────────────────────────────────
export const updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json({ category: cat, message: "Category updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE category (admin) ──────────────────────────────────────
export const deleteCategory = async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── ADD column to category ───────────────────────────────────────
export const addColumn = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    cat.columns.push(req.body);
    await cat.save();
    res.json({ category: cat, message: "Column added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE column ────────────────────────────────────────────────
export const updateColumn = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    const col = cat.columns.id(req.params.colId);
    if (!col) return res.status(404).json({ error: "Column not found" });
    Object.assign(col, req.body);
    await cat.save();
    res.json({ category: cat, message: "Column updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE column ────────────────────────────────────────────────
export const deleteColumn = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    cat.columns = cat.columns.filter((c) => c._id.toString() !== req.params.colId);
    await cat.save();
    res.json({ category: cat, message: "Column deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── ADD sub-category to column ───────────────────────────────────
export const addSubCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    const col = cat.columns.id(req.params.colId);
    if (!col) return res.status(404).json({ error: "Column not found" });
    col.subCategories.push(req.body);
    await cat.save();
    res.json({ category: cat, message: "Sub-category added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE sub-category ──────────────────────────────────────────
export const deleteSubCategory = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ error: "Category not found" });
    const col = cat.columns.id(req.params.colId);
    if (!col) return res.status(404).json({ error: "Column not found" });
    col.subCategories = col.subCategories.filter((s) => s._id.toString() !== req.params.subId);
    await cat.save();
    res.json({ category: cat, message: "Sub-category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── SEED (idempotent) ────────────────────────────────────────────
export const seedCategories = async (req, res) => {
  try {
    let created = 0, skipped = 0;
    for (const data of SEED_CATEGORIES) {
      const exists = await Category.findOne({ slug: data.slug });
      if (exists) { skipped++; continue; }
      await Category.create(data);
      created++;
    }
    res.json({ message: `Seeded: ${created} created, ${skipped} already existed.` });
  } catch (err) {
  console.error("SEED ERROR:", err); // 🔥 ADD THIS
  res.status(500).json({ error: err.message });
}
};

// ── REORDER categories (drag-and-drop) ──────────────────────────
// Body: { order: [{ id, order }, ...] }
export const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array" });
    await Promise.all(order.map(({ id, order: o }) => Category.findByIdAndUpdate(id, { order: o })));
    res.json({ message: "Order updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};