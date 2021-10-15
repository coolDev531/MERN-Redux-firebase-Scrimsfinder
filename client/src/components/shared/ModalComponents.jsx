import React from 'react';
import Grid from '@mui/material/Grid';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiPaper from '@mui/material/Paper';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Draggable from 'react-draggable';
import Button from '@mui/material/Button';
import { withStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';

export const styles = (theme) => ({
  title: {
    margin: 0,
    padding: theme.spacing(2),
    fontWeight: 700,
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute !important',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

export const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <>
      <MuiDialogTitle
        className={classes.title}
        component="h1"
        variant="h6"
        {...other}>
        {children}
      </MuiDialogTitle>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </>
  );
});

export const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const PaperComponent = (props) => {
  return (
    <Draggable>
      <MuiPaper {...props} />
    </Draggable>
  );
};

export const DraggableModal = ({ children, ...rest }) => {
  return (
    <MuiDialog {...rest} PaperComponent={PaperComponent}>
      {children}
    </MuiDialog>
  );
};

export const Modal = React.memo(
  ({
    children,
    onClose,
    title,
    open,
    actionButtonProps,
    actionButtonStyle,
  }) => {
    return (
      <DraggableModal open={open} onClose={onClose}>
        <DialogTitle onClose={onClose}>{title}</DialogTitle>

        <DialogContent
          dividers
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: '300px',
            overflowWrap: 'break-word',
          }}>
          {children}
        </DialogContent>

        <DialogActions>
          {actionButtonProps && (
            <Button
              type="primary"
              style={actionButtonStyle ? actionButtonStyle : null}
              onClick={() => actionButtonProps.onClick()}
              variant="contained"
              {...actionButtonProps.appearance}>
              {actionButtonProps.title}
            </Button>
          )}

          <Button color="secondary" onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </DraggableModal>
    );
  }
);
