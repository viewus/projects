/**
 * Wedding Calendar Engine — Google / Outlook deep links + .ics download,
 * plus a <CalendarMenu> dropdown component used by the timeline and the
 * "Don't Miss a Moment" cards.
 */

function formatDateTimeForICS(dateStr, timeStr) {
  const cleanedDate = dateStr.replace(/-/g, '');
  const cleanedTime = (timeStr || '10:00').replace(/:/g, '') + '00';
  return `${cleanedDate}T${cleanedTime}`;
}

function formatDateTimeForGoogle(dateStr, timeStr) {
  const cleanedDate = dateStr.replace(/-/g, '');
  const cleanedTime = (timeStr || '10:00').replace(/:/g, '') + '00';
  return `${cleanedDate}T${cleanedTime}`;
}

function generateGoogleCalendarUrl(event) {
  const startDT = formatDateTimeForGoogle(event.date, event.startTime);
  const endDT = formatDateTimeForGoogle(event.date, event.endTime || event.startTime);
  const title = encodeURIComponent(event.calendar?.title || event.title);
  const details = encodeURIComponent(
    (event.calendar?.description || event.description || '') + '\n\nRSVP & Details: ' + window.location.href
  );
  const location = encodeURIComponent(event.calendar?.location || (event.venue + ', ' + event.address));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDT}/${endDT}&details=${details}&location=${location}`;
}

function generateOutlookCalendarUrl(event) {
  const startDT = `${event.date}T${event.startTime || '10:00'}:00`;
  const endDT = `${event.date}T${event.endTime || event.startTime || '12:00'}:00`;
  const title = encodeURIComponent(event.calendar?.title || event.title);
  const details = encodeURIComponent(event.calendar?.description || event.description || '');
  const location = encodeURIComponent(event.calendar?.location || (event.venue + ', ' + event.address));

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=${startDT}&enddt=${endDT}`;
}

function downloadICSFile(event) {
  const startDT = formatDateTimeForICS(event.date, event.startTime);
  const endDT = formatDateTimeForICS(event.date, event.endTime || event.startTime);
  const summary = event.calendar?.title || event.title;
  const description = (event.calendar?.description || event.description || '') + '\\n\\n' + window.location.href;
  const location = event.calendar?.location || (event.venue + ', ' + event.address);

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Royal Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:wedding-${event.id || Date.now()}@weddinginvitation.com`,
    `DTSTAMP:${formatDateTimeForICS(new Date().toISOString().split('T')[0], '00:00')}Z`,
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${(event.shortTitle || event.title).toLowerCase().replace(/\s+/g, '-')}-wedding-event.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Dropdown menu offering Google / Apple(.ics) / Outlook options for a single
 * ceremony event. Rendered inline next to its trigger button; positions
 * itself via CSS (`position:absolute; top:100%`) relative to a
 * `position:relative` wrapper, matching the original vanilla behaviour.
 */
function CalendarMenu({ event }) {
  const [open, setOpen] = React.useState(false);
  const menuRef = useClickOutside(open, () => setOpen(false));

  function handleSelect(action) {
    action();
    setOpen(false);
  }

  return (
    <div className="calendar-btn-holder" style={{ display: 'inline-block', position: 'relative' }} ref={menuRef}>
      <button
        className="btn-luxury timeline-cal-btn"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <i className="fa-solid fa-calendar-plus" style={{ marginRight: '6px' }}></i>
        <span>Add to Calendar</span>
      </button>

      {open && (
        <div
          className="calendar-popup-menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(8px)',
            background: 'var(--paper)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            boxShadow: 'var(--shadow-3)',
            zIndex: 200,
            minWidth: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <CalendarMenuItem
            onClick={() => handleSelect(() => window.open(generateGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer'))}
          >
            <i className="fa-brands fa-google" style={{ color: 'var(--gold-dim)', marginRight: '8px', width: '16px' }}></i>
            Google Calendar
          </CalendarMenuItem>
          <CalendarMenuItem onClick={() => handleSelect(() => downloadICSFile(event))}>
            <i className="fa-brands fa-apple" style={{ color: 'var(--gold-dim)', marginRight: '8px', width: '16px' }}></i>
            Apple / iCal (.ICS)
          </CalendarMenuItem>
          <CalendarMenuItem
            onClick={() => handleSelect(() => window.open(generateOutlookCalendarUrl(event), '_blank', 'noopener,noreferrer'))}
          >
            <i className="fa-brands fa-microsoft" style={{ color: 'var(--gold-dim)', marginRight: '8px', width: '16px' }}></i>
            Outlook Calendar
          </CalendarMenuItem>
        </div>
      )}
    </div>
  );
}

function CalendarMenuItem({ children, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        padding: '9px 14px',
        color: hover ? 'var(--ivory)' : 'var(--ink)',
        background: hover ? 'var(--ink)' : 'transparent',
        fontFamily: 'var(--font-body)',
        fontWeight: 400,
        fontSize: '0.85rem',
        textAlign: 'left',
        borderRadius: 'var(--radius-sm)',
        transition: 'all 0.2s',
        width: '100%',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {children}
    </button>
  );
}
