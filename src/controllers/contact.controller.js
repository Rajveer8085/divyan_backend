import { asyncHandler } from '../utils/asyncHandler.js';
import { sendContactMails } from '../services/mail.service.js';
import * as contactRepo from '../services/contact.service.js';
import { logger } from '../utils/logger.js';

// Public: save the enquiry to the DB, then send notification emails (best-effort).
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const saved = await contactRepo.saveContact({ name, email, phone: phone || '', subject, message });
  console.log(`[CONTACT] Enquiry saved to DB (id: ${saved.id}) from ${email} — now attempting email…`);

  let userAckDelivered = false;
  try {
    const result = await sendContactMails({
      name,
      email,
      phone: phone || 'Not provided',
      subject,
      message,
      submittedAt: saved.createdAt,
    });
    userAckDelivered = result.userAckDelivered;
    console.log(`[CONTACT] Email flow done. userAckDelivered=${userAckDelivered}`);
  } catch (err) {
    // Lead is safely stored; email is a nice-to-have.
    console.log('[CONTACT] Email flow FAILED (lead still saved to DB):', err.message);
    logger.warn('Contact email not sent (enquiry saved to DB):', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Thank you — your enquiry has been received.',
    data: { id: saved.id, userAckDelivered },
  });
});

// Admin: list all enquiries.
export const listContacts = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await contactRepo.listContacts() });
});

// Admin: delete an enquiry.
export const deleteContact = asyncHandler(async (req, res) => {
  const removed = await contactRepo.removeContact(req.params.id);
  if (!removed) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, message: 'Message deleted' });
});

// Admin: mark an enquiry read/unread.
export const updateContact = asyncHandler(async (req, res) => {
  const updated = await contactRepo.markContactRead(req.params.id, req.body.read !== false);
  if (!updated) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: updated });
});
