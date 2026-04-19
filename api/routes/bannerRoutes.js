import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner
} from "../controllers/bannerController.js";


const router = express.Router();

// PUBLIC
router.get("/active", getActiveBanners);

// ADMIN
router.get("/", protect, getBanners);
router.post("/", protect, createBanner);
router.put("/:bannerId", protect, updateBanner);
router.delete("/:bannerId", protect, deleteBanner);
router.patch("/:id/toggle", protect, toggleBanner);


export default router;