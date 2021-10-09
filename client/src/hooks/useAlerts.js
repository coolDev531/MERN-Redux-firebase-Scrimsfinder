import { useDispatch, useSelector } from 'react-redux';

export default function useAlerts() {
  const dispatch = useDispatch();
  const currentAlert = useSelector(({ alerts }) => alerts.currentAlert);

  const setCurrentAlert = (newCurrentAlertValue) =>
    dispatch({ type: 'alerts/setCurrentAlert', payload: newCurrentAlertValue });

  const closeAlert = () => setCurrentAlert(null);

  return { currentAlert, setCurrentAlert, closeAlert };
}
