
import express from "express";

const router = express.Router();

import {
    getActiveSlides,
    seedSlides,
    createSlide,
    getAllSlides,
    getSlideById,
    updateSlide,
    deleteSlide,
    toggleSlideActive
} from "../controllers/Heroslide.controller.js";

router.get("/hero-slides/active", getActiveSlides);
router.post("/hero-slides/seed", seedSlides);
router.post("/hero-slides/", createSlide);
router.get("/hero-slides/", getAllSlides);
router.get("/hero-slides/:id", getSlideById);
router.put("/hero-slides/:id", updateSlide);
router.delete("/hero-slides/:id", deleteSlide);
router.patch("/hero-slides/:id/toggle", toggleSlideActive);



export default router;