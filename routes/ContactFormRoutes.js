import express from "express";
import { 
    createContactForm,
    getContactForms,
    getContactFormById,
    updateContactFormStatus,
    deleteContactForm

 } from "../controllers/ContactForm.Controller.js";

import { protect } from "../middleware/auth.js";


const router = express.Router();

router.use(protect);

router.post("/", createContactForm);
router.get("/", getContactForms);
router.get("/:id", getContactFormById);
router.put("/:id", updateContactFormStatus);
router.delete("/:id", deleteContactForm);

export default router;