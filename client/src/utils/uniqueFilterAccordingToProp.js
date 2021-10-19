export const uniqueFilterAccordingToProp = function (arr, prop) {
  return [...new Set(arr.map((item) => item._id))];
};
