import express from "express";
import { protect } from "../middleware/auth.js";
import { validateCoupon } from "../controllers/Coupon.controller.js";

const router = express.Router();

// POST /api/coupons/validate — validate coupon code
// Requires auth so we can track per-user usage later
router.post("/validate", protect, validateCoupon);

export default router;