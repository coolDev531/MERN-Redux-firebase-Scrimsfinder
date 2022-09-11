import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useAlerts from '../../hooks/useAlerts';

function CurrentAlertSnackbar() {
  const { currentAlert, closeAlert } = useAlerts();

  return (
    currentAlert && (
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000} // autohide will set the current alert to null in the state.
        open={currentAlert.message ? true : false}
        onClose={closeAlert}
        message={currentAlert.message}>
        <Alert
          variant="filled"
          onClose={closeAlert}
          severity={currentAlert.type.toLowerCase()}>
          {/* example: success - scrim created successfully! */}
          <strong>{currentAlert.type}</strong> - {currentAlert.message}
        </Alert>
      </Snackbar>
    )
  );
}

export default CurrentAlertSnackbar;
