import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import addressRoutes from "./routes/Address.routes.js";
import orderRoutes from "./routes/Order.routes.js";
import couponRoutes from "./routes/Coupon.routes.js";
import heroSlideRoutes from "./routes/HeroRoutes.js";

import { 
  adminGetAllOrders,
  adminUpdateOrderStatus
 } from "./controllers/Order.controller.js";

import { seedCoupons } from "./controllers/Coupon.controller.js";


dotenv.config();

const app = express();

app.use(cors({ 
  origin: [ 
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
  ],

   credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/users", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);

app.use("/api/admin", heroSlideRoutes);

app.get("/", (req, res) => {
  res.json({ message: "✦ Lyra API is running", status: "ok" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✦ MongoDB connected successfully");
    app.listen(process.env.PORT || 5055, () => {
      console.log(`✦ Lyra server running → http://localhost:${process.env.PORT || 6055}`);
    });
  })
  .catch((err) => {
    console.error("✦ MongoDB connection failed:", err.message);
    process.exit(1);
  });



  