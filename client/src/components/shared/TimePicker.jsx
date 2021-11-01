import { memo } from 'react';
import TextField from '@mui/material/TextField';
import MomentDateAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MuiTimePicker from '@mui/lab/TimePicker';

function TimePicker({ value, onChange, variant, fullWidth, ...rest }) {
  return (
    <LocalizationProvider dateAdapter={MomentDateAdapter}>
      <MuiTimePicker
        value={value}
        {...rest}
        onChange={onChange}
        renderInput={(params) => (
          <TextField fullWidth={fullWidth} variant={variant} {...params} />
        )}
      />
    </LocalizationProvider>
  );
}

export default memo(TimePicker);
