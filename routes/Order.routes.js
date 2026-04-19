import express from "express";
import { protect } from "../middleware/auth.js";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder
} from "../controllers/Order.controller.js";

const router = express.Router();
router.use(protect);

router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);


export default router;