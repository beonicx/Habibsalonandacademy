const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendBookingNotification = async (booking) => {
  try {
    const salonMail = transporter.sendMail({
      from: `"Habib Salon and Academy" <${process.env.SMTP_USER}>`,
      to: process.env.SALON_EMAIL,
      subject: "📅 New Booking Received",
      html: `
        <h2>New Booking</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Notes:</strong> ${booking.notes}</p>
      `,
    });

    const clientMail = transporter.sendMail({
      from: `"Habib Salon and Academy" <${process.env.SMTP_USER}>`,
      to: booking.email,
      subject: "✅ Your Booking is Confirmed – Habib Salon and Academy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
          <div style="background: #1a1a2e; color: #fff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Habib Salon and Academy</h1>
          </div>
          <div style="padding: 24px;">
            <p>Hi <strong>${booking.name}</strong>,</p>
            <p>Thank you for booking with us! Here are your appointment details:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr><td style="padding: 8px 0; color: #666;">Service</td><td style="padding: 8px 0; font-weight: bold;">${booking.service}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Date</td><td style="padding: 8px 0; font-weight: bold;">${booking.date}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Time</td><td style="padding: 8px 0; font-weight: bold;">${booking.time}</td></tr>
              ${booking.notes ? `<tr><td style="padding: 8px 0; color: #666;">Notes</td><td style="padding: 8px 0;">${booking.notes}</td></tr>` : ""}
            </table>
            <p>We'll send you a reminder before your appointment. If you need to reschedule or cancel, please contact us.</p>
            <p style="margin-top: 24px;">See you soon!<br><strong>Habib Salon and Academy</strong></p>
          </div>
        </div>
      `,
    });

    const [salonInfo, clientInfo] = await Promise.all([salonMail, clientMail]);
    console.log("📧 Salon notification sent", salonInfo.messageId);
    console.log("📧 Client confirmation sent", clientInfo.messageId);
  } catch (error) {
    console.error("Email error:", error);
  }
};

const sendAppointmentStatusEmail = async (appointment, status, cancellationReason) => {
  if (!appointment.customerEmail) return;

  const subjects = {
    confirmed: "✅ Your Appointment is Confirmed – Habib Salon and Academy",
    cancelled: "❌ Your Appointment has been Cancelled – Habib Salon and Academy",
    completed: "🙏 Thank You for Visiting – Habib Salon and Academy",
  };

  const bodies = {
    confirmed: `
      <p>Hi <strong>${appointment.customerName}</strong>,</p>
      <p>Great news! Your appointment on <strong>${new Date(appointment.date).toLocaleDateString()}</strong> at <strong>${appointment.timeSlot}</strong> has been confirmed.</p>
      <p>We look forward to seeing you!</p>
    `,
    cancelled: `
      <p>Hi <strong>${appointment.customerName}</strong>,</p>
      <p>We're sorry to inform you that your appointment on <strong>${new Date(appointment.date).toLocaleDateString()}</strong> at <strong>${appointment.timeSlot}</strong> has been cancelled.</p>
      ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ""}
      <p>Please feel free to book another appointment at your convenience.</p>
    `,
    completed: `
      <p>Hi <strong>${appointment.customerName}</strong>,</p>
      <p>Thank you for visiting Habib Salon and Academy! We hope you had a wonderful experience.</p>
      <p>We'd love to see you again soon.</p>
    `,
  };

  if (!subjects[status]) return;

  try {
    const info = await transporter.sendMail({
      from: `"Habib Salon and Academy" <${process.env.SMTP_USER}>`,
      to: appointment.customerEmail,
      subject: subjects[status],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
          <div style="background: #1a1a2e; color: #fff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">Habib Salon and Academy</h1>
          </div>
          <div style="padding: 24px;">
            ${bodies[status]}
            <p style="margin-top: 24px;">Best regards,<br><strong>Habib Salon and Academy</strong></p>
          </div>
        </div>
      `,
    });
    console.log(`📧 Status email (${status}) sent to ${appointment.customerEmail}`, info.messageId);
  } catch (error) {
    console.error("Status email error:", error);
  }
};

module.exports = { sendBookingNotification, sendAppointmentStatusEmail };