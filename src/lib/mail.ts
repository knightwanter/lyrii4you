import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  const missing = [
    !host ? "SMTP_HOST" : null,
    !port ? "SMTP_PORT" : null,
    !user ? "SMTP_USER" : null,
    !pass ? "SMTP_PASS" : null,
  ].filter(Boolean) as string[];

  return {
    host,
    port,
    user,
    pass,
    missing,
  };
}

export function isSmtpConfigured() {
  return getSmtpConfig().missing.length === 0;
}

function getTransporter() {
  if (!transporter) {
    const smtp = getSmtpConfig();
    if (smtp.missing.length > 0) {
      throw new Error(`SMTP is not configured. Missing: ${smtp.missing.join(", ")}`);
    }

    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465, // true for 465, false for 587
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      tls: {
        // Accept self-signed certificates (common on self-hosted mail servers)
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to: string, otp: string) {
  const mail = getTransporter();
  const smtp = getSmtpConfig();

  await mail.sendMail({
    from: `"Lyrii" <${smtp.user}>`,
    to,
    subject: `Your Lyrii verification code: ${otp}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0514; color: #f0e7ff; border-radius: 16px;">
        <h1 style="color: #a78bfa; margin-bottom: 8px;">Welcome to Lyrii</h1>
        <p style="color: #b8a5d6; margin-bottom: 24px;">Your verification code is:</p>
        <div style="background: #1a0f30; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #a78bfa;">${otp}</span>
        </div>
        <p style="color: #7c6a9a; font-size: 14px;">This code expires in 10 minutes. If you didn't sign up for Lyrii, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const mail = getTransporter();
  const smtp = getSmtpConfig();

  await mail.sendMail({
    from: `"Lyrii" <${smtp.user}>`,
    to,
    subject,
    html,
  });
}
