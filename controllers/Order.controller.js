import Order   from "../models/Order.model.js";
import Cart    from "../models/Cart.js";
import Address from "../models/Address.model.js";
import Product from "../models/product.js";
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
 
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
 
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
 
// ─────────────────────────────────────────────────────────────────────
// GET /api/orders/my  — user's own orders, newest first
// ─────────────────────────────────────────────────────────────────────
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
 
// ─────────────────────────────────────────────────────────────────────
// GET /api/orders/:id  — single order (must belong to requesting user)
// ─────────────────────────────────────────────────────────────────────
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
    order.cancelReason = req.body.reason || "Cancelled by customer";
    order.cancelledAt  = new Date();
    order.statusTimeline.push({ status: "Cancelled", message: req.body.reason || "Cancelled by customer", timestamp: new Date() });
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// ════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════════════════════
 
// ─────────────────────────────────────────────────────────────────────
// GET /api/admin/orders  — all orders with full customer + item data
// Returns enriched orders suitable for admin panel table + expandable rows
// ─────────────────────────────────────────────────────────────────────
export const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName email mobileNumber createdAt")
      .sort({ createdAt: -1 })
      .lean();
 
    const enriched = orders.map((o) => ({
      ...o,
      orderNumber:    "LYR" + o._id.toString().slice(-8).toUpperCase(),
      userName:   o.user?.fullName || o.address?.fullName || "Unknown",
      userEmail:  o.user?.email || "",
      userPhone:  o.user?.mobileNumber || o.address?.phone || "",
      userId:     o.user?._id || null,
      // Safe item count (never render the array directly in JSX)
      itemCount:      Array.isArray(o.items) ? o.items.length : 0,
    }));
 
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// ─────────────────────────────────────────────────────────────────────
// PUT /api/admin/orders/:id  — update delivery status
// body: { status: "Pending"|"Processing"|"Shipped"|"Delivered"|"Cancelled" }
// Automatically marks COD as paid when Delivered
// ─────────────────────────────────────────────────────────────────────
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Invalid status: ${status}` });
 
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
 
    order.status = status;
    order.statusTimeline.push({ status, message: `Status updated to ${status} by admin`, timestamp: new Date() });
 
    // Auto-mark COD as paid on delivery
    if (status === "Delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }
    // Auto-mark as refunded on cancel if already paid
    if (status === "Cancelled" && order.paymentStatus === "paid") {
      order.paymentStatus = "refunded";
    }
 
    await order.save();
    res.json({
      message: "Order status updated",
      order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
// ─────────────────────────────────────────────────────────────────────
// PATCH /api/admin/orders/:id/payment  — update payment status only
// body: { paymentStatus: "pending"|"paid"|"failed"|"refunded" }
// ─────────────────────────────────────────────────────────────────────
export const adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validPayment = ["pending", "paid", "failed", "refunded"];
    if (!validPayment.includes(paymentStatus))
      return res.status(400).json({ error: `Invalid paymentStatus: ${paymentStatus}` });
 
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
 
    order.paymentStatus = paymentStatus;
    order.statusTimeline.push({
      status:    order.status,
      message:   `Payment status updated to ${paymentStatus} by admin`,
      timestamp: new Date(),
    });
 
    await order.save();
    res.json({
      message: "Payment status updated",
      order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
