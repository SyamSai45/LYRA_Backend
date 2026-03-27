import Address from "../models/Address.model.js";

// ── Helpers ───────────────────────────────────────────────────────────
const handleValidationError = (err, res) => {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join(", ") });
  }
  console.error(err);
  return res.status(500).json({ error: err.message || "Server error" });
};

// ──────────────────────────────────────────────────────────────────────
// GET /api/addresses
// Returns all addresses for the logged-in user, default first
// ──────────────────────────────────────────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────
// POST /api/addresses
// Body: { label, fullName, phone, street, city, state, pincode }
// First address is automatically set as default
// Returns: created address
// ──────────────────────────────────────────────────────────────────────
export const createAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, pincode } = req.body;

    // Validate required fields explicitly for clear error messages
    const missing = [];
    if (!fullName?.trim()) missing.push("fullName");
    if (!phone)            missing.push("phone");
    if (!street?.trim())   missing.push("street");
    if (!city?.trim())     missing.push("city");
    if (!state?.trim())    missing.push("state");
    if (!pincode)          missing.push("pincode");
    if (missing.length) return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });

    // Auto-set as default if user has no addresses yet
    const count = await Address.countDocuments({ user: req.user._id });
    const isDefault = count === 0;

    const address = new Address({
      user: req.user._id,
      label:    label    || "Home",
      fullName: fullName.trim(),
      phone:    phone.replace(/\D/g, ""),
      street:   street.trim(),
      city:     city.trim(),
      state:    state.trim(),
      pincode:  pincode.toString(),
      isDefault,
    });

    await address.save();
    res.status(201).json({ message: "Address saved", address });
  } catch (err) {
    handleValidationError(err, res);
  }
};

// ──────────────────────────────────────────────────────────────────────
// PUT /api/addresses/:id
// Body: partial or full address fields
// Returns: updated address
// ──────────────────────────────────────────────────────────────────────
export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ error: "Address not found" });

    const { label, fullName, phone, street, city, state, pincode } = req.body;
    if (label)    address.label    = label;
    if (fullName) address.fullName = fullName.trim();
    if (phone)    address.phone    = phone.replace(/\D/g, "");
    if (street)   address.street   = street.trim();
    if (city)     address.city     = city.trim();
    if (state)    address.state    = state.trim();
    if (pincode)  address.pincode  = pincode.toString();

    await address.save();
    res.json({ message: "Address updated", address });
  } catch (err) {
    handleValidationError(err, res);
  }
};

// ──────────────────────────────────────────────────────────────────────
// DELETE /api/addresses/:id
// If the deleted address was default, promotes the next one
// ──────────────────────────────────────────────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ error: "Address not found" });

    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If deleted address was default → promote the newest remaining one
    if (wasDefault) {
      const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ──────────────────────────────────────────────────────────────────────
// PATCH /api/addresses/:id/default
// Sets the specified address as default; unsets all others
// ──────────────────────────────────────────────────────────────────────
export const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ error: "Address not found" });

    // Unset all others first
    await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });

    address.isDefault = true;
    await address.save();

    res.json({ message: "Default address updated", address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};