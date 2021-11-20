import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function useAlerts() {
  const dispatch = useDispatch();
  const currentAlert = useSelector(({ alerts }) => alerts.currentAlert);

  const setCurrentAlert = useCallback(
    (newCurrentAlertValue) => {
      // remove existing alert (for when spamming to copy link to clipboard)
      dispatch({
        type: 'alerts/setCurrentAlert',
        payload: null,
      });

      // send the new alert
      setTimeout(() => {
        dispatch({
          type: 'alerts/setCurrentAlert',
          payload: newCurrentAlertValue,
        });
      }, 1);
    },
    // eslint-disable-next-line
    []
  );

  const closeAlert = useCallback(() => setCurrentAlert(null), []); // eslint-disable-line

  return { currentAlert, setCurrentAlert, closeAlert };
}
