import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// routes
import { authRoutes } from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import wishlistRoutes from "../routes/wishlistRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import bannerRoutes from "../routes/bannerRoutes.js";
import addressRoutes from "../routes/Address.routes.js";
import orderRoutes from "../routes/Order.routes.js";
import couponRoutes from "../routes/Coupon.routes.js";
import HeroslideRoutes from "../routes/Heroslide.routes.js";
import CategoryRoutes from "../routes/Category.routes.js";
import AnalyticsRoutes from "../routes/AnalyticsRoutes.js";
import ContactFormRoutes from "../routes/ContactFormRoutes.js";

const app = express();

// ✅ CORS (update later with your frontend URL)
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/users", userRoutes);
app.use("/api/users", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", HeroslideRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/admin/categories", CategoryRoutes);
app.use("/api/admin/analytics", AnalyticsRoutes);
app.use("/api/admin/contact", ContactFormRoutes);

// test route
app.get("/", (req, res) => {
  res.json({ message: "✦ Lyra API is running", status: "ok" });
});

// ✅ Mongo connection (serverless-safe)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo error:", err);
    throw err;
  }
}

// ✅ REQUIRED for Vercel
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}