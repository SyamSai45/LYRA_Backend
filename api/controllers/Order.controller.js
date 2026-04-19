import Order   from "../api/models/Order.model.js";
import Cart    from "../api/models/Cart.js";
import Address from "../api/models/Address.model.js";
import Product from "../api/models/product.js";
export const placeOrder = async (req, res) => {
  try {
    const {
      addressId, address: addressBody, items, paymentMethod,
      couponCode, subtotal, discount = 0, shippingFee = 0, total, upiId,
    } = req.body;
 
    if (!items || items.length === 0)
      return res.status(400).json({ error: "Order must contain at least one item" });
 
    const validMethods = ["cod", "upi", "card", "netbanking", "wallet"];
    if (!validMethods.includes(paymentMethod))
      return res.status(400).json({ error: `Invalid payment method: ${paymentMethod}` });
 
    // Resolve address
    let addressSnapshot;
    if (addressId) {
      const stored = await Address.findOne({ _id: addressId, user: req.user._id });
      if (!stored) return res.status(404).json({ error: "Address not found" });
      addressSnapshot = {
        addressId: stored._id, label: stored.label, fullName: stored.fullName,
        phone: stored.phone, street: stored.street, city: stored.city,
        state: stored.state, pincode: stored.pincode,
      };
    } else if (addressBody?.fullName && addressBody?.street) {
      const missing = ["fullName","phone","street","city","state","pincode"].filter((f) => !addressBody[f]);
      if (missing.length) return res.status(400).json({ error: `Address missing: ${missing.join(", ")}` });
      addressSnapshot = {
        label: addressBody.label || "Home", fullName: addressBody.fullName,
        phone: addressBody.phone, street: addressBody.street,
        city: addressBody.city, state: addressBody.state, pincode: addressBody.pincode,
      };
    } else {
      return res.status(400).json({ error: "Delivery address is required" });
    }
 
    // Build + validate items
    const orderItems = [];
    let computedSubtotal = 0;
    for (const item of items) {
      if (!item.size || !item.color)
        return res.status(400).json({ error: `Item "${item.name || "unknown"}" is missing size or color` });
      if (!item.quantity || item.quantity < 1)
        return res.status(400).json({ error: `Item "${item.name || "unknown"}" has invalid quantity` });
 
      let lockedPrice = Number(item.price) || 0;
      let lockedOriginalPrice = Number(item.originalPrice) || lockedPrice;
 
      if (item.product) {
        try {
          const db = await Product.findById(item.product).select("price originalPrice").lean();
          if (db) { lockedPrice = db.price; lockedOriginalPrice = db.originalPrice || db.price; }
        } catch { /* use frontend price */ }
      }

      computedSubtotal += lockedPrice * Number(item.quantity);
      orderItems.push({
        product: item.product || undefined,
        name: item.name || "Unknown", brand: item.brand || "",
        image: item.image || item.images?.[0] || "",
        price: lockedPrice, originalPrice: lockedOriginalPrice,
        size: item.size, color: item.color, quantity: Number(item.quantity),
      });
    }
 
    const computedTotal = computedSubtotal - (Number(discount) || 0) + (Number(shippingFee) || 0);
    if (Math.abs(computedTotal - Number(total)) > 1)
      return res.status(400).json({ error: "Order total mismatch. Please refresh and try again.", expected: computedTotal, received: Number(total) });
 
    const order = await Order.create({
      user: req.user._id, address: addressSnapshot, items: orderItems,
      subtotal: computedSubtotal, discount: Number(discount) || 0,
      shippingFee: Number(shippingFee) || 0, total: computedTotal,
      couponCode: couponCode || null, paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      upiId: paymentMethod === "upi" ? upiId : undefined,
      status: "Pending",
      statusTimeline: [{ status: "Pending", message: "Order placed successfully", timestamp: new Date() }],
      estimatedDelivery: new Date(Date.now() + 7 * 86400000),
    });
 
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } }, { returnDocument: "after" });
 
    return res.status(201).json({
      message: "Order placed successfully",
      order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(", ") });
    }
    console.error("Place order error:", err);
    res.status(500).json({ error: err.message || "Failed to place order" });
  }
};
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(orders.map((o) => ({
      ...o,
      orderNumber: "LYR" + o._id.toString().slice(-8).toUpperCase(),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ ...order, orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// ─────────────────────────────────────────────────────────────────────
// PATCH /api/orders/:id/cancel  — user cancels (Pending / Processing only)
// ─────────────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (!["Pending", "Processing"].includes(order.status))
      return res.status(400).json({ error: `Cannot cancel an order with status "${order.status}"` });
 
    order.status       = "Cancelled";
    order.cancelReason = req.body.reason || "Cancelled by user";
    order.cancelledAt  = new Date();
    order.statusTimeline.push({ status: "Cancelled", message: req.body.reason || "Cancelled by user", timestamp: new Date() });
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
