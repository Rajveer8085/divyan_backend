import { escapeHtml } from '../utils/escapeHtml.js';

export const userEmailTemplate = (data) => {
  const name = escapeHtml(data.name);
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message).replace(/\n/g, '<br>');

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4F4F7;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(120deg,#3D4ED0,#6E8BFF);border-radius:16px 16px 0 0;padding:30px 28px;">
      <div style="color:#FFFFFF;font-size:20px;font-weight:800;letter-spacing:-.02em;">Divyan<span style="opacity:.8;">.</span>tech</div>
      <div style="color:#E7EAFF;font-size:13px;margin-top:6px;">Building Tomorrow, Together.</div>
    </div>
    <div style="background:#FFFFFF;border-radius:0 0 16px 16px;padding:28px;border:1px solid #ECECF0;border-top:none;">
      <h1 style="margin:0 0 12px;color:#16161C;font-size:20px;font-weight:700;">Thank you, ${name} 👋</h1>
      <p style="margin:0 0 16px;color:#52525B;font-size:14px;line-height:1.7;">
        We've received your enquiry and a member of our team will get back to you within
        <strong style="color:#16161C;">one business day</strong>. Here's a copy of what you sent us:
      </p>

      <div style="background:#F7F7FB;border:1px solid #ECECF0;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
        <div style="color:#6E6E88;font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Subject</div>
        <div style="color:#16161C;font-size:15px;font-weight:600;margin:2px 0 12px;">${subject}</div>
        <div style="color:#6E6E88;font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Your message</div>
        <div style="color:#16161C;font-size:14px;line-height:1.6;margin-top:4px;">${message}</div>
      </div>

      <p style="margin:0 0 4px;color:#52525B;font-size:14px;line-height:1.7;">
        Need to reach us sooner? Call <a href="tel:+919956905174" style="color:#3D4ED0;text-decoration:none;">+91 99569 05174</a>
        or reply directly to this email.
      </p>

      <div style="border-top:1px solid #ECECF0;margin-top:24px;padding-top:18px;">
        <div style="color:#16161C;font-size:14px;font-weight:700;">Divyan Technologies Pvt. Ltd.</div>
        <div style="color:#8E8E94;font-size:12px;line-height:1.6;margin-top:4px;">
          7th 704 BCC Tower, Sultanpur Road, Arjunganj,<br>Lucknow, Uttar Pradesh 226002, India
        </div>
      </div>
    </div>
    <div style="text-align:center;color:#9A9AB0;font-size:11px;margin-top:16px;">
      This is an automated confirmation — please keep it for your records.
    </div>
  </div>
</body></html>`;
};
