const MOBILE_DEVICES =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const isMobile = () => {
  if (MOBILE_DEVICES.test(navigator.userAgent)) return true;
  return false;
};
