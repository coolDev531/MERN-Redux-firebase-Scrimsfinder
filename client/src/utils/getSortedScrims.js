//  scrims sorting

// descending
export const showLatestFirst = (scrims) =>
  scrims.sort(
    (a, b) =>
      new Date(b.gameStartTime).getTime() - new Date(a.gameStartTime).getTime()
  );

// ascending
export const showEarliestFirst = (scrims) =>
  scrims.sort(
    (a, b) =>
      new Date(a.gameStartTime).getTime() - new Date(b.gameStartTime).getTime()
  );
