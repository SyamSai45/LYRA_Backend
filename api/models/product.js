import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    brand:         { type: String, trim: true },

    // ── Category hierarchy ──────────────────────────────────────
    // category      → primary category name  (e.g. "Men")
    // primaryCategory → same as category (alias, kept for legacy)
    // subCategory   → column title          (e.g. "Clothing")
    // subCategoryItem → leaf link name      (e.g. "Shirts")
    category:         { type: String, trim: true },
    primaryCategory:  { type: String, trim: true },
    subCategory:      { type: String, trim: true },
    subCategoryItem:  { type: String, trim: true },

    // ── Pricing ─────────────────────────────────────────────────
    price:         { type: Number, required: true },
    originalPrice: { type: Number },
    

    // ── Details ─────────────────────────────────────────────────
    description:   { type: String },
    material:      { type: String },
    care:          { type: String },
    gender:        { type: String, enum: ["Men", "Women", "Unisex", "Boys", "Girls"], default: "Unisex" },
    badge:         { type: String },
    sku:           { type: String },

    // ── Media ───────────────────────────────────────────────────
    image:         { type: String },
    images:        [String],

    // ── Variants ────────────────────────────────────────────────
    sizes:         [String],
    colors:        [String],

    // ── Metrics ─────────────────────────────────────────────────
    rating:        { type: Number, default: 4 },
    reviews:       { type: Number, default: 0 },
    stock:         { type: Number, default: 100 },
  },
  { timestamps: true }
);

// Keep images[0] in sync with image field
productSchema.pre("save", function (next) {
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
  if (!this.primaryCategory && this.category) {
    this.primaryCategory = this.category;
  }

});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;