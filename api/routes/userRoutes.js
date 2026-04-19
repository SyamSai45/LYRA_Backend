import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getCartCount,
  getAllUsers,
  deleteUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadProfile } from "../config/cloudinary.js";

const router = express.Router();

// ── Profile ───────────────────────────────
router.get("/profile",          getProfile);
router.put("/profile",          protect, uploadProfile.single("profileImage"), updateProfile);
router.put("/change-password",  protect, changePassword);

// ── Addresses ─────────────────────────────
router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId",  deleteAddress);

// ── Cart count (for navbar) ───────────────
router.get("/getcartcount/:userId", getCartCount);

// ── Admin ─────────────────────────────────
router.get("/", adminOnly, getAllUsers);
router.delete("/:id", adminOnly, deleteUser);

export default router;