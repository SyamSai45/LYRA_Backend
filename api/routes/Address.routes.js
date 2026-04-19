import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/Address.controller.js";

const router = express.Router();
router.use(protect);

router.get("/",              getAddresses);      // GET    /api/addresses
router.post("/",             createAddress);     // POST   /api/addresses
router.put("/:id",           updateAddress);     // PUT    /api/addresses/:id
router.delete("/:id",        deleteAddress);     // DELETE /api/addresses/:id
router.patch("/:id/default", setDefaultAddress); // PATCH  /api/addresses/:id/default

export default router;