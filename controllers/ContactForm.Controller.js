import ContactForm from "../api/models/ContactForm.model.js";

// ── CREATE CONTACT (PUBLIC)
export const createContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, orderId, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (message.length < 10) {
      return res.status(400).json({ message: "Message too short" });
    }

    const contact = await ContactForm.create({
      name,
      email,
      phone,
      subject,
      orderId,
      message,
      userId: req.user?._id || null
    });

    res.status(201).json({
      success: true,
      message: "Message submitted",
      id: contact._id
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET ALL CONTACTS (ADMIN)
export const getContactForms = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }

    const contacts = await ContactForm.find(query)
      .sort({ createdAt: -1 });

    res.json({ contacts });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE STATUS
export const updateContactFormStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const updated = await ContactForm.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Contact form not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE CONTACT
export const deleteContactForm = async (req, res) => {
  try {
    await ContactForm.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getContactFormById = async (req, res) => {
  try {
    const contact = await ContactForm.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact form not found" });
    }
    res.json(contact);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};