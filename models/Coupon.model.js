import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code:            { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType:    { type: String, enum: ["percentage", "flat"], default: "percentage" },
    discountValue:   { type: Number, required: true },   // % or flat ₹ amount
    minOrderAmount:  { type: Number, default: 0 },
    maxDiscount:     { type: Number, default: null },     // cap for percentage coupons
    usageLimit:      { type: Number, default: null },     // null = unlimited
    usedCount:       { type: Number, default: 0 },
    expiresAt:       { type: Date, default: null },       // null = never expires
    active:          { type: Boolean, default: true },
    description:     { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);