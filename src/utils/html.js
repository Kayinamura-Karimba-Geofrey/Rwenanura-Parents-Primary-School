/**
 * Escape text for safe insertion into HTML (element content or quoted
 * attribute values). Use for every piece of user- or server-supplied data
 * interpolated into an innerHTML template.
 */
export function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
