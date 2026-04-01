// models/HeroSlide.model.js
import mongoose from "mongoose";

const HeroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    titleAccent: {
      type: String,
      default: "",
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    cta: {
      type: String,
      default: "Shop Now",
      trim: true,
    },
    overlay: {
      type: String,
      default: "rgba(15,5,30,0.52)",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Always sort by `order` ascending by default
HeroSlideSchema.index({ order: 1 });

export default mongoose.models.HeroSlide ||
  mongoose.model("HeroSlide", HeroSlideSchema);