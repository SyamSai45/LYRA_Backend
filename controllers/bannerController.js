import Banner from "../models/Banners.js";

// @desc    Get all banners
// @route   GET /api/banners
// @access  Private/Admin
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ position: 1, createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching banners" });
  }
};

// @desc    Get active banners
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ position: 1, createdAt: -1 })
      .select('-isActive -createdAt -__v');
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching active banners" });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  try {
    const banner = new Banner({
      title: req.body.title,
      subtitle: req.body.subtitle,
      image: req.body.image,
      link: req.body.link,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      position: req.body.position || "top",
      colorFrom: req.body.colorFrom || "from-purple-900",
      colorVia: req.body.colorVia || "via-violet-800",
      colorTo: req.body.colorTo || "to-purple-600",
      ctaText: req.body.ctaText || "Shop Now"
    });

    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error while creating banner" });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.bannerId);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    Object.assign(banner, req.body);

    const updatedBanner = await banner.save();
    res.status(200).json(updatedBanner);
  } catch (error) {
    res.status(500).json({ error: "Server error while updating banner" });
  }
};
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.bannerId);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    await banner.deleteOne();
    res.status(200).json({ message: "Banner removed" });
  } catch (error) {
    res.status(500).json({ error: "Server error while deleting banner" });
  }
};

export const toggleBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.status(200).json({ banner });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle banner status" });
  }
};

