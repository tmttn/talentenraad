/**
 * Calendar utility for generating iCalendar (.ics) files
 */

type CalendarEventOptions = {
  title: string;
  date: string; // ISO date string
  time?: string; // E.g., "14:00 - 17:00" or "14:00"
  location?: string;
  description?: string;
  url?: string;
  id: string;
};

/**
 * Formats a date to iCalendar format (YYYYMMDDTHHMMSS)
 */
function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Formats a date to iCalendar all-day format (YYYYMMDD)
 */
function formatICalAllDayDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * Parses a time string like "14:00" or "14:00 - 17:00"
 * Returns start and end times, or undefined if parsing fails
 */
function parseTimeRange(timeString: string): {startHour: number; startMinute: number; endHour: number; endMinute: number} | undefined {
  // Try to match "HH:MM - HH:MM" format
  const rangeMatch = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/.exec(timeString);
  if (rangeMatch) {
    return {
      startHour: Number.parseInt(rangeMatch[1], 10),
      startMinute: Number.parseInt(rangeMatch[2], 10),
      endHour: Number.parseInt(rangeMatch[3], 10),
      endMinute: Number.parseInt(rangeMatch[4], 10),
    };
  }

  // Try to match single time "HH:MM" format - assume 2 hour duration
  const singleMatch = /(\d{1,2}):(\d{2})/.exec(timeString);
  if (singleMatch) {
    const startHour = Number.parseInt(singleMatch[1], 10);
    const startMinute = Number.parseInt(singleMatch[2], 10);
    return {
      startHour,
      startMinute,
      endHour: (startHour + 2) % 24, // Default 2 hour duration
      endMinute: startMinute,
    };
  }

  return undefined;
}

/**
 * Escapes text for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll(';', String.raw`\;`)
    .replaceAll(',', String.raw`\,`)
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', '');
}

/**
 * Strips HTML tags from text
 */
function stripHtml(html: string): string {
  return html
    .replaceAll(/<br\s*\/?>/gi, '\n')
    .replaceAll(/<\/p>/gi, '\n\n')
    .replaceAll(/<[^>]+>/g, '')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generates an iCalendar (.ics) file content
 */
export function generateICalEvent(options: CalendarEventOptions): string {
  const {title, date, time, location, description, url, id} = options;
  const eventDate = new Date(date);
  const now = new Date();

  // Parse time if provided
  const timeRange = time ? parseTimeRange(time) : undefined;

  let dtStart: string;
  let dtEnd: string;

  if (timeRange) {
    // Event with specific times
    const startDate = new Date(eventDate);
    startDate.setHours(timeRange.startHour, timeRange.startMinute, 0, 0);

    const endDate = new Date(eventDate);
    endDate.setHours(timeRange.endHour, timeRange.endMinute, 0, 0);

    // Handle end time on next day if it's before start time
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    dtStart = `DTSTART:${formatICalDate(startDate)}`;
    dtEnd = `DTEND:${formatICalDate(endDate)}`;
  } else {
    // All-day event
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);

    dtStart = `DTSTART;VALUE=DATE:${formatICalAllDayDate(eventDate)}`;
    dtEnd = `DTEND;VALUE=DATE:${formatICalAllDayDate(nextDay)}`;
  }

  // Build description
  let fullDescription = '';
  if (description) {
    fullDescription = stripHtml(description);
  }

  if (time && !timeRange) {
    // Include original time string if we couldn't parse it
    fullDescription = `Tijd: ${time}\n\n${fullDescription}`.trim();
  }

  if (url) {
    fullDescription = `${fullDescription}\n\nMeer info: ${url}`.trim();
  }

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Talentenraad//Activiteiten//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@talentenraad.be`,
    `DTSTAMP:${formatICalDate(now)}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeICalText(title)}`,
  ];

  if (fullDescription) {
    lines.push(`DESCRIPTION:${escapeICalText(fullDescription)}`);
  }

  if (location) {
    lines.push(`LOCATION:${escapeICalText(location)}`);
  }

  if (url) {
    lines.push(`URL:${url}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Triggers a download of an iCalendar file
 */
export function downloadICalEvent(options: CalendarEventOptions): void {
  const content = generateICalEvent(options);
  const blob = new Blob([content], {type: 'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${options.title.replaceAll(/[^\w\s-]/g, '').replaceAll(/\s+/g, '-').toLowerCase()}.ics`;
  document.body.append(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
