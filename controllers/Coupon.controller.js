import Coupon from "../models/Coupon.model.js";

// ─────────────────────────────────────────────────────────────────────
// POST /api/coupons/validate
// Body: { code, cartTotal }
// Returns: { discountAmount, discountPercent, message }
// ─────────────────────────────────────────────────────────────────────
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) return res.status(400).json({ error: "Coupon code is required" });
    const amount = Number(cartTotal) || 0;

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });

    if (!coupon) return res.status(404).json({ error: "Invalid coupon code" });

    // Check expiry
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ error: "This coupon has expired" });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: "This coupon has reached its usage limit" });
    }

    // Check minimum order amount
    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      });
    }

    // Calculate discount
    let discountAmount;
    let discountPercent;

    if (coupon.discountType === "percentage") {
      discountPercent = coupon.discountValue;
      discountAmount  = Math.round(amount * coupon.discountValue / 100);
      if (coupon.maxDiscount !== null) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    } else {
      // flat
      discountAmount  = Math.min(coupon.discountValue, amount);
      discountPercent = Math.round((discountAmount / amount) * 100);
    }

    return res.json({
      valid:          true,
      discountAmount,
      discountPercent,
      couponCode:     coupon.code,
      message:        `Coupon applied! You save ₹${discountAmount}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
// Mark coupon as used (called internally after order placement)
// ─────────────────────────────────────────────────────────────────────
export const markCouponUsed = async (code) => {
  if (!code) return;
  await Coupon.updateOne({ code }, { $inc: { usedCount: 1 } }).catch(() => {});
};

// ─────────────────────────────────────────────────────────────────────
// Admin: seed default coupons if none exist
// ─────────────────────────────────────────────────────────────────────
export const seedCoupons = async () => {
  const count = await Coupon.countDocuments();
  if (count > 0) return;
  await Coupon.insertMany([
    { code: "LYRA10",  discountType: "percentage", discountValue: 10, minOrderAmount: 300,  description: "10% off on orders above ₹300" },
    { code: "SAVE20",  discountType: "percentage", discountValue: 20, minOrderAmount: 800,  description: "20% off on orders above ₹800" },
    { code: "FIRST50", discountType: "percentage", discountValue: 50, minOrderAmount: 1500, maxDiscount: 500, description: "50% off up to ₹500 on first order" },
  ]);
  console.log("✓ Default coupons seeded");
};