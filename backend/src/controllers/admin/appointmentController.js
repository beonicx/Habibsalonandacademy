const Booking = require("../../models/Booking");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const { sendAppointmentStatusEmail } = require("../../services/emailService");

async function getAllAppointments(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      date,
      startDate,
      endDate,
      search,
      sortBy = "date",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    }
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }

    const cappedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (Number(page) - 1) * cappedLimit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [appointments, total] = await Promise.all([
      Booking.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(cappedLimit)
        .populate("user", "name email phone"),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: cappedLimit,
        total,
        pages: Math.ceil(total / cappedLimit),
      },
    });
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
}

async function getAppointmentById(req, res) {
  try {
    const appointment = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("services.service");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error("Get appointment error:", err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
}

async function createAppointment(req, res) {
  try {
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      services,
      stylist,
      date,
      timeSlot,
      notes,
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !date || !timeSlot) {
      return res.status(400).json({ error: "Customer details, date and time are required" });
    }

    let totalAmount = 0;
    let totalDuration = 0;
    if (services && services.length) {
      for (const s of services) {
        totalAmount += s.price || 0;
        totalDuration += s.duration || 0;
      }
    }

    const booking = await Booking.create({
      user: userId || undefined,
      customerName,
      customerEmail,
      customerPhone,
      services,
      stylist,
      date,
      timeSlot,
      duration: totalDuration,
      totalAmount,
      finalAmount: totalAmount,
      notes,
      status: "confirmed",
    });

    if (userId) {
      await Notification.create({
        user: userId,
        title: "New Appointment",
        message: `Your appointment on ${new Date(date).toLocaleDateString()} at ${timeSlot} has been confirmed.`,
        type: "booking",
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ error: "Failed to create appointment" });
  }
}

async function updateAppointment(req, res) {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      services,
      stylist,
      date,
      timeSlot,
      notes,
      status,
    } = req.body;

    const updates = {};
    if (customerName !== undefined) updates.customerName = customerName;
    if (customerEmail !== undefined) updates.customerEmail = customerEmail;
    if (customerPhone !== undefined) updates.customerPhone = customerPhone;
    if (services !== undefined) {
      updates.services = services;
      let totalAmount = 0;
      let totalDuration = 0;
      for (const s of services) {
        totalAmount += s.price || 0;
        totalDuration += s.duration || 0;
      }
      updates.totalAmount = totalAmount;
      updates.duration = totalDuration;
      updates.finalAmount = totalAmount;
    }
    if (stylist !== undefined) updates.stylist = stylist;
    if (date !== undefined) updates.date = date;
    if (timeSlot !== undefined) updates.timeSlot = timeSlot;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    const appointment = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    const { status, cancellationReason } = req.body;
    const validStatuses = ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updates = { status };
    if (cancellationReason) updates.cancellationReason = cancellationReason;

    if (status === "completed") {
      const booking = await Booking.findById(req.params.id);
      if (booking && booking.user) {
        await User.findByIdAndUpdate(booking.user, {
          $inc: { visitCount: 1 },
          lastVisit: new Date(),
        });
      }
    }

    const appointment = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.user) {
      const messages = {
        confirmed: "Your appointment has been confirmed.",
        cancelled: `Your appointment has been cancelled.${cancellationReason ? ` Reason: ${cancellationReason}` : ""}`,
        completed: "Thank you for visiting! We hope you enjoyed your experience.",
      };
      if (messages[status]) {
        await Notification.create({
          user: appointment.user,
          title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: messages[status],
          type: "booking",
        });
      }
    }

    sendAppointmentStatusEmail(appointment, status, cancellationReason);

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
}

async function getTodayAppointments(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Booking.find({
      date: { $gte: today, $lt: tomorrow },
      status: { $nin: ["cancelled"] },
    })
      .sort({ timeSlot: 1 })
      .populate("user", "name email phone");

    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("Today appointments error:", err);
    res.status(500).json({ error: "Failed to fetch today's appointments" });
  }
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  getTodayAppointments,
};
