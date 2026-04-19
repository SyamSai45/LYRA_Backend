// controllers/heroSlide.controller.js
import HeroSlide from "../api/models/Heroslide.model.js";
// ─── Seed data (mirrors the original Dashboard mock slides) ───────
// POST /api/admin/hero-slides/seed   →  populates DB if empty
const SEED_SLIDES = [
  {
    title: "New Season",
    titleAccent: "Collection",
    subtitle:
      "Discover exclusive summer styles with modern elegance and timeless designs.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    cta: "Shop Now",
    overlay: "rgba(15,5,30,0.52)",
    active: true,
    order: 1,
  },
  {
    title: "Luxury",
    titleAccent: "Redefined",
    subtitle: "Premium fashion curated for the discerning modern wardrobe.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80",
    cta: "Explore",
    overlay: "rgba(20,5,40,0.48)",
    active: true,
    order: 2,
  },
  {
    title: "Urban",
    titleAccent: "Style",
    subtitle:
      "Street-smart fashion meets refined luxury. Be effortlessly iconic.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600&q=80",
    cta: "View Collection",
    overlay: "rgba(10,5,25,0.58)",
    active: true,
    order: 3,
  },
];

// ── GET /api/admin/hero-slides ─────────────────────────────────────
// Returns all slides sorted by order (active + inactive for admin panel)
export const getAllSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: slides.length, slides });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch hero slides", error: err.message });
  }
};

// ── GET /api/admin/hero-slides/active ─────────────────────────────
// Returns only active slides — used by Dashboard frontend
export const getActiveSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ active: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json({ success: true, count: slides.length, slides });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch active slides", error: err.message });
  }
};

// ── GET /api/admin/hero-slides/:id ────────────────────────────────
export const getSlideById = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, message: "Hero slide not found" });
    }
    res.status(200).json({ success: true, slide });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch slide", error: err.message });
  }
};

// ── POST /api/admin/hero-slides ───────────────────────────────────
// Body: { title, titleAccent, subtitle, image, cta, overlay, active, order }
export const createSlide = async (req, res) => {
  try {
    const { title, titleAccent, subtitle, image, cta, overlay, active, order } =
      req.body;

    if (!title || !image) {
      return res
        .status(400)
        .json({ success: false, message: "title and image are required" });
    }

    const slide = await HeroSlide.create({
      title,
      titleAccent,
      subtitle,
      image,
      cta,
      overlay,
      active,
      order,
    });

    res.status(201).json({ success: true, slide });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create slide", error: err.message });
  }
};

// ── PUT /api/admin/hero-slides/:id ────────────────────────────────
// Full or partial update — send only fields that changed
export const updateSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, message: "Hero slide not found" });
    }
    res.status(200).json({ success: true, slide });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update slide", error: err.message });
  }
};

// ── PATCH /api/admin/hero-slides/:id/toggle ───────────────────────
// Quickly toggle active/inactive without sending the full body
export const toggleSlideActive = async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, message: "Hero slide not found" });
    }
    slide.active = !slide.active;
    await slide.save();
    res.status(200).json({ success: true, slide });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to toggle slide", error: err.message });
  }
};

// ── DELETE /api/admin/hero-slides/:id ────────────────────────────
export const deleteSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res
        .status(404)
        .json({ success: false, message: "Hero slide not found" });
    }
    res.status(200).json({ success: true, message: "Slide deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete slide", error: err.message });
  }
};

// ── POST /api/admin/hero-slides/seed ─────────────────────────────
// Inserts the 3 mock slides only if the collection is empty.
// Safe to call multiple times — will not duplicate.
export const seedSlides = async (req, res) => {
  try {
    const existing = await HeroSlide.countDocuments();
    if (existing > 0) {
      return res.status(200).json({
        success: true,
        message: `Collection already has ${existing} slide(s). Seed skipped.`,
      });
    }
    const inserted = await HeroSlide.insertMany(SEED_SLIDES);
    res.status(201).json({
      success: true,
      message: `${inserted.length} slides seeded successfully`,
      slides: inserted,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Seed failed", error: err.message });
  }
};


