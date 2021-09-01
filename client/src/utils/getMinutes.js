export const getMinutes = (dt) => {
  //  get minutes with leading zeros
  return (dt.getMinutes() < 10 ? '0' : '') + dt.getMinutes();
};
