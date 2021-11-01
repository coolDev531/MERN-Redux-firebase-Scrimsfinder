import { memo } from 'react';
import TextField from '@mui/material/TextField';
import MomentDateAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DesktopDatePicker from '@mui/lab/DesktopDatePicker';
import MobileDatePicker from '@mui/lab/MobileDatePicker';

// utils
import { isMobile } from './../../utils/navigator';

function DatePicker({ value, onChange, variant, fullWidth, ...rest }) {
  const isMobileDevice = isMobile();

  return (
    <LocalizationProvider dateAdapter={MomentDateAdapter}>
      {!isMobileDevice ? (
        <DesktopDatePicker
          inputFormat="MM/DD/yyyy"
          value={value}
          {...rest}
          onChange={onChange}
          renderInput={(params) => (
            <TextField fullWidth={fullWidth} variant={variant} {...params} />
          )}
        />
      ) : (
        <MobileDatePicker
          inputFormat="MM/DD/yyyy"
          value={value}
          onChange={onChange}
          {...rest}
          renderInput={(params) => (
            <TextField fullWidth={fullWidth} variant={variant} {...params} />
          )}
        />
      )}
    </LocalizationProvider>
  );
}

export default memo(DatePicker);
