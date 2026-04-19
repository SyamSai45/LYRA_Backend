import Wishlist from "../api/models/Wishlist.js";

// ── Helper ─────────────────────────────────────────────
const getOrCreate = async (userId) => {
  let doc = await Wishlist.findOne({ user: userId });
  if (!doc) doc = await Wishlist.create({ user: userId, products: [] });
  return doc;
};

// ── Save + populate + return ───────────────────────────
const saveAndReturn = async (doc, res) => {
  await doc.save();
  const populated = await Wishlist.findById(doc._id).populate("products");
  return res.json(populated.products);
};

// ── GET ────────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const doc = await getOrCreate(req.user._id);
    const populated = await Wishlist.findById(doc._id).populate("products");

    res.json(populated.products);
  } catch (err) {
    console.error("GET WISHLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── ADD ────────────────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "productId required" });

    const doc = await getOrCreate(req.user._id);

    const exists = doc.products.some(
      (id) => id.toString() === productId.toString()
    );

    if (!exists) doc.products.push(productId);

    return saveAndReturn(doc, res);
  } catch (err) {
    console.error("ADD WISHLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── TOGGLE ─────────────────────────────────────────────
export const toggleWishlist = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "productId required" });

    const doc = await getOrCreate(req.user._id);

    const index = doc.products.findIndex(
      (id) => id.toString() === productId.toString()
    );

    if (index === -1) {
      doc.products.push(productId);
    } else {
      doc.products.splice(index, 1);
    }

    return saveAndReturn(doc, res);
  } catch (err) {
    console.error("TOGGLE WISHLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── REMOVE ─────────────────────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId } = req.params;

    const doc = await getOrCreate(req.user._id);

    doc.products = doc.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    return saveAndReturn(doc, res);
  } catch (err) {
    console.error("REMOVE WISHLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};