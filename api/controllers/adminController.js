// import Product from "../models/product.js";
// import Order from "../models/Order.model.js";
// import User from "../models/User.js";

// export const saveProduct = async (req, res) => {
//   try {
//     const data = req.body;

//     // Convert sizes/colors from string → array
//     data.sizes  = typeof data.sizes === "string"  ? data.sizes.split(",").map(s => s.trim()) : data.sizes;
//     data.colors = typeof data.colors === "string" ? data.colors.split(",").map(c => c.trim()) : data.colors;

//     data.images = [data.image];

//     if (data._id) {
//       const updated = await Product.findByIdAndUpdate(data._id, data, { new: true });
//       return res.json(updated);
//     }

//     const product = await Product.create(data);
//     res.json(product);

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 📦 GET PRODUCTS
// export const getProducts = async (req, res) => {
//   const products = await Product.find().sort({ createdAt: -1 });
//   res.json(products);
// };

// export const deleteProduct = async (req, res) => {
//   await Product.findByIdAndDelete(req.params.id);
//   res.json({ message: "Deleted" });
// };

// export const getOrders = async (req, res) => {
//   const orders = await Order.find().sort({ createdAt: -1 });
//   res.json(orders);
// };

// export const updateOrder = async (req, res) => {
//   const updated = await Order.findByIdAndUpdate(
//     req.params.id,
//     { status: req.body.status },
//     { returnDocument: "after" }
//   );
//   res.json(updated);
// };



// export const getDashboard = async (req, res) => {
//   const orders = await Order.find();
//   const products = await Product.countDocuments();
//   const users = await User.countDocuments();

//   const revenue = orders
//     .filter(o => o.status !== "Cancelled")
//     .reduce((s, o) => s + o.total, 0);

//   const pending = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;

//   res.json({
//     totalRevenue: revenue,
//     totalOrders: orders.length,
//     pendingOrders: pending,
//     totalProducts: products,
//     totalUsers: users
//   });
// };


// export const getUsers = async (req, res) => {
//   try {
//     const users = await User.find();

//     const formatted = users.map((u) => ({
//       id: u._id,
//       name: u.fullName,
//       email: u.email,
//       phone: u.mobileNumber,
//       city: u.city || "—",
//       orders: 0,
//       spent: 0,
//       joined: u.createdAt,
//       status: "Active",
//     }));

//     res.json(formatted);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getOrdersByUser = async (req, res) => {
//   try {
//     const userId = req.params.userId; 
//     const orders = await Order.find({ user: userId })
//       .sort({ createdAt: -1 });

//     res.json(orders);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const adminGetOrderById = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate("user", "fullName email mobileNumber");

//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }

//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// export const adminUpdatePaymentStatus = async (req, res) => {
//   try {
//     const { paymentStatus } = req.body;
//     const validPayment = ["pending", "paid", "failed", "refunded"];
//     if (!validPayment.includes(paymentStatus))
//       return res.status(400).json({ error: `Invalid paymentStatus: ${paymentStatus}` });
 
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ error: "Order not found" });
 
//     order.paymentStatus = paymentStatus;
//     order.statusTimeline.push({
//       status:    order.status,
//       message:   `Payment status updated to ${paymentStatus} by admin`,
//       timestamp: new Date(),
//     });
 
//     await order.save();
//     res.json({
//       message: "Payment status updated",
//       order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
 
// export const adminUpdateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
//     if (!validStatuses.includes(status))
//       return res.status(400).json({ error: `Invalid status: ${status}` });
 
//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ error: "Order not found" });
 
//     order.status = status;
//     order.statusTimeline.push({ status, message: `Status updated to ${status} by admin`, timestamp: new Date() });
 
//     // Auto-mark COD as paid on delivery
//     if (status === "Delivered" && order.paymentMethod === "cod") {
//       order.paymentStatus = "paid";
//     }
//     // Auto-mark as refunded on cancel if already paid
//     if (status === "Cancelled" && order.paymentStatus === "paid") {
//       order.paymentStatus = "refunded";
//     }
 
//     await order.save();
//     res.json({
//       message: "Order status updated",
//       order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
 
// export const adminGetAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("user", "fullName email mobileNumber createdAt")
//       .sort({ createdAt: -1 })
//       .lean();
 
