import User from "../api/models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (fullName) user.fullName = fullName;
    if (email)    user.email    = email;

    // Cloudinary image upload
    if (req.file) user.profileImage = req.file.path;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id:          user._id,
        fullName:     user.fullName,
        email:        user.email,
        mobileNumber: user.mobileNumber,
        profileImage: user.profileImage,
        role:         user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both current and new password are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password must be at least 6 characters" });

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("address");
    res.status(200).json(user.address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { label, street, city, state, pincode, isDefault } = req.body;

    if (!street || !city || !state || !pincode)
      return res.status(400).json({ error: "Street, city, state and pincode are required" });

    const user = await User.findById(req.user._id);

    // If this is default, unset others
    if (isDefault) {
      user.address.forEach((a) => (a.isDefault = false));
    }

    user.address.push({ label, street, city, state, pincode, isDefault });
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      address: user.address,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.address.id(req.params.addressId);
    if (!address) return res.status(404).json({ error: "Address not found" });

    const { label, street, city, state, pincode, isDefault } = req.body;

    if (isDefault) user.address.forEach((a) => (a.isDefault = false));

    if (label)   address.label   = label;
    if (street)  address.street  = street;
    if (city)    address.city    = city;
    if (state)   address.state   = state;
    if (pincode) address.pincode = pincode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    res.status(200).json({ message: "Address updated", address: user.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.address.pull(req.params.addressId);
    await user.save();
    res.status(200).json({ message: "Address deleted", address: user.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getCartCount = async (req, res) => {
  try {
    // Lazy import to avoid circular deps
    const { Cart } = await import("../api/models/models.js");
    const cart  = await Cart.findOne({ user: req.params.userId });
    const count = cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0;
    res.status(200).json({ cartCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry").sort("-createdAt");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};