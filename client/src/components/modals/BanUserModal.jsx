import { useState, useEffect } from 'react';
// components
import { Modal } from '../shared/ModalComponents';
import Grid from '@mui/material/Grid';
import DatePicker from '../shared/DatePicker';
import moment from 'moment';
import OutlinedInput from '@mui/material/OutlinedInput';

export default function BanUserModal({
  onBanClick,
  isOpen,
  onClose,
  submitDisabled,
}) {
  const today = moment();

  const [dateFrom, setDateFrom] = useState(today);

  const [dateTo, setDateTo] = useState(
    moment(dateFrom).add('days', 1).format('MM/DD/YYYY')
  );

  const [reason, setReason] = useState('');

  const clearInputs = () => {
    setDateFrom(today);
    setDateTo(moment(dateFrom).add('days', 1).format('MM/DD/YYYY'));
    setReason('');
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        clearInputs();
      }, 250);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal
      title="Ban Form"
      open={isOpen}
      onClose={onClose}
      closeBtnTitle="Close"
      actionButtonProps={{
        onClick: () => {
          onBanClick({ dateFrom, dateTo, reason });
        },
        title: 'Ban',

        appearance: {
          disabled: submitDisabled,
        },
      }}>
      <Grid
        container
        alignItems="center"
        direction="column"
        justifyContent="center"
        sx={{
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '10px',
          paddingRight: '10px',
        }}>
        <Grid
          container
          alignItems="center"
          direction="row"
          justifyContent="center"
          spacing={4}
          sx={{
            paddingTop: '5px',
            paddingBottom: '5px',
            paddingLeft: '10px',
            paddingRight: '10px',
          }}>
          <Grid item sx={4}>
            <DatePicker
              label={<span className="text-white">Date from</span>}
              variant="standard"
              name="dateFrom"
              onChange={(newValue) => setDateFrom(newValue)}
              required
              value={dateFrom}
            />
          </Grid>

          <Grid item sx={4}>
            <DatePicker
              label={<span className="text-white">Date to</span>}
              variant="standard"
              name="dateFrom"
              onChange={(newValue) => setDateTo(newValue)}
              required
              value={dateTo}
              minDate={moment(dateFrom).add('days', 1)}
            />
          </Grid>
        </Grid>

        <Grid
          container
          alignItems="center"
          direction="row"
          justifyContent="center"
          spacing={4}
          sx={{
            paddingTop: '5px',
            paddingBottom: '5px',
            paddingLeft: '10px',
            paddingRight: '10px',
          }}>
          <Grid item xs={12}>
            <OutlinedInput
              className="_draggable__input"
              multiline
              maxRows={5}
              sx={{ marginTop: 4, width: '98%' }} // this width also expands the width of the modal (as wanted tbh)
              placeholder="Reason for ban"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
}
