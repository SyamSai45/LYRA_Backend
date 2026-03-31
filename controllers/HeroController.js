export const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createHeroSlide = async (req, res) => {
  try {
    const slide = new HeroSlide(req.body);
    const createdSlide = await slide.save();
    res.status(201).json(createdSlide);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Data', error: error.message });
  }
};

export const updateHeroSlide = async (req, res) => {
  try {
    const updatedSlide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedSlide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }
    res.json(updatedSlide);
  } catch (error) {
    res.status(400).json({ message: 'Invalid Data', error: error.message });
  }
};
export const deleteHeroSlide = async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }
    res.json({ message: 'Hero slide removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getActiveHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};