import { InvitationData } from '../types/invitation';

export function formatDateSpanish(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const formatted = d.toLocaleDateString('es-ES', options);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTimeSpanish(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function generateGoogleCalendarUrl(invitation: InvitationData): string {
  const start = new Date(invitation.targetDate);
  const end = new Date(start.getTime() + 7 * 60 * 60 * 1000); // 7 hours duration

  const formatDateForGCal = (date: Date) =>
    date.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const namesDisplay = invitation.graduates && invitation.graduates.length > 1
    ? invitation.graduates.join(' & ')
    : invitation.graduateName;

  const title = encodeURIComponent(`Gala de Graduación: ${invitation.prefix} ${namesDisplay}`);
  const details = encodeURIComponent(
    `Celebración de Grado - ${invitation.degree}\n` +
    `Institución: ${invitation.institution}\n` +
    `Código de Vestimenta: ${invitation.dressCode.title}\n` +
    `¡Te esperamos con gran entusiasmo para celebrar este gran logro!`
  );
  const location = encodeURIComponent(`${invitation.partyVenue.name}, ${invitation.partyVenue.address}, ${invitation.partyVenue.city}`);
  const dates = `${formatDateForGCal(start)}/${formatDateForGCal(end)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(invitation: InvitationData) {
  const start = new Date(invitation.targetDate);
  const end = new Date(start.getTime() + 7 * 60 * 60 * 1000);

  const formatIcsDate = (date: Date) =>
    date.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const namesDisplay = invitation.graduates && invitation.graduates.length > 1
    ? invitation.graduates.join(' & ')
    : invitation.graduateName;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Invitacion Gala de Graduacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:graduacion-${Date.now()}@invitacion.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:Gala de Graduación: ${invitation.prefix} ${namesDisplay}`,
    `DESCRIPTION:${invitation.degree} - ${invitation.institution}. ${invitation.dressCode.title}.`,
    `LOCATION:${invitation.partyVenue.name}, ${invitation.partyVenue.address}, ${invitation.partyVenue.city}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `graduacion-${invitation.graduateName.toLowerCase().replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
