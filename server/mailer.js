// Outgoing email (verification, password reset, notifications).
//
// Configure SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / MAIL_FROM in .env.
// Without SMTP_HOST (local development) messages are printed to the server
// console instead of being sent, so every flow still works end to end.
import nodemailer from 'nodemailer';

const APP_URL = (process.env.APP_URL || 'http://localhost:5173').replace(/\/+$/, '');
const MAIL_FROM = process.env.MAIL_FROM || 'Rwenanura Parents Primary School <no-reply@rwenanura.ac.rw>';

const transport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      // Never let message content pull in local files or remote URLs.
      disableFileAccess: true,
      disableUrlAccess: true,
    })
  : null;

export function appLink(params) {
  return `${APP_URL}/?${new URLSearchParams(params).toString()}`;
}

/**
 * Send a plain-text email. Never throws: a mail failure must not break the
 * request that triggered it (registration, status change, ...).
 */
export async function sendMail({ to, subject, text }) {
  if (!to) return false;
  if (!transport) {
    // In development, print the message so links can be followed. In
    // production never log it: it contains single-use login links.
    if (process.env.NODE_ENV === 'production') {
      console.warn(`📧 Email not sent (SMTP_HOST not configured): ${subject}`);
    } else {
      console.log(`📧 [mail not configured] To: ${to}\n   Subject: ${subject}\n   ${text.replace(/\n/g, '\n   ')}`);
    }
    return false;
  }
  try {
    await transport.sendMail({ from: MAIL_FROM, to, subject, text });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return false;
  }
}

export function sendVerificationEmail(to, name, token) {
  return sendMail({
    to,
    subject: 'Confirm your email address - RPPS',
    text: `Hello ${name},\n\nPlease confirm your email address to activate your Rwenanura Parents Primary School account:\n\n${appLink({ verify: token })}\n\nThis link expires in 24 hours. If you did not create an account, you can ignore this email.`,
  });
}

export function sendPasswordResetEmail(to, name, token) {
  return sendMail({
    to,
    subject: 'Reset your password - RPPS',
    text: `Hello ${name},\n\nWe received a request to reset your password. Choose a new password here:\n\n${appLink({ reset: token })}\n\nThis link expires in 1 hour. If you did not ask for this, you can ignore this email; your password will not change.`,
  });
}
