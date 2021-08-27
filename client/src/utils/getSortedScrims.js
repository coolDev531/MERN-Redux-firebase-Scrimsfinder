export const getSortedScrims = (scrims) => {
  const sortedScrims = scrims.sort((a, b) => {
    const date1 = new Date(a.gameStartTime).getTime();
    const date2 = new Date(b.gameStartTime).getTime();

    if (date1 < date2) {
      return -1;
    } else if (date1 > date2) {
      return 1;
    } else {
      return 0;
    }
  });

  return sortedScrims;
};
