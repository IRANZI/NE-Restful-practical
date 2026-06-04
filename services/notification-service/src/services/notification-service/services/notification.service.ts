import nodemailer from 'nodemailer';
import { env } from '../../../config/env';
import { query } from '../db/client';

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}
// Record a notification in the database with its status (sent, logged, or failed) for auditing and tracking purposes
async function recordNotification(
  message: EmailMessage,
  status: 'sent' | 'logged' | 'failed'
) {
  await query(
    `INSERT INTO notifications (recipient_email, subject, body, status, sent_at)
     VALUES ($1, $2, $3, $4, CASE WHEN $4 = 'sent' THEN NOW() ELSE NULL END)`,
    [message.to, message.subject, message.text, status]
  );
}
// Send an email using nodemailer, falling back to logging if SMTP is not configured, and recording the notification status in the database
export async function sendEmail(message: EmailMessage) {
  if (!env.smtp.host) {
    console.info(`[email:${message.to}] ${message.subject}\n${message.text}`);
    await recordNotification(message, 'logged');
    return { status: 'logged' as const };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user
        ? {
            user: env.smtp.user,
            pass: env.smtp.pass
          }
        : undefined
    });

    await transporter.sendMail({
      from: env.smtp.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html
    });

    await recordNotification(message, 'sent');
    return { status: 'sent' as const };
  } catch (error) {
    console.error('Failed to send email', error);
    await recordNotification(message, 'failed');
    return { status: 'failed' as const };
  }
}

export async function listNotifications() {
  const result = await query(
    `SELECT id,
            recipient_email AS "recipientEmail",
            subject,
            body,
            status,
            sent_at AS "sentAt",
            created_at AS "createdAt"
       FROM notifications
      ORDER BY created_at DESC`
  );

  return result.rows;
}
