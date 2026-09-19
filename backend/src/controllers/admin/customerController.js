const crypto = require("crypto");
const User = require("../../models/User");
const Booking = require("../../models/Booking");
const Payment = require("../../models/Payment");
const SuperCoinTransaction = require("../../models/SuperCoinTransaction");
const Membership = require("../../models/Membership");

async function getAllCustomers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      tag,
      isActive,
    } = req.query;

    const filter = { role: "user" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (tag) filter.tags = tag;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [customers, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    const customerIds = customers.map((c) => c._id);
    const activeMemberships = await Membership.find({
      user: { $in: customerIds },
      status: "active",
    })
      .populate("plan", "name")
      .lean();

    const membershipMap = {};
    for (const m of activeMemberships) {
      membershipMap[m.user.toString()] = { planName: m.plan?.name, endDate: m.endDate };
    }

    const enriched = customers.map((c) => {
      const obj = c.toJSON();
      obj.activeMembership = membershipMap[c._id.toString()] || null;
      return obj;
    });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
}

async function getCustomerById(req, res) {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const [bookings, payments, superCoinHistory, activeMembership] = await Promise.all([
      Booking.find({ user: customer._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Payment.find({ user: customer._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("booking", "services date timeSlot status")
        .lean(),
      SuperCoinTransaction.find({ user: customer._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Membership.findOne({ user: customer._id, status: "active" })
        .populate("plan", "name price duration benefits discount")
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        customer,
        bookings,
        payments,
        superCoinHistory,
        activeMembership,
      },
    });
  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
}

async function createCustomer(req, res) {
  try {
    const { name, email, password, phone, gender, dateOfBirth, address, notes, tags } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const customer = await User.create({
      name,
      email,
      password: password || crypto.randomBytes(16).toString("hex"),
      phone,
      gender,
      dateOfBirth,
      address,
      notes,
      tags,
      role: "user",
    });

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    console.error("Create customer error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
}

async function updateCustomer(req, res) {
  try {
    const { name, phone, gender, dateOfBirth, address, notes, tags, isActive } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (gender !== undefined) updates.gender = gender;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (address !== undefined) updates.address = address;
    if (notes !== undefined) updates.notes = notes;
    if (tags !== undefined) updates.tags = tags;
    if (isActive !== undefined) updates.isActive = isActive;

    const customer = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ success: true, data: customer });
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
}

async function deleteCustomer(req, res) {
  try {
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deactivated" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
