/**
 * Load and render previous month date when the left button is clicked
 */
function clickLeftMonth () {
  let calendar = getCalendar();
  
  if (calendar.month == 0) {
    updateDate(calendar.prevYear);
  } else {
    updateDate(calendar.prevMonth);
  }

  loadDataFromDB();
};

/**
 * Load and render next month date when the right button is clicked 
 */
function clickRightMonth () {
  let calendar = getCalendar();
  
  if (calendar.month == 11) {
    updateDate(calendar.nextYear);
  } else {
    updateDate(calendar.nextMonth);
  }

  loadDataFromDB();
};

/**
 * Load and render selected day when the day is clicked
 */
function clickDay () {
  const $this = $(this);
  const day = $this.attr('data-day');
  const month = $this.attr('data-month');
  const year = $this.attr('data-year');
  const stringFullDate = getStringFullDateToUpdateDate(year, month, day);
  
  callModal($this);
  updateDate(stringFullDate);
  loadDataFromDB();
};

/**
 * Load and render today when the today button is clicked
 */
function clickToday () {
  updateDate(+new Date());
  loadDataFromDB();
};

/**
 * Submit input data when submit button is clicked 
 */
function clickSubmit () {
  const input = {
    title     : $('input[id=recipient-name]').val(),
    content   : $('textarea[id=message-text]').val(),
    startDate : $('input[data-target="#datetimepicker1"]').val(),
    endDate   : $('input[data-target="#datetimepicker3"]').val(),
    startTime : $('input[data-target="#datetimepicker2"]').val(),
    endTime   : $('input[data-target="#datetimepicker4"]').val(),
    repeat    : $('#inlineCheckbox1').prop('checked'),
    allday    : $('#inlineCheckbox2').prop('checked'),
  }
  submitSchedule(input);
};

/**
 * Call modal when daily calendar is clicked 
 */
function clickDailyCalendar () {
  const calendar = getCalendar();
  const DateData = {
    day: calendar.date,
    month: calendar.month+1,
    year: calendar.year,
  };

  $('#registerSchedule').modal('show');
  $('input[data-target="#datetimepicker1"]').val(getStringFullDateToSetInput(DateData));
};

/**
 * Reset modal when cancel button is clicked 
 */
function clickCancelButton () {
  resetModal();
};

/**
 * Call modal and set selected date data to modal
 */
function callModal ($this) {
  const dateData = $this.data();

  $('#registerSchedule').modal('show');
  $('.day-label').removeClass('selected');
  $('input[data-target="#datetimepicker1"]').val(getStringFullDateToSetInput(dateData));
  
  $this.find('.day-label').addClass(' selected');
};

/**
 * Set different way whether checkbox is checked
 */
function changeCheckBox () {
  let checked = $(this).prop('checked');

  if (checked) {
    blockTimeInputInModal();
  } else {
    releaseTimeInputInModal();
  }
};

/**
 * Block the time input in modal
 */
function blockTimeInputInModal () {
  $('input[data-target="#datetimepicker2"]').attr('disabled', true);
  $('input[data-target="#datetimepicker4"]').attr('disabled', true);
  $('input[data-target="#datetimepicker2"]').val('');
  $('input[data-target="#datetimepicker4"]').val('');
};

/**
 * Release the time input in modal
 */
function releaseTimeInputInModal () {
  $('input[data-target="#datetimepicker2"]').attr('disabled', false);
  $('input[data-target="#datetimepicker4"]').attr('disabled', false);
};

/**
 * Set different way whether setting date in modal is right
 */
function focusOutDate () {
  const endDate   = $('input[data-target="#datetimepicker3"]').val();
  const startDate = $('input[data-target="#datetimepicker1"]').val();
  const dateInfo  = getDateInfo(endDate, startDate);
  const days      = dateInfo.endDate - dateInfo.startDate;

  if (days < 0) {
    rejectInput();
  } else {
    allowInput(days);
  }
};

/**
 * Check whether time input is right when it is focused out
 */
function focusOutTime () {
  const endTime   = $('input[data-target="#datetimepicker4"]').val();
  const startTime = $('input[data-target="#datetimepicker2"]').val();
  
  if ((endTime != '' && startTime != '') && calculateTimeGap(endTime, startTime) <= 0) {
    alert('시간 설정이 올바르지 않습니다.');
    $('input[data-target="#datetimepicker4"]').val('');
  }
};

/**
 * Check input month and render calendar with selected date
 */
function focusOutMonthInput () {
  const inputMonth = $(this).val();
  const calendar = getCalendar();

  if (checkWithinRangeOfMonth(inputMonth)) {
    const stringFulldate = getStringFullDateToUpdateDate(calendar.year, inputMonth, 1);
    
    updateDate(stringFulldate);
    loadDataFromDB();
  }

  $('.month-input').val('');
};

/**
 * Reset date input in modal when the date input is rejected
 */
function rejectInput () {
  alert('일정 설정이 올바르지 않습니다.');
  $('input[data-target="#datetimepicker3"]').val('');
  $('#inlineCheckbox2').prop('disabled', false);
};

/**
 * Set time input in modal blocked when the date input is allowed
 * @param {number} daysGap 
 */
function allowInput (daysGap) {
  if(daysGap > 0) {
    $('#inlineCheckbox2').prop('disabled', true);
    $('#inlineCheckbox2').prop('checked', true);
    $('input[data-target="#datetimepicker2"]').attr('disabled', true);
    $('input[data-target="#datetimepicker4"]').attr('disabled', true);
    $('input[data-target="#datetimepicker2"]').val('');
    $('input[data-target="#datetimepicker4"]').val('');
  } else {
    $('#inlineCheckbox2').prop('disabled', false);
  }
};

/**
 * Get time info object made of endTime and startTime
 * @param {string} endTime 
 * @param {string} startTime 
 */
function getTimeInfoOtherWay (endTime, startTime) {
  const endTimeInfo   = endTime.split(' ');
  const startTimeInfo = startTime.split(' ');
  const endHour   = changeTwelveToTwentyFour(endTimeInfo[1], Number(endTimeInfo[0].split(':')[0]));
  const startHour = changeTwelveToTwentyFour(startTimeInfo[1], Number(startTimeInfo[0].split(':')[0]));
  const endMinute = Number(endTimeInfo[0].split(':')[1]);
  const startMinute = Number(startTimeInfo[0].split(':')[1]);
  
  return timeInfo = {
    endHour,
    endMinute,
    startHour,
    startMinute,
    endTime: endTime === '' ? '' : changeFourDigits(endHour, endMinute),
    startTime: startTime === '' ? '' : changeFourDigits(startHour, startMinute),
  };
};

function changeTwentyFourToTwelve (endTime, startTime) {
  const endHour = Number(endTime.substring(0, 2));
  const endMinute = Number(endTime.substring(2, 4));
  const startHour = Number(startTime.substring(0, 2));
  const startMinute = Number(startTime.substring(2, 4));
  let endMeridiem = endHour <= 11 ? 'AM' : 'PM';
  let startMeridiem = startHour <= 11 ? 'AM' : 'PM';
  
  return {
    endMeridiem,
    startMeridiem,
    endTime: getTwelveTimeNotation(endMeridiem, endHour, endMinute),
    startTime: getTwelveTimeNotation(startMeridiem, startHour, startMinute),
  }
}

function getTwelveTimeNotation (meridiem, hour, minute) {
  if (meridiem == 'AM') {
    if (hour == 0) {
      hour += 12;
    }
  } else {
    if (hour != 12) {
      hour -= 12;
    }
  }
  hour = hour < 10 ? '0'+hour : hour.toString();
  minute = minute < 10 ? '0'+minute : minute.toString();
  return hour + ':' + minute;
}

function changeTwelveToTwentyFour (meridiem, hour) {
  if (meridiem == 'PM') {
    if (hour != 12) {
      hour += 12;
    }
  } else if (meridiem == 'AM') {
    if (hour == 12) {
      hour -= 12;
    }
  }
  return hour;
}

function changeFourDigits (hour, minute) {
  hour   = hour < 10 ? '0' + hour.toString() : hour.toString();
  minute = minute < 10 ? '0' + minute.toString() : minute.toString();
  
  return hour + minute;
}

/**
 * Calculate time gap by using timeInfo
 * @param {*} endTime 
 * @param {*} startTime 
 */
function calculateTimeGap (endTime, startTime) {
  const timeInfo     = getTimeInfoOtherWay(endTime, startTime);
  const endTimeSum   = timeInfo.endHour*60 + timeInfo.endMinute;
  const startTimeSum = timeInfo.startHour*60 + timeInfo.startMinute;
  console.log(timeInfo);
  console.log(endTimeSum-startTimeSum);
  return endTimeSum - startTimeSum;
}

/**
 * Reset all of input data in modal
 */
function resetModal () {
  $('input[id=recipient-name]').val('');
  $('textarea[id=message-text]').val('');
  $('input[data-target="#datetimepicker1"]').val('');
  $('input[data-target="#datetimepicker2"]').val('');
  $('input[data-target="#datetimepicker3"]').val('');
  $('input[data-target="#datetimepicker4"]').val('');
  $('#inlineCheckbox2').prop('disabled', false);
  $('#registerSchedule').modal('hide');
};

/**
 * Set stopPropagation
 * @param {object} event 
 */
function stopPropagation (event) {
  event.stopPropagation();
};