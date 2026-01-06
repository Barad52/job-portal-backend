const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // MUST be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 🔍 VERIFY TRANSPORTER
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Email config error:", err);
  } else {
    console.log("✅ Email server ready");
  }
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
};

module.exports = sendEmail;
