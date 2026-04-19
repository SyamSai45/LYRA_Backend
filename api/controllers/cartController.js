import Cart from "../api/models/Cart.js";
import "../api/models/product.js"; 

const getOrCreate = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  cart = await cart.populate("items.product");

  return cart;
};

// ── Format item for frontend ──────────────────────────────────
const formatItem = (item) => {
  const p = item.product;
  if (!p) return null;

  return {
    _id: item._id,
    cartItemId: item._id,
    productId: p._id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice,
    image: p.image || (p.images?.[0]?.split?.(",")[0]),
    images: p.images || [],
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    rating: p.rating,
    badge: p.badge,
    sku: p.sku,
  };
};

export const getCart = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const cart = await getOrCreate(req.user._id);
    const items = cart.items.map(formatItem).filter(Boolean);

    res.json(items);
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { productId, size, color, quantity = 1 } = req.body;

    if (!productId || !size || !color) {
      return res.status(400).json({
        error: "productId, size, and color are required",
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(
      (i) =>
        i.product.toString() === productId.toString() &&
        i.size === size &&
        i.color === color
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        size,
        color,
        quantity: Number(quantity),
      });
    }

    await cart.save();
    cart = await cart.populate("items.product");

    const items = cart.items.map(formatItem).filter(Boolean);

    res.status(201).json(items);
  } catch (err) {
    console.error("ADD CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE CART ITEM ──────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const index = cart.items.findIndex(
      (i) => i._id.toString() === cartItemId.toString()
    );

    if (index === -1) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = Number(quantity);
    }

    await cart.save();
    await cart.populate("items.product");

    const items = cart.items.map(formatItem).filter(Boolean);

    res.json(items);
  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── REMOVE CART ITEM ──────────────────────────────────────────
export const removeCartItem = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { cartItemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (i) => i._id.toString() !== cartItemId.toString()
    );

    await cart.save();
    await cart.populate("items.product");

    const items = cart.items.map(formatItem).filter(Boolean);

    res.json(items);
  } catch (err) {
    console.error("REMOVE CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ── CLEAR CART ────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};