const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const ELEMENT = {
  daily : document.getElementsByClassName('daily-calendar')[0],
  month : document.getElementsByClassName('monthly-calendar')[0],
  yearAndMonth : document.getElementsByClassName('year-month')[0],
};

/**
 * Global variable
 */
let global = {
  selectedDate: new Date(),
  scheduleDataList: [],
}

/**
 * Intialize events and data
 */
function init () {
  setEvent();
  loadDataFromDB();
};

/**
 * Load data from DB and render calendar data
 */
function loadDataFromDB () {
  let calendar = getCalendar();
  
  $.ajax({
    url  : `/schedules?date=${calendar.stringFullDate}`,
    type : 'get',
    success : function(data, status, error) {
      console.log('load DB: ', status);
      
      global.scheduleDataList = data;
      setAll();
    },
    error: function(xhr, status, error) {
      console.error('load DB: ', status, ' reason: ', error);
    }
  });
};

/**
 * Get and Set calendar data
 */
function getCalendar () {
  let date = new Date(global.selectedDate);
  // let date = new Date(selectedDate);

  return {
    date : date.getDate(),
    day  : date.getDay(),
    month: date.getMonth(),
    year : date.getFullYear(),
    totalDays: getTotalDaysOfMonth(date),
    startDay : getStartingDayOfMonth(date),
    prevMonth: new Date(date.getFullYear(), date.getMonth()-1, 1),
    nextMonth: new Date(date.getFullYear(), date.getMonth()+1, 1),
    prevYear : new Date(date.getFullYear()-1, 11, 1),
    nextYear : new Date(date.getFullYear()+1, 0, 1),
    stringFullDate: getStringFullDate(date.getFullYear(), date.getMonth()+1, date.getDate()),
  };
};

/**
 * Set element and bind events with element
 */
function setAll () {
  let selectedMonthScheduleData = getScheduleToRenderMonthly();
  let selectedMonthScheduleElement = getElementToRenderMonthly(selectedMonthScheduleData);
  let selectedDayScheduleData   = getScheduleToRenderDaily(global.selectedDate);
  
  setElementOfYearAndMonth();
  setElementsOfMonthly(selectedMonthScheduleElement);
  setElementsOfDaily(selectedDayScheduleData);
  
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover().on('inserted.bs.popover')
};

/**
 * Get the rest of days from previous month that selected now
 * @param {object} calendar 
 */
function getRestOfDaysFromPrevMonth (calendar) {
  let restOfDaysFromPrevMonth = getRangedArray(calendar.startDay).map((e, dayIndex) => {
    let year  = new Date(calendar.prevMonth).getFullYear();
    let month = new Date(calendar.prevMonth).getMonth()+1;
    let date  = getTotalDaysOfMonth(calendar.prevMonth) - dayIndex;
    
    return {
      year,
      month,
      date,
      yearmonthdate: getStringFullDate(year, month, date),
      currentMonth: false,
    }
  }).reverse();

  return restOfDaysFromPrevMonth;
};

/**
 * Get days from month that selected now
 * @param {object} calendar 
 */
function getDaysFromSelectedMonth (calendar) {
  let daysFromSelectedMonth = getRangedArray(calendar.totalDays).map((e, dayIndex) => {
    let today = new Date();
    let year  = calendar.year;
    let month = calendar.month+1;
    let date  = dayIndex+1;
    
    return {
      year,
      month,
      date,
      yearmonthdate: getStringFullDate(year, month, date),
      currentMonth: true,
      today: checkIsToday({ today, date: dayIndex+1, month, year }),
      selected: calendar.date === dayIndex+1,
    }
  });

  return daysFromSelectedMonth;
}

/**
 * Get the rest of days from next month that selected now
 * @param {object} calendar 
 * @param {number} countOfDays 
 */
