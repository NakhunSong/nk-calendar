/**
 * Update date of global variable
 * @param {*} fullDate
 */
function updateDate (fullDate) {
  global.selectedDate = new Date(fullDate);
};

/**
 * Get count of days to render
 * @param {number} countOfDays
 */
function getCountOfDaysToRender (countOfDays) {
  return (Math.floor(countOfDays/7) + 1)*7 - countOfDays;
}

/**
 * Get date info object
 * @param {string} endDate - endDate: year/month/date
 * @param {string} startDate
 */
function getDateInfo (endDate, startDate) {
  const endDateInfo   = endDate.split("/");
  const startDateInfo = startDate.split("/");
  endDate   = endDateInfo[2] + endDateInfo[0] + endDateInfo[1];
  startDate = startDateInfo[2] + startDateInfo[0] + startDateInfo[1];
  
  return {
    endDate,
    startDate,
    startYear : startDateInfo[2],
    startMonth: startDateInfo[0],
    startDay  : startDateInfo[1],
  };
};

/**
 * Get count days of selected month
 * @param {string} stringDate 
 */
function getTotalDaysOfMonth (stringDate) {
  let date = getMonthAndYear(stringDate);
  return new Date(date.year, date.month+1, 0).getDate();
};

/**
 * Get starting day of selected month
 * @param {string} stringDate 
 */
function getStartingDayOfMonth (stringDate) {
  let date = getMonthAndYear(stringDate);
  return new Date(date.year, date.month, 1).getDay();
};

/**
 * Get month and year by string date
 * @param {string} stringDate 
 */
function getMonthAndYear (stringDate) {
  let date = new Date(stringDate);
  return {
      year: date.getFullYear(),
      month: date.getMonth()
  };
};

/**
 * Get ranged array by count
 * @param {number} count 
 */
function getRangedArray (count) {
  return new Array(count).fill().map((e, i) => i);
};

/**
 * Get string date by string params
 * formatted by 'yearmonthdate'
 * @param {number} year 
 * @param {number} month 
 * @param {number} date 
 */
function getStringFullDate (year, month, date) {
  return year + (month < 10 ? '0'+ month : month.toString()) + (date < 10 ? '0' + date : date.toString());
}

/**
 * Get string date to update date by dateInfo object
 * formatted by 'month/day/year'
 * @param {string|number} year
 * @param {string|number} month
 * @param {string|number} day
 */
function getStringFullDateToUpdateDate (year, month, day) {
  return `${year}/${month}/${day}`;
}

/**
 * Get string date to set value of datepicker input
 * formatted by 'month/day/year'
 * @param {object} inputData 
 */
function getStringFullDateToSetInput (inputData) {
  return `${inputData.month < 10 ? '0'+(inputData.month).toString() : inputData.month}/${inputData.day < 10 ? '0'+(inputData.day).toString() : inputData.day}/${inputData.year}`;
}

/**
 * check whether a date between start and end date
 * @param {object} scheduleData 
 * @param {string} stringFullDate 
 */
function checkWithinRange (scheduleData, stringFullDate) {
  return (scheduleData.startDate <= stringFullDate
    && stringFullDate <= scheduleData.endDate);
}

/**
 * Check whether selected date is today
 * @param {object} compareDateInfo 
 */
function checkIsToday (compareDateInfo) {
  return (compareDateInfo.today.getDate() === compareDateInfo.date
    && compareDateInfo.today.getMonth()+1 === compareDateInfo.month
    && compareDateInfo.today.getFullYear() === compareDateInfo.year);
};

/**
 * Check whether schedule data and day data are matched each other
 * @param {object} scheduleData 
 * @param {object} dayData 
 */
function checkMatchScheduleAndDay (scheduleData, dayData) {
  return (scheduleData.startMonth === dayData.month
    && scheduleData.start === dayData.date
    && scheduleData.startDate <= dayData.yearmonthdate
    && scheduleData.endDate >= dayData.yearmonthdate);
};

/**
 * Check whether input month is between 1 and 12
 * @param {string|number} month 
 */
function checkWithinRangeOfMonth (month) {
  return 1 <= month && month <= 12;
}

/**
 * Check modal input data
 * @param {object} input 
 * @param {number} countOfdays 
 */
function checkInput (input, countOfdays) {
  if (input.title === '') {
    alert('일정명을 입력해주세요.');
    return false;
  }

  if (countOfdays == 0 && !input.allday) {
    if(input.startTime === '' || input.endTime === '') {
      alert('시간을 입력해주세요.');
      return false;
    }
  }

  if (input.startDate === '' || input.endDate === '') {
    alert('일정을 입력해주세요.');
    return false;
  }

  return true;
};