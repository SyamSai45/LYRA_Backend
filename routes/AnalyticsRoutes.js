import express from "express";
import {
    getOverview,
    getRevenue,
    getCustomers,
    getProducts
} from "../controllers/AnalyticsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Apply middleware
router.use(protect);

// Routes
router.get("/overview", getOverview);
router.get("/revenue",   getRevenue);
router.get("/customers", getCustomers);
router.get("/products",  getProducts);

export default router;