function getRestOfDaysFromNextMonth (calendar, countOfDays) {
  let restOfDaysFromNextMonth = getRangedArray(countOfDays).map((e, dayIndex) => {
    let year  = new Date(calendar.nextMonth).getFullYear();
    let month = new Date(calendar.nextMonth).getMonth()+1;
    let date  = dayIndex+1
    
    return {
      year,
      month,
      date,
      yearmonthdate: getStringFullDate(year, month, date),
      currentMonth: false,
    }
  });

  return restOfDaysFromNextMonth;
}

/**
 * Get whole days by combining days
 */
function getDaysToRender () {
  let calendar = getCalendar();
  let restOfDaysFromPrevMonth = getRestOfDaysFromPrevMonth(calendar);
  let daysFromSelectedMonth   = getDaysFromSelectedMonth(calendar);
  let daysList = restOfDaysFromPrevMonth.concat(daysFromSelectedMonth);
  let nextMonthDays = 0;

  if (daysList.length%7 != 0) {
    nextMonthDays = getCountOfDaysToRender(daysList.length);
  }

  return daysList.concat(getRestOfDaysFromNextMonth(calendar, nextMonthDays));
};

/**
 * Get schedule data to render on daily
 */
function getScheduleToRenderDaily () {
  const day   = new Date(global.selectedDate);
  const year  = day.getFullYear();
  const month = day.getMonth()+1;
  const date  = day.getDate();
  const stringFullDate = getStringFullDate(year, month, date);
  
  let result = [];
  
  global.scheduleDataList.forEach(scheduleData => {
    if (checkWithinRange(scheduleData, stringFullDate)) {
      result.push(scheduleData);
    }
  });

  return result;
};

/**
 * Get schedule data to render on monthly
 */
function getScheduleToRenderMonthly () {
  let renderingDays = getDaysToRender();
  let newScheduleDataList = [];
  
  global.scheduleDataList.forEach(scheduleData => {
    let array = getNewScheduleData(renderingDays, scheduleData);
    newScheduleDataList = newScheduleDataList.concat(array);
  });

  return newScheduleDataList;
};

/**
 * Get new schedule data having span
 * @param {array} renderingDays 
 * @param {object} scheduleData 
 */
function getNewScheduleData (renderingDays, scheduleData) {
  let startScheduleOfEachWeek = -1;
  let startMonth = -1;
  let span = 0;
  let newScheduleData = {};
  let newScheduleDataList = [];

  renderingDays.forEach((day, dayIndex) => {
    if (checkWithinRange(scheduleData, day.yearmonthdate)) {
      if (startScheduleOfEachWeek == -1) {
        startScheduleOfEachWeek = day.date;
        startMonth = day.month;
      }
      span += 1;
    }
    
    if ((dayIndex+1)%7 == 0 && startScheduleOfEachWeek != -1) {
      newScheduleData = {
        ...scheduleData,
        start: startScheduleOfEachWeek,
        startMonth,
        span,
      };
      newScheduleDataList.push(newScheduleData);
      startScheduleOfEachWeek = -1;
      span  = 0;
    }
  });

  return newScheduleDataList;
};

/**
 * Get all elements to render on monthly
 * @param {array} selectedMonthScheduleData 
 */
function getElementToRenderMonthly (selectedMonthScheduleData) {
  let renderingDays = getDaysToRender();

  let daysElements = renderingDays.map(dayData => {
    let result = dayTemplate(dayData);

    selectedMonthScheduleData.forEach(scheduleData => {
      if (checkMatchScheduleAndDay(scheduleData, dayData)) {
        result += scheduleTemplate(scheduleData, "monthly");
      }
    });
    return result+'</div>';
  });
  
  return daysElements;
};

/**
 * Render element of year-month
 */
function setElementOfYearAndMonth () {
  let calendar = getCalendar();
  ELEMENT.yearAndMonth.innerHTML = `${calendar.year}년 ${calendar.month+1}월`;
};

/**
 * Render element of monthly
 * @param {array} elementOfDays 
 */
function setElementsOfMonthly (elementOfDays) {
  let elementOfWeekDaysTitle = getElementOfWeekDaysTitle();
  let elementOfWeekDiv = '<div class="week">';

  elementOfDays.forEach((dayElement, elementIndex) => {
    if(elementIndex / 7 != 0 && elementIndex % 7 == 0) {
      elementOfWeekDiv += '</div><div class="week">';
    }

    elementOfWeekDiv += dayElement;
  });
  elementOfWeekDiv += `</div>`;

  ELEMENT.month.innerHTML = elementOfWeekDaysTitle + elementOfWeekDiv;
};

/**
 * Render element of daily
 * @param {array} selectedDayScheduleDatas 
 */
function setElementsOfDaily (selectedDayScheduleDatas) {
  let calendar = getCalendar();
  let dateAndDayElement = getElementOfDateAndDay(calendar);
  let elementsOfSchedule = "";

  selectedDayScheduleDatas.forEach(scheduleData => {
    elementsOfSchedule += scheduleTemplate(scheduleData, "daily");
  });

  ELEMENT.daily.innerHTML = dateAndDayElement+elementsOfSchedule;
};


/**
 * Submit input data
 * @param {object} input 
 */
const submitSchedule = (input) => {
  const dateInfo    = getDateInfo(input.endDate, input.startDate);
  const timeInfo    = getTimeInfoOtherWay(input.endTime, input.startTime);
  console.log(timeInfo);
  const countOfdays = dateInfo.endDate - dateInfo.startDate;

  if (!checkInput(input, countOfdays)) {
    return;
  }

  let stringFullDate = getStringFullDateToUpdateDate(dateInfo.startYear, dateInfo.startMonth, dateInfo.startDay);

  let newInput = {
    ...input,
    startDate: dateInfo.startDate,
    endDate: dateInfo.endDate,
    startTime: timeInfo.startTime,
    endTime: timeInfo.endTime,
  };
  
  updateDate(stringFullDate);
  insertDataToDB(newInput);
  resetModal();
};

/**
 * Insert data to DB
 * @param {object} input 
 */
function insertDataToDB (input) {
  $.ajax({
    url: `/schedule/register?date=${getCalendar().stringFullDate}`,
    type: 'post',
    data: input,
    success: function(data, status, error) {
      console.log('post action: ', status);
      
      global.scheduleDataList = data;
      setAll();
    },
    error: function(xhr, status, error) {
      console.error('post action: ', status, ' reason: ', error);
    }
  });
}

/**
 * Set and bind events with calendar and modal
 */
function setEvent () {
  /* ***************************** Calendar ***************************** */
  $(document).on('click', '.ico-arrow-prev', clickLeftMonth);
  $(document).on('click', '.ico-arrow-next', clickRightMonth);
  $(document).on('click', '.day-label', clickDay);
  $(document).on('click', '.today', clickToday);
  $(document).on('click', '.submit', clickSubmit);
  $(document).on('click', '.event-consecutive, .event, .event-repeated', stopPropagation);
  $(document).on('click', '.daily-calendar', clickDailyCalendar);
  $(document).on('focusout', '.month-input', focusOutMonthInput);
  $('#view li:first-child a').tab('show');
  
  /* ******************************* Modal ******************************* */
  $('#datetimepicker1').datetimepicker({ format: 'L' });
  $('#datetimepicker3').datetimepicker({ format: 'L' });
  $('#datetimepicker2').datetimepicker({ format: 'LT' });
  $('#datetimepicker4').datetimepicker({ format: 'LT' });
  $('button[class~="btn-secondary"]').click(clickCancelButton);
  $('#inlineCheckbox2').change(changeCheckBox);
  $('input[data-target="#datetimepicker1"], input[data-target="#datetimepicker3"]').focusout(focusOutDate);
  $('input[data-target="#datetimepicker2"], input[data-target="#datetimepicker4"]').focusout(focusOutTime);
};

$(function () {
  init();
});