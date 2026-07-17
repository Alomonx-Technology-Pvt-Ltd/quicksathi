import { Router } from "express";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Contact from "../models/Contact.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import nodemailer from "nodemailer";

const router = Router();

// POST /api/contact — Submit contact form (Public)
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ message: "Please fill in all required fields (First Name, Email, and Message)" });
    }

    // 1. Save to the database
    const contactMessage = await Contact.create({
      firstName,
      lastName,
      email,
      message,
    });

    const senderName = `${firstName} ${lastName || ""}`.trim();

    // 2. Find all Admin users in the database
    const admins = await User.find({ role: "admin" });

    // 3. Create in-app system notifications for each admin
    if (admins.length > 0) {
      const notificationPromises = admins.map(admin => {
        return Notification.create({
          recipient: admin._id,
          title: "New Contact Message Received",
          message: `From: ${senderName} (${email})\n\nMessage: ${message}`,
          type: "system",
          read: false
        });
      });
      await Promise.all(notificationPromises);
    }

    // 4. Send Email notification to Admins
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSender = process.env.SMTP_SENDER || `"QuickSathi Notifications" <no-reply@quicksathi.com>`;

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    const emailSubject = `Contact Form: ${senderName} has sent a message`;
    const emailBody = `You have received a new message from the contact form on QuickSathi.\n\n` +
                      `Name: ${senderName}\n` +
                      `Email: ${email}\n` +
                      `Date: ${new Date().toLocaleString()}\n\n` +
                      `Message:\n${message}`;

    if (smtpHost && smtpUser && smtpPass && adminEmails.length > 0) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465,
        auth: { user: smtpUser, pass: smtpPass }
      });

      await transporter.sendMail({
        from: smtpSender,
        to: adminEmails.join(", "),
        subject: emailSubject,
        text: emailBody,
        html: `<div style="font-family: sans-serif; padding: 25px; color: #333; line-height: 1.6; max-width: 600px; border: 1px solid #e8ddd4; border-radius: 12px; background-color: #faf7f3;">
                 <h2 style="color: #8b1a1a; margin-top: 0; font-family: Georgia, serif;">New Contact Submission</h2>
                 <p style="margin: 5px 0;"><strong>Sender Name:</strong> ${senderName}</p>
                 <p style="margin: 5px 0;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #8b1a1a;">${email}</a></p>
                 <p style="margin: 5px 0;"><strong>Date Received:</strong> ${new Date().toLocaleString()}</p>
                 <hr style="border: 0; border-top: 1px dashed #c4a882; margin: 20px 0;" />
                 <p style="white-space: pre-line; background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e8ddd4;">${message}</p>
                 <hr style="border: 0; border-top: 1px solid #e8ddd4; margin: 20px 0;" />
                 <p style="font-size: 11px; color: #9a8478; text-align: center; margin: 0;">This email was sent automatically from QuickSathi's system dispatcher.</p>
               </div>`
      });
    } else {
      console.log("\n=================== MOCK CONTACT EMAIL ALERT ===================");
      console.log(`FROM: ${smtpSender}`);
      console.log(`TO ADMINS: ${adminEmails.join(", ")}`);
      console.log(`SUBJECT: ${emailSubject}`);
      console.log(`BODY:\n${emailBody}`);
      console.log("================================================================\n");
    }

    res.status(201).json({
      success: true,
      message: "Your message has been received! Our support team will get in touch soon.",
      data: contactMessage
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({ message: error.message || "Failed to process contact submission" });
  }
});

// GET /api/contact/admin-list — Admin: retrieve list of contact messages
router.get("/admin-list", protect, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find().sort("-createdAt");
    res.json(contacts);
  } catch (error) {
    console.error("Fetch contacts admin error:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve contact submissions" });
  }
});

// PATCH /api/contact/admin-list/:id — Admin: change message status (read / archived)
router.patch("/admin-list/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["unread", "read", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({ message: error.message || "Failed to update status" });
  }
});

// DELETE /api/contact/admin-list/:id — Admin: delete contact message
router.delete("/admin-list/:id", protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact message not found" });
    }
    res.json({ message: "Contact message deleted successfully" });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({ message: error.message || "Failed to delete message" });
  }
});

export default router;
