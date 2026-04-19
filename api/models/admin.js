import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: String,

  user: {
    name: String,
    email: String,
    phone: String,
    city: String,
  },

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    }
  ],

  total: Number,
  payment: String,

  status: {
    type: String,
    default: "Pending"
  },

}, { timestamps: true });

const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  mobileNumber: String,
  city: String,
  orders: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  status: { type: String, default: "Active" }
}, { timestamps: true });


export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export const User = mongoose.models.User || mongoose.model("User", userSchema);