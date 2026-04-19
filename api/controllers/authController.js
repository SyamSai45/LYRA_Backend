import jwt from "jsonwebtoken";
import User from "../api/models/User.js";
import bcrypt from "bcryptjs";

const generateOTP = 1234 ;

export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      confirmPassword,
    } = req.body;

    if (!fullName || !email || !mobileNumber || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (mobileNumber.length !== 10) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    if (!email.includes("@")) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check existing
    const existing = await User.findOne({ mobileNumber });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      fullName,
      email,
      mobileNumber,
      password: hashed,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { mobileNumber, password } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP;

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("OTP:", otp); 

    return res.json({
      message: "OTP sent",
      userId: user._id,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    
    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        email: user.email,
        profileImage: user.profileImage,
      },
    });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP;

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("Resent OTP:", otp);

    return res.json({
      message: "OTP resent successfully",
    });

  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOTP; 

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("RESET OTP:", otp);

    res.json({
      message: "OTP sent for password reset",
      userId: user._id,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user || user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId);

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};