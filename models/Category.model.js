import mongoose from "mongoose";

// ── Sub-category schema ────────────────────────────────────────────
const subCategorySchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  slug:  { type: String, trim: true },
  order: { type: Number, default: 0 },
});

// ── Column (group of sub-categories shown in mega menu) ───────────
const columnSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  subCategories: [subCategorySchema],
  order:       { type: Number, default: 0 },
});

// ── Primary (top-level) category ──────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    label:       { type: String, trim: true },           // display label (defaults to name)
    icon:        { type: String, default: "✦" },         // emoji or icon string
    badge:       { type: String },                       // e.g. "UP TO 70% OFF"
    badgeColor:  { type: String },                       // hex colour for badge background
    noMenu:      { type: Boolean, default: false },      // if true → no mega-dropdown
    featuredLabel:{ type: String },                      // e.g. "New Arrivals"
    featuredImg:  { type: String },                      // cover image URL for mega panel
    columns:     [columnSchema],                         // mega-menu columns
    order:       { type: Number, default: 0 },           // display order
    active:      { type: Boolean, default: true },
    // colour used in category sidebar cards
    color:       { type: String, default: "#7c3aed" },
    // hero image for category page banner
    heroImg:     { type: String },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;