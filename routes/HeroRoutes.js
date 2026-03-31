import express from 'express';

import {
    getHeroSlides,
    getActiveHeroSlides,
    createHeroSlide,
    updateHeroSlide,
    deleteHeroSlide
} from '../controllers/HeroController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/herobanners/active', getActiveHeroSlides);
router.get('/herobanners/', protect, getHeroSlides);
router.post('/herobanners/', protect, createHeroSlide);
router.put('/herobanners/:slideId', protect, updateHeroSlide);
router.delete('/herobanners/:slideId', protect, deleteHeroSlide);

export default router;