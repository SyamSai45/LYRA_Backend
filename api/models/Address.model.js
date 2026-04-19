import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label:    { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    fullName: { type: String, required: [true, "Full name is required"], trim: true },
    phone:    {
      type: String,
      required: [true, "Phone is required"],
      validate: { validator: (v) => /^\d{10}$/.test(v), message: "Phone must be 10 digits" },
    },
    street:  { type: String, required: [true, "Street is required"], trim: true },
    city:    { type: String, required: [true, "City is required"],   trim: true },
    state:   { type: String, required: [true, "State is required"],  trim: true },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      validate: { validator: (v) => /^\d{6}$/.test(v), message: "Pincode must be 6 digits" },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure only one default address per user
// addressSchema.pre("save", async function (next) {
//   if (this.isDefault && this.isModified("isDefault")) {
//     await this.constructor.updateMany(
//       { user: this.user, _id: { $ne: this._id } },
//       { $set: { isDefault: false } }
//     );
//   }
//   next();
// });

export default mongoose.model("Address", addressSchema);