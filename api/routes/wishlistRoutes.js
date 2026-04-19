import express from "express";
import { protect } from "../middleware/auth.js";
import { 
    getWishlist,
    addToWishlist,
    toggleWishlist,
    removeFromWishlist

  } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", protect, getWishlist);
router.post("/", protect, addToWishlist);
router.post("/toggle", protect, toggleWishlist);
router.delete("/:productId", protect, removeFromWishlist);

export default router;