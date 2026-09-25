import nodemailer from "nodemailer";

// Reuses the same env-var-driven configuration pattern as the rest of the
// backend (see config/db.ts). No credentials are ever hardcoded here.
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Email is not configured — check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env",
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465 (SSL), false for 587 (STARTTLS)
    auth: { user, pass },
  });

  return transporter;
};

export const sendOtpEmail = async (to: string, otp: string) => {
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const t = getTransporter();

  await t.sendMail({
    from: `"BirdFeast" <${from}>`,
    to,
    subject: "Your BirdFeast password reset code",
    text: `Your password reset code is ${otp}. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2f4a3c;">Reset your BirdFeast password</h2>
        <p>Use the code below to continue resetting your password. It expires in <strong>10 minutes</strong>.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2f4a3c;">${otp}</p>
        <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
      </div>
    `,
  });
};

export const sendContactEmail = async (data: {
  name: string;
  email: string;
  message: string;
}) => {
  const { name, email, message } = data;
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  // Falls back to the same inbox that sends mail if a dedicated recipient
  // isn't configured — set EMAIL_TO in .env to route contact messages
  // to a different address (e.g. support inbox) than the sender account.
  const to = process.env.EMAIL_TO || process.env.EMAIL_USER;
  const t = getTransporter();

  await t.sendMail({
    from: `"BirdFeast Contact Form" <${from}>`,
    to,
    replyTo: email,
    subject: `New contact message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2f4a3c;">New message from the BirdFeast contact form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p style="white-space: pre-wrap; border-left: 3px solid #2f4a3c; padding-left: 12px; color: #333;">${message}</p>
      </div>
    `,
  });
};
