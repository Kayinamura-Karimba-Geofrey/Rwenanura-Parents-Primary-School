/**
 * iCalendar export helpers for the Academic Calendar.
 * Calendar data itself is fetched from GET /api/calendar after sign-in.
 */

/**
 * Generate an RFC 5545 compliant .ics (iCalendar) file string
 * Compatible with Google Calendar, Apple Calendar, Microsoft Outlook, and Android
 */
export function generateICalString(events, lang = 'en') {
  const formatIcalDate = (isoStr) => {
    return isoStr.replace(/[-:]/g, '').replace('.000', '') + 'Z';
  };

  const escapeIcal = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const nowStr = formatIcalDate(new Date().toISOString());

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rwenanura Parents Primary School//Academic Calendar 2026-2027//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:RPPS Academic Calendar 2026/2027',
    'X-WR-TIMEZONE:Africa/Kigali',
    'X-WR-CALDESC:Official Term Dates and Academic Milestones for Rwenanura Parents Primary School'
  ];

  events.forEach(ev => {
    const title = ev.title[lang] || ev.title.en;
    const desc = ev.description[lang] || ev.description.en;
    const start = formatIcalDate(new Date(ev.startDate).toISOString());
    const end = formatIcalDate(new Date(ev.endDate).toISOString());

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${ev.id}-2026-rpps@rwenanuraparents.sch.rw`);
    ics.push(`DTSTAMP:${nowStr}`);
    ics.push(`DTSTART:${start}`);
    ics.push(`DTEND:${end}`);
    ics.push(`SUMMARY:${escapeIcal(title)}`);
    ics.push(`DESCRIPTION:${escapeIcal(desc)}`);
    ics.push(`LOCATION:${escapeIcal(ev.location)}`);
    ics.push(`CATEGORIES:${escapeIcal(ev.category.toUpperCase())}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Trigger immediate client-side download of the .ics file
 */
export function downloadICalFile(events, filename = 'RPPS-Academic-Calendar-2026-2027.ics', lang = 'en') {
  const icalData = generateICalString(events, lang);
  const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
