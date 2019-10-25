/**
 * Get element of day-name to set daily
 * @param {object} calendar 
 */
function getElementOfDateAndDay (calendar) {
  return `<span class="day-name">${calendar.date}일 ${WEEK_DAYS[calendar.day]}요일</span>`;
};

/**
 * Get element of week-day made by WEEK_DAYS to set monthly
 */
function getElementOfWeekDaysTitle () {
  let elementOfWeekDays = '<div class="week-day">';
  
  WEEK_DAYS.forEach(dayName => {
    elementOfWeekDays += `<div class="day-name">${dayName}</div>`
  });

  return elementOfWeekDays += '</div>';
};

/**
 * Return data combined day info with template
 * @param {object} dayInfo 
 */
function dayTemplate (dayInfo) {
  return `
    <div class="day">
      <h3 class="day-label${dayInfo.selected ? ' selected' : ''}"
        data-day="${dayInfo.date}"
        data-month="${dayInfo.month}"
        data-year="${dayInfo.year}"
      >
          ${dayInfo.date}
      </h3>`;
};

/**
 * Return data combined schedule data with template
 * @param {object} scheduleData 
 * @param {string} view 
 */
function scheduleTemplate (scheduleData, view) {
  return `
    <div class="event${scheduleData.allday ? '-consecutive' : ''} event-start event-end"
      ${view === "daily" ? 'data-placement="left"' : `data-span=${scheduleData.span}`}
      data-toggle="popover"
      data-html="true"
      data-content='${innerContentTemplate(scheduleData)}'
    >
      ${scheduleData.title}
    </div>`;
}

/**
 * Return inner content combined schedule data with template
 * @param {object} scheduleData 
 */
function innerContentTemplate (scheduleData) {
  return `
    <div class="content-line">
      ${upperContentTemplate(scheduleData)}
    </div>
    <div class="content-line">
      ${lowerContentTemplate(scheduleData)}
    </div>`;
};

/**
 * Return upper line of inner content with template
 * @param {object} scheduleData 
 */
function upperContentTemplate (scheduleData) {
  return `
    <div class="event-${scheduleData.allday ? 'consecutive-' : ''}marking">
    </div>
    <div class="title">
      <h5>
        ${scheduleData.title}
      </h5>
      <h7 class="reservation">
        ${scheduleData.startDate} – ${scheduleData.endDate}
      <span class="reservation-time">
        ⋅${scheduleData.startTime !== '' ? getTransformedTimeToRender(scheduleData) : ''}
      </span>
    </div>`;
};

/**
 * Return lower line of inner content with template
 * @param {object} scheduleData 
 */
function lowerContentTemplate (scheduleData) {
  return `
    <i class="material-icons">notes</i>
    <div class="title">
      <h7 class="reservation">
        ${scheduleData.content}
    </div>`;
};

/**
 * Transform time set to render 
 * @param {object} scheduleData 
 */
function getTransformedTimeToRender (scheduleData) {
  const timeInfo = changeTwentyFourToTwelve(scheduleData.endTime, scheduleData.startTime);
  const startMeridiem = timeInfo.startMeridiem == 'AM' ? '오전' : '오후';
  const endMeridiem = timeInfo.endMeridiem == 'AM' ? '오전' : '오후';

  return `${startMeridiem} ${timeInfo.startTime} ~ ${endMeridiem === startMeridiem ? '' : endMeridiem} ${timeInfo.endTime}`;
};