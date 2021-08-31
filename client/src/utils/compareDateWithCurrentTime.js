export const compareDateWithCurrentTime = (date) => {
  let currentTime = new Date();
  let selectedTime = new Date(date);

  // compare only date, not time.
  currentTime.setHours(0, 0, 0, 0);
  selectedTime.setHours(0, 0, 0, 0);

  if (currentTime < selectedTime) {
    // if the currentTime is less than the selectedTime return -1
    return -1;
  } else if (currentTime > selectedTime) {
    // if the currentTime is greater than selected time we're returning 1
    return 1;
  } else {
    // if the two values are equal return 0
    return 0;
  }
};
