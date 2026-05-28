import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { adminEmailTemplate } from '../templates/adminEmail.js';
import { userEmailTemplate } from '../templates/userEmail.js';

let transporter;

// Lazily create a single reusable SMTP transport (connection pooling).
export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
      pool: true,
      maxConnections: 5,
      // Cloud hosts (Railway) often have broken IPv6 egress to SMTP relays, which
      // hangs until timeout. Force IPv4 and fail fast instead of blocking the request.
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }
  return transporter;
};

export const verifyMailTransport = async () => {
  try {
    await getTransporter().verify();
    logger.info('Mail transport verified and ready.');
    return true;
  } catch (err) {
    logger.warn('Mail transport not ready:', err.message);
    return false;
  }
};

/**
 * Sends both the admin notification and the user acknowledgment.
 * The admin email (the actual lead) is treated as critical; if it fails the
 * request errors. A failed user acknowledgment is logged but not fatal.
 */
export const sendContactMails = async (data) => {
  const t = getTransporter();

  console.log('────────────────────────────────────────────');
  console.log('[MAIL] Sending contact emails…');
  console.log('[MAIL] SMTP host :', config.smtp.host, '| port:', config.smtp.port);
  console.log('[MAIL] SMTP user :', config.smtp.user || '(empty!)');
  console.log('[MAIL] From      :', config.mailFrom);
  console.log('[MAIL] → admin   :', config.adminEmail || '(ADMIN_EMAIL unset!)');
  console.log('[MAIL] → user    :', data.email);

  const adminPromise = t.sendMail({
    from: config.mailFrom,
    to: config.adminEmail,
    replyTo: `${data.name} <${data.email}>`,
    subject: `New enquiry — ${data.subject}`,
    html: adminEmailTemplate(data),
  });

  const userPromise = t.sendMail({
    from: config.mailFrom,
    to: data.email,
    subject: 'We received your enquiry — Divyan Technologies',
    html: userEmailTemplate(data),
  });

  const [adminResult, userResult] = await Promise.allSettled([adminPromise, userPromise]);

  // Admin notification (the lead) — log outcome.
  if (adminResult.status === 'fulfilled') {
    const info = adminResult.value;
    console.log('[MAIL] ✅ ADMIN email SENT  | messageId:', info.messageId, '| accepted:', info.accepted, '| rejected:', info.rejected);
  } else {
    console.log('[MAIL] ❌ ADMIN email FAILED:', adminResult.reason?.message);
    logger.error('Admin notification failed:', adminResult.reason?.message);
    const err = new Error('We could not deliver your enquiry right now. Please try again shortly.');
    err.statusCode = 502;
    throw err;
  }

  // User acknowledgment — non-fatal.
  if (userResult.status === 'fulfilled') {
    const info = userResult.value;
    console.log('[MAIL] ✅ USER  email SENT  | messageId:', info.messageId, '| accepted:', info.accepted, '| rejected:', info.rejected);
  } else {
    console.log('[MAIL] ⚠️  USER  email FAILED:', userResult.reason?.message);
    logger.warn('User acknowledgment failed:', userResult.reason?.message);
  }

  console.log('────────────────────────────────────────────');

  return { adminDelivered: true, userAckDelivered: userResult.status === 'fulfilled' };
};
