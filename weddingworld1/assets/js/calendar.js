/**
 * Wedding Calendar Engine - Dynamic Google, Apple (.ics), and Outlook link generation
 */

(function () {
  'use strict';

  function formatDateTimeForICS(dateStr, timeStr) {
    // dateStr: "2027-02-14", timeStr: "18:30"
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
    const details = encodeURIComponent((event.calendar?.description || event.description || '') + '\n\nRSVP & Details: ' + window.location.href);
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
  }

  function openCalendarMenu(eventObj, triggerBtn) {
    // Remove any existing active calendar popup
    const existingPopup = document.querySelector('.calendar-popup-menu');
    if (existingPopup) existingPopup.remove();

    const menu = document.createElement('div');
    menu.className = 'calendar-popup-menu';
    menu.style.cssText = `
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      background: #2d060c;
      border: 1px solid #d4af37;
      border-radius: 14px;
      padding: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(212,175,55,0.3);
      z-index: 200;
      min-width: 200px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: countTick 0.3s ease-out;
    `;

    const googleBtn = createMenuItem('<i class="fa-brands fa-google" style="color:#ea4335; margin-right:8px; width:16px;"></i> Google Calendar', () => {
      window.open(generateGoogleCalendarUrl(eventObj), '_blank', 'noopener,noreferrer');
      menu.remove();
    });

    const appleBtn = createMenuItem('<i class="fa-brands fa-apple" style="color:#ffffff; margin-right:8px; width:16px;"></i> Apple / iCal (.ICS)', () => {
      downloadICSFile(eventObj);
      menu.remove();
    });

    const outlookBtn = createMenuItem('<i class="fa-brands fa-microsoft" style="color:#00a4ef; margin-right:8px; width:16px;"></i> Outlook Calendar', () => {
      window.open(generateOutlookCalendarUrl(eventObj), '_blank', 'noopener,noreferrer');
      menu.remove();
    });

    menu.appendChild(googleBtn);
    menu.appendChild(appleBtn);
    menu.appendChild(outlookBtn);

    // Position relative to parent button container
    triggerBtn.parentElement.style.position = 'relative';
    triggerBtn.parentElement.appendChild(menu);

    // Close when clicking outside
    function handleOutsideClick(e) {
      if (!menu.contains(e.target) && e.target !== triggerBtn) {
        menu.remove();
        document.removeEventListener('click', handleOutsideClick);
      }
    }
    setTimeout(() => document.addEventListener('click', handleOutsideClick), 10);
  }

  function createMenuItem(htmlLabel, onClick) {
    const btn = document.createElement('button');
    btn.innerHTML = htmlLabel;
    btn.style.cssText = `
      padding: 9px 14px;
      color: #faecc3;
      font-family: var(--font-serif-royal, 'Cinzel', serif);
      font-size: 0.82rem;
      text-align: left;
      border-radius: 8px;
      transition: all 0.2s;
      width: 100%;
      display: flex;
      align-items: center;
    `;
    btn.onmouseover = () => {
      btn.style.background = '#4a0e17';
      btn.style.color = '#ffffff';
    };
    btn.onmouseout = () => {
      btn.style.background = 'transparent';
      btn.style.color = '#faecc3';
    };
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };
    return btn;
  }

  window.WeddingCalendar = {
    generateGoogleCalendarUrl,
    generateOutlookCalendarUrl,
    downloadICSFile,
    openCalendarMenu
  };
})();
