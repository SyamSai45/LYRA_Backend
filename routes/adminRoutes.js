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

const router = express.Router();

router.get("/products", getProducts);
router.post("/products", saveProduct);
router.put("/products/:id", saveProduct);
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