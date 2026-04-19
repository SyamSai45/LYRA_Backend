import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

// ══════════════════════════════════════════
// Protect Middleware
// ══════════════════════════════════════════
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

    if (!token) {
      return res.status(401).json({ error: "No token" });
    }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
// ══════════════════════════════════════════
// Admin Middleware
// ══════════════════════════════════════════
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

// ══════════════════════════════════════════
// Generate JWT
// ══════════════════════════════════════════
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ══════════════════════════════════════════
// Login User
// ══════════════════════════════════════════
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ bcrypt password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