//     const enriched = orders.map((o) => ({
//       ...o,
//       orderNumber:    "LYR" + o._id.toString().slice(-8).toUpperCase(),
//       userName:   o.user?.fullName || o.address?.fullName || "Unknown",
//       userEmail:  o.user?.email || "",
//       userPhone:  o.user?.mobileNumber || o.address?.phone || "",
//       userId:     o.user?._id || null,
//       // Safe item count (never render the array directly in JSX)
//       itemCount:      Array.isArray(o.items) ? o.items.length : 0,
//     }));
 
//     res.json(enriched);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import Product from "../api/models/product.js";
import Order from "../api/models/Order.model.js";
import User from "../api/models/User.js";

// ── helper: parse comma-separated strings ───────────────────────
const toArray = (v) =>
  Array.isArray(v) ? v : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

// ── SAVE product (create or update) ─────────────────────────────
export const saveProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    data.sizes  = toArray(data.sizes);
    data.colors = toArray(data.colors);

     // 🔥 CLOUDINARY IMAGES
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(file => file.path);
    }

    // Sync primaryCategory ↔ category
    if (!data.primaryCategory) data.primaryCategory = data.category;
    if (!data.category)        data.category        = data.primaryCategory;

    if (data._id) {
      const updated = await Product.findByIdAndUpdate(data._id, data, { new: true });
      return res.json({ product: updated });
    }

    const product = await Product.create(data);
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET all products ─────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const { category, primaryCategory, subCategory, subCategoryItem, brand, search } = req.query;
    const filter = {};
    if (category || primaryCategory) filter.$or = [
      { category:        category || primaryCategory },
      { primaryCategory: category || primaryCategory },
    ];
    if (subCategory)     filter.subCategory     = subCategory;
    if (subCategoryItem) filter.subCategoryItem = subCategoryItem;
    if (brand)           filter.brand           = brand;
    if (search)          filter.$text           = { $search: search };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET single product ───────────────────────────────────────────
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE product ───────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── ORDERS ───────────────────────────────────────────────────────
export const getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
};

export const updateOrder = async (req, res) => {
  const updated = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { returnDocument: "after" }
  );
  res.json(updated);
};

// ── DASHBOARD summary ────────────────────────────────────────────
export const getDashboard = async (req, res) => {
  const orders   = await Order.find();
  const products = await Product.countDocuments();
  const users    = await User.countDocuments();

  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  const pending = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing"
  ).length;

  res.json({ totalRevenue: revenue, totalOrders: orders.length, pendingOrders: pending, totalProducts: products, totalUsers: users });
};

// ── USERS ────────────────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    const formatted = users.map((u) => ({
      id: u._id, name: u.fullName, email: u.email, phone: u.mobileNumber,
      city: u.city || "—", orders: 0, spent: 0, joined: u.createdAt, status: "Active",
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminGetOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "fullName email mobileNumber");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const valid = ["pending","paid","failed","refunded"];
    if (!valid.includes(paymentStatus)) return res.status(400).json({ error: `Invalid paymentStatus: ${paymentStatus}` });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.paymentStatus = paymentStatus;
    order.statusTimeline.push({ status: order.status, message: `Payment updated to ${paymentStatus}`, timestamp: new Date() });
    await order.save();
    res.json({ message: "Payment status updated", order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Pending","Processing","Shipped","Delivered","Cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ error: `Invalid status: ${status}` });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = status;
    order.statusTimeline.push({ status, message: `Status updated to ${status} by admin`, timestamp: new Date() });
    if (status === "Delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
    if (status === "Cancelled" && order.paymentStatus === "paid") order.paymentStatus = "refunded";
    await order.save();
    res.json({ message: "Order status updated", order: { ...order.toJSON(), orderNumber: "LYR" + order._id.toString().slice(-8).toUpperCase() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const adminGetAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user","fullName email mobileNumber createdAt").sort({ createdAt: -1 }).lean();
    const enriched = orders.map((o) => ({
      ...o,
      orderNumber: "LYR" + o._id.toString().slice(-8).toUpperCase(),
      userName:    o.user?.fullName || o.address?.fullName || "Unknown",
      userEmail:   o.user?.email || "",
      userPhone:   o.user?.mobileNumber || o.address?.phone || "",
      userId:      o.user?._id || null,
      itemCount:   Array.isArray(o.items) ? o.items.length : 0,
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};