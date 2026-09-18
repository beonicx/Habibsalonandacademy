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
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const salonMail = transporter.sendMail({
      from: `"Habib Salon and Academy" <${process.env.SMTP_USER}>`,
      to: process.env.SALON_EMAIL,
      subject: `New Booking – ${booking.name} | ${booking.service}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 28px 32px; border-radius: 8px 8px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">Habib Salon and Academy</h1></td>
              <td align="right"><span style="background: #e94560; color: #fff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px;">NEW BOOKING</span></td>
            </tr></table>
          </div>

          <!-- Body -->
          <div style="border: 1px solid #e8e8e8; border-top: none; border-radius: 0 0 8px 8px; padding: 0;">

            <!-- Quick Summary Bar -->
            <div style="background: #f0f4ff; padding: 16px 32px; border-bottom: 1px solid #e8e8e8;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="font-size: 14px; color: #555;"><strong style="color: #1a1a2e;">${booking.name}</strong> booked <strong style="color: #1a1a2e;">${booking.service}</strong></td>
                <td align="right" style="font-size: 13px; color: #888;">Just now</td>
              </tr></table>
            </div>

            <!-- Customer Details -->
            <div style="padding: 24px 32px 0;">
              <h3 style="margin: 0 0 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600;">Customer Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; width: 36px; vertical-align: top;">
                    <span style="font-size: 16px;">&#128100;</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777; width: 80px;">Name</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1a1a2e; font-weight: 600;">${booking.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top;">
                    <span style="font-size: 16px;">&#9993;</span>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #777;">Email</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #1a1a2e;">
                    <a href="mailto:${booking.email}" style="color: #3366cc; text-decoration: none;">${booking.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; vertical-align: top;">
                    <span style="font-size: 16px;">&#128222;</span>
                  </td>
                  <td style="padding: 10px 0; color: #777;">Phone</td>
                  <td style="padding: 10px 0; color: #1a1a2e;">
                    <a href="tel:${booking.phone}" style="color: #3366cc; text-decoration: none;">${booking.phone}</a>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Appointment Details -->
            <div style="padding: 24px 32px 0;">
              <h3 style="margin: 0 0 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600;">Appointment Details</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 50%; padding-right: 8px;">
                    <div style="background: #f8f9fc; border-radius: 8px; padding: 16px; text-align: center;">
                      <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Service</div>
                      <div style="font-size: 16px; font-weight: 700; color: #1a1a2e;">${booking.service}</div>
                    </div>
                  </td>
                  <td style="width: 50%; padding-left: 8px;">
                    <div style="background: #f8f9fc; border-radius: 8px; padding: 16px; text-align: center;">
                      <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Time Slot</div>
                      <div style="font-size: 16px; font-weight: 700; color: #1a1a2e;">${booking.time}</div>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 12px; background: #f8f9fc; border-radius: 8px; padding: 16px; text-align: center;">
                <div style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Date</div>
                <div style="font-size: 16px; font-weight: 700; color: #1a1a2e;">${formattedDate}</div>
              </div>
            </div>

            <!-- Notes -->
            ${booking.notes ? `
            <div style="padding: 24px 32px 0;">
              <h3 style="margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600;">Customer Notes</h3>
              <div style="background: #fffbf0; border-left: 3px solid #f5a623; border-radius: 0 6px 6px 0; padding: 12px 16px; font-size: 14px; color: #555; line-height: 1.5;">
                ${booking.notes}
              </div>
            </div>
            ` : ""}

            <!-- Footer -->
            <div style="padding: 24px 32px; margin-top: 24px; border-top: 1px solid #f0f0f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #bbb;">This is an automated notification from your booking system.</p>
            </div>
          </div>
        </div>
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

    const results = await Promise.allSettled([salonMail, clientMail]);
    if (results[0].status === "fulfilled") {
      console.log("📧 Salon notification sent", results[0].value.messageId);
    } else {
      console.error("📧 Salon notification FAILED:", results[0].reason?.message || results[0].reason);
    }
    if (results[1].status === "fulfilled") {
      console.log("📧 Client confirmation sent", results[1].value.messageId);
    } else {
      console.error("📧 Client confirmation FAILED:", results[1].reason?.message || results[1].reason);
    }
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