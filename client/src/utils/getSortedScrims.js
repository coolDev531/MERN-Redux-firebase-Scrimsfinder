//  scrims sorting

export const showLatestFirst = (scrims) =>
  scrims.sort(
    (a, b) =>
      new Date(b.gameStartTime).getTime() - new Date(a.gameStartTime).getTime()
  );

export const showEarliestFirst = (scrims) =>
  scrims.sort(
    (a, b) =>
      new Date(a.gameStartTime).getTime() - new Date(b.gameStartTime).getTime()
  );
