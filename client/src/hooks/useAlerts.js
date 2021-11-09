import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function useAlerts() {
  const dispatch = useDispatch();
  const currentAlert = useSelector(({ alerts }) => alerts.currentAlert);

  const setCurrentAlert = useCallback(
    (newCurrentAlertValue) =>
      dispatch({
        type: 'alerts/setCurrentAlert',
        payload: newCurrentAlertValue,
      }),

    // eslint-disable-next-line
    []
  );

  const closeAlert = useCallback(() => setCurrentAlert(null), []); // eslint-disable-line

  return { currentAlert, setCurrentAlert, closeAlert };
}
