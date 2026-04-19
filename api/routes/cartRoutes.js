import express from "express";
import { 
    getCart,
    updateCartItem,
    addToCart,
    removeCartItem,
    clearCart
 } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getCart);
router.put("/:cartItemId", protect, updateCartItem);
router.post("/", protect, addToCart);
router.delete("/:cartItemId", protect, removeCartItem);
router.delete("/", protect, clearCart);

export default router;