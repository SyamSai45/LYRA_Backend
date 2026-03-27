import express from "express";
import { protect } from "../middleware/auth.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/Order.controller.js";

const router = express.Router();
router.use(protect);

router.post("/",              placeOrder);    // POST  /api/orders         — place order
router.get("/my",             getMyOrders);  // GET   /api/orders/my      — user's orders
router.get("/:id",            getOrderById); // GET   /api/orders/:id     — single order
router.patch("/:id/cancel",   cancelOrder);  // PATCH /api/orders/:id/cancel

export default router;