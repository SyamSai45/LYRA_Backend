import express from "express";
import {
  getCategories,
  adminGetCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  addColumn,
  updateColumn,
  deleteColumn,
  addSubCategory,
  deleteSubCategory,
  seedCategories,
  reorderCategories,
} from "../controllers/Category.controller.js";

const router = express.Router();

// ── Public (used by dashboard, category page) ───────────────────
// GET /api/categories           → all active categories (mega menu data)
router.get("/", getCategories);

// ── Admin ───────────────────────────────────────────────────────
// GET    /api/admin/categories          → all categories (incl. inactive)
// POST   /api/admin/categories          → create new primary category
// PUT    /api/admin/categories/:id      → update category meta
// DELETE /api/admin/categories/:id      → delete category
// POST   /api/admin/categories/seed     → seed default data
// POST   /api/admin/categories/reorder  → reorder
router.get(   "",              adminGetCategories);
router.post(  "",              createCategory);
router.get(   "/:id",          getCategory);
router.put(   "/:id",          updateCategory);
router.delete("/:id",          deleteCategory);
router.post(  "/seed",         seedCategories);
router.post(  "/reorder",      reorderCategories);

// ── Columns ─────────────────────────────────────────────────────
// POST   /api/admin/categories/:id/columns           → add column
// PUT    /api/admin/categories/:id/columns/:colId    → update column title/order
// DELETE /api/admin/categories/:id/columns/:colId    → delete column
router.post(  "/:id/columns",                addColumn);
router.put(   "/:id/columns/:colId",         updateColumn);
router.delete("/:id/columns/:colId",         deleteColumn);

// ── Sub-categories ───────────────────────────────────────────────
// POST   /api/admin/categories/:id/columns/:colId/sub         → add sub-cat
// DELETE /api/admin/categories/:id/columns/:colId/sub/:subId  → delete sub-cat
router.post(  "/:id/columns/:colId/sub",               addSubCategory);
router.delete("/:id/columns/:colId/sub/:subId",        deleteSubCategory);

export default router;