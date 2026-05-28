import { escapeHtml } from '../utils/escapeHtml.js';

export const adminEmailTemplate = (data) => {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = escapeHtml(data.phone);
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message).replace(/\n/g, '<br>');
  const when = new Date(data.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #ECECF0;color:#6E6E88;font-size:12px;text-transform:uppercase;letter-spacing:.06em;width:140px;vertical-align:top;">${label}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #ECECF0;color:#16161C;font-size:14px;">${value}</td>
    </tr>`;

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#F4F4F7;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#0A0A12;border-radius:16px 16px 0 0;padding:24px 28px;">
      <div style="color:#FFFFFF;font-size:18px;font-weight:800;letter-spacing:-.02em;">Divyan<span style="color:#6E8BFF;">.</span>tech</div>
      <div style="color:#9A9AB0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin-top:4px;">New enquiry received</div>
    </div>
    <div style="background:#FFFFFF;border-radius:0 0 16px 16px;padding:8px 12px 20px;border:1px solid #ECECF0;border-top:none;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Name', name)}
        ${row('Email', `<a href="mailto:${email}" style="color:#3D4ED0;text-decoration:none;">${email}</a>`)}
        ${row('Phone', phone)}
        ${row('Subject', subject)}
        ${row('Received', when + ' IST')}
      </table>
      <div style="padding:16px;">
        <div style="color:#6E6E88;font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Message</div>
        <div style="background:#F7F7FB;border:1px solid #ECECF0;border-radius:10px;padding:14px 16px;color:#16161C;font-size:14px;line-height:1.6;">${message}</div>
      </div>
      <div style="padding:0 16px;">
        <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(subject)}"
           style="display:inline-block;background:#3D4ED0;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:999px;">
          Reply to ${name}
        </a>
      </div>
    </div>
    <div style="text-align:center;color:#9A9AB0;font-size:11px;margin-top:16px;">
      Automated notification from the Divyan Technologies website.
    </div>
  </div>
</body></html>`;
};
