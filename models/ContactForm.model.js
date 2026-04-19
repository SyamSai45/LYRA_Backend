import mongoose from "mongoose";

const contactFormSchema = new mongoose.Schema(
{
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, trim: true, lowercase: true },
  phone:    { type: String, default: "" },

  subject:  { type: String, required: true },
  orderId:  { type: String, default: "" },
  message:  { type: String, required: true },

  status: {
    type: String,
    enum: ["new", "in-progress", "resolved", "closed"],
    default: "new"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  notes: { type: String, default: "" }
},
{ timestamps: true }
);

export default mongoose.model("ContactForm", contactFormSchema);