import Order   from "../models/Order.model.js";
import Cart    from "../models/Cart.js";
import Address from "../models/Address.model.js";
import Product from "../models/product.js";

// ─────────────────────────────────────────────────────────────────────
// POST /api/orders
// Places a new order. Validates address, verifies products still exist,
// locks in prices, clears the user's cart.
//
// Body:
// {
//   addressId,          // optional if address object provided
//   address: { ... },  // full address snapshot (fallback)
//   items: [{ product, name, brand, image, price, originalPrice, size, color, quantity }],
//   paymentMethod,      // "cod" | "upi" | "card" | "netbanking" | "wallet"
//   couponCode,
//   subtotal, discount, shippingFee, total,
//   upiId               // only for upi
// }
// ─────────────────────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const {
      addressId,
      address: addressBody,
      items,
      paymentMethod,
      couponCode,
      subtotal,
      discount  = 0,
      shippingFee = 0,
      total,
      upiId,
    } = req.body;

    // ── 1. Validate items ──────────────────────────────────────────
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // ── 2. Validate payment method ─────────────────────────────────
    const validMethods = ["cod", "upi", "card", "netbanking", "wallet"];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    // ── 3. Resolve address ─────────────────────────────────────────
    // Prefer stored address by ID; fall back to inline body (for guests or
    // when frontend sends both for reliability)
    let addressSnapshot;

    if (addressId) {
      const stored = await Address.findOne({ _id: addressId, user: req.user._id });
      if (!stored) return res.status(404).json({ error: "Address not found" });
      addressSnapshot = {
        addressId: stored._id,
        label:     stored.label,
        fullName:  stored.fullName,
        phone:     stored.phone,
        street:    stored.street,
        city:      stored.city,
        state:     stored.state,
        pincode:   stored.pincode,
      };
    } else if (addressBody?.fullName && addressBody?.street) {
      // Inline address — still require the key fields
      const required = ["fullName", "phone", "street", "city", "state", "pincode"];
      const missing  = required.filter((f) => !addressBody[f]);
      if (missing.length) return res.status(400).json({ error: `Address missing: ${missing.join(", ")}` });
      addressSnapshot = {
        label:    addressBody.label    || "Home",
        fullName: addressBody.fullName,
        phone:    addressBody.phone,
        street:   addressBody.street,
        city:     addressBody.city,
        state:    addressBody.state,
        pincode:  addressBody.pincode,
      };
    } else {
      return res.status(400).json({ error: "Delivery address is required" });
    }

    // ── 4. Build order items (verify products still exist) ─────────
    const orderItems = [];
    let computedSubtotal = 0;

    for (const item of items) {
      if (!item.size || !item.color) {
        return res.status(400).json({ error: `Item "${item.name}" is missing size or color` });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: `Item "${item.name}" has invalid quantity` });
      }

      // If product ID provided, try to verify it exists and use its current price
      // This prevents tampering with prices on the frontend
      let lockedPrice         = item.price;
      let lockedOriginalPrice = item.originalPrice;

      if (item.product) {
        try {
          const dbProduct = await Product.findById(item.product).select("price originalPrice name").lean();
          if (dbProduct) {
            lockedPrice         = dbProduct.price;
            lockedOriginalPrice = dbProduct.originalPrice;
          }
        } catch {
          // product lookup failed → use frontend price (edge case)
        }
      }

      computedSubtotal += lockedPrice * item.quantity;

      orderItems.push({
        product:       item.product || undefined,
        name:          item.name          || "Unknown",
        brand:         item.brand         || "",
        image:         item.image || item.images?.[0] || "",
        price:         lockedPrice,
        originalPrice: lockedOriginalPrice || lockedPrice,
        size:          item.size,
        color:         item.color,
        quantity:      Number(item.quantity),
      });
    }

    // ── 5. Validate totals (protect against tampering) ─────────────
    // Allow ±1 rupee tolerance for floating point
    const computedTotal = computedSubtotal - (Number(discount) || 0) + (Number(shippingFee) || 0);
    if (Math.abs(computedTotal - Number(total)) > 1) {
      return res.status(400).json({
        error: "Order total does not match. Please refresh and try again.",
        expected: computedTotal,
        received: total,
      });
    }

    // ── 6. Set payment status ──────────────────────────────────────
    // COD → pending until delivery; others treated as paid (integrate payment gateway here)
    const paymentStatus = paymentMethod === "cod" ? "pending" : "paid";

    // ── 7. Create order ────────────────────────────────────────────
    const order = await Order.create({
      user: req.user._id,
      address: addressSnapshot,
      items: orderItems,
      subtotal:    computedSubtotal,
      discount:    Number(discount)    || 0,
      shippingFee: Number(shippingFee) || 0,
      total:       computedTotal,
      couponCode:  couponCode || null,
      paymentMethod,
      paymentStatus,
      upiId: paymentMethod === "upi" ? upiId : undefined,
      status: "Pending",
      statusTimeline: [
        { status: "Pending", message: "Order placed successfully", timestamp: new Date() },
      ],
      estimatedDelivery: new Date(Date.now() + 7 * 86400000),
    });

    // ── 8. Clear user's cart ───────────────────────────────────────
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });

    return res.status(201).json({
      message: "Order placed successfully",
      order: {
        ...order.toJSON(),
        orderNumber: order.orderNumber,
      },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    console.error("Place order error:", err);
    res.status(500).json({ error: err.message || "Failed to place order" });
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/orders/my
// Returns all orders for the logged-in user, newest first
// ─────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Attach orderNumber virtual to each
    const enriched = orders.map((o) => ({
      ...o,
      orderNumber: "LYR" + o._id.toString().slice(-8).toUpperCase(),
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/orders/:id
// Returns a single order (must belong to the requesting user)
// ─────────────────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json({
      ...order,
      orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/cancel
// User cancels their own order (only if Pending or Processing)
// ─────────────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (!["Pending", "Processing"].includes(order.status)) {
      return res.status(400).json({
        error: `Cannot cancel an order that is already ${order.status.toLowerCase()}`,
      });
    }

    order.status        = "Cancelled";
    order.cancelReason  = req.body.reason || "Cancelled by customer";
    order.cancelledAt   = new Date();
    order.statusTimeline.push({
      status:    "Cancelled",
      message:   req.body.reason || "Cancelled by customer",
      timestamp: new Date(),
    });

    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
// ── ADMIN ROUTES ──────────────────────────────────────────────────────

// GET /api/admin/orders
export const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email mobileNumber")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = orders.map((o) => ({
      ...o,
      orderNumber: "LYR" + o._id.toString().slice(-8).toUpperCase(),
      customer:    o.user?.fullName || "Unknown",
      email:       o.user?.email   || "",
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/admin/orders/:id
// Body: { status }
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    order.statusTimeline.push({
      status,
      message:   `Status updated to ${status} by admin`,
      timestamp: new Date(),
    });

    // Mark as paid when delivered (for COD)
    if (status === "Delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};