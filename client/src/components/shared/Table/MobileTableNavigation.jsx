import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIos';
import { COLORS } from './../../../appTheme';

export default function MobileTableNavigation({
  currentPage,
  onPageChange,
  rowsPerPage,
  totalRowsCount,
}) {
  const handleBackButtonClick = () => {
    onPageChange(currentPage - 1);
  };

  const handleNextButtonClick = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <Grid
      container
      justifyContent="space-evenly"
      alignItems="center"
      sx={{ backgroundColor: '#F1F1F1', height: '100px' }}>
      <ArrowButton
        direction="backward"
        disabled={currentPage === 0}
        onClick={handleBackButtonClick}
      />
      <ArrowButton
        direction="forward"
        disabled={currentPage >= Math.ceil(totalRowsCount / rowsPerPage) - 1}
        onClick={handleNextButtonClick}
      />
    </Grid>
  );
}

const ArrowButton = ({ direction, onClick, disabled = false }) => {
  return (
    <Box
      component="button"
      disabled={disabled}
      onClick={onClick}
      sx={{
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        position: 'relative',
        border: 'none',
        boxSizing: 'border-box',
        color: 'primary.main',
        cursor: 'pointer',
        backgroundColor: COLORS.GREY_PAPER,

        '&:disabled': {
          backgroundColor: '#C4C4C4',
          color: '#9E9E9E',
        },
      }}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}>
        {direction === 'forward' ? (
          <ArrowForwardIcon sx={{ fontSize: '18px' }} />
        ) : (
          <ArrowBackIcon sx={{ fontSize: '18px' }} />
        )}
      </Box>
    </Box>
  );
};
