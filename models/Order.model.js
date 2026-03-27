import mongoose from "mongoose";

// ── Embedded order item (snapshot at time of purchase) ───────────────
const orderItemSchema = new mongoose.Schema(
  {
    product:       { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name:          { type: String, required: true },
    brand:         { type: String },
    image:         { type: String },
    price:         { type: Number, required: true },
    originalPrice: { type: Number },
    size:          { type: String, required: true },
    color:         { type: String, required: true },
    quantity:      { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// ── Status timeline entry ────────────────────────────────────────────
const statusEventSchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    message:   { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Main Order schema ────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Snapshot of the shipping address at time of order
    address: {
      addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
      label:     { type: String },
      fullName:  { type: String, required: true },
      phone:     { type: String, required: true },
      street:    { type: String, required: true },
      city:      { type: String, required: true },
      state:     { type: String, required: true },
      pincode:   { type: String, required: true },
    },

    items: {
      type: [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: "Order must have at least one item" },
    },

    // Financials
    subtotal:    { type: Number, required: true },
    discount:    { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total:       { type: Number, required: true },
    couponCode:  { type: String, default: null },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cod", "upi", "card", "netbanking", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    upiId: { type: String }, // stored only when paymentMethod === "upi"

    // Order status
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // Full history of status changes
    statusTimeline: {
      type: [statusEventSchema],
      default: [{ status: "Pending", message: "Order placed successfully" }],
    },

    // Tracking
    trackingId:     { type: String, default: null },
    estimatedDelivery: { type: Date, default: () => new Date(Date.now() + 7 * 86400000) },

    // Cancellation
    cancelReason: { type: String, default: null },
    cancelledAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Virtual: short order number for display ──────────────────────────
orderSchema.virtual("orderNumber").get(function () {
  return "LYR" + this._id.toString().slice(-8).toUpperCase();
});

orderSchema.set("toJSON", { virtuals: true });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;