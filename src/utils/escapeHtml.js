const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Escape user-supplied values before embedding them in HTML emails.
export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => MAP[c]);
