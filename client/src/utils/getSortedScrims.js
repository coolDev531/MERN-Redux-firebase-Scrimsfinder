export const getSortedScrims = (scrims, property) => {
  const sortedScrims = scrims.sort((a, b) => {
    const date1 = new Date(a[property]).getTime();
    const date2 = new Date(b[property]).getTime();

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
