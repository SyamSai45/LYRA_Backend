import express from "express";
import {
  saveProduct,
  getProducts,
  deleteProduct,
  getOrders,
  updateOrder,
  getUsers,
  getDashboard,
  getOrdersByUser,
  adminUpdatePaymentStatus,
  adminUpdateOrderStatus,
  adminGetAllOrders,
  adminGetOrderById
} from "../controllers/adminController.js";

import { uploadProduct } from "../config/cloudinary.js";

const router = express.Router();

router.get("/products", getProducts);
router.post("/products", uploadProduct.array("images", 5), saveProduct);
router.put("/products/:id", uploadProduct.array("images", 5), saveProduct);
router.delete("/products/:id", deleteProduct);
router.get("/orders", getOrders);
router.put("/orders/:id", updateOrder);
router.get("/orders/user/:userId", getOrdersByUser);
router.get("/orders/:id", adminGetOrderById);
router.get("/orders/all", adminGetAllOrders);
router.patch("/orders/:id/payment", adminUpdatePaymentStatus);
router.patch("/:id/status", adminUpdateOrderStatus);
router.get("/users", getUsers);
router.get("/dashboard", getDashboard);


export default router;