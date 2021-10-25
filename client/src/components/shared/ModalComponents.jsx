import React from 'react';
import MuiDialogTitle from '@mui/material/DialogTitle';
import MuiDialog from '@mui/material/Dialog';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiPaper from '@mui/material/Paper';
import MuiDialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Draggable from 'react-draggable';
import Button from '@mui/material/Button';
import { withStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// utils
import { isMobile } from './../../utils/navigator';
import Tooltip from './Tooltip';

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

  goBackButton: {
    position: 'absolute !important',
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

export const DialogTitle = withStyles(styles)((props) => {
  const {
    children,
    renderBackButton,
    onClickBack,
    classes,
    onClose,
    ...other
  } = props;
  return (
    <>
      {renderBackButton ? (
        <Tooltip title="Go back">
          <IconButton
            aria-label="go back"
            className={classes.goBackButton}
            onClick={onClickBack}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      ) : null}

      <MuiDialogTitle
        className={classes.title}
        component="h1"
        variant="h6"
        {...other}>
        {children}
      </MuiDialogTitle>
      {onClose ? (
        <Tooltip title="Close">
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
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

const DraggablePaper = (props) => {
  return (
    // https://stackoverflow.com/questions/46427946/react-draggable-components-with-inputs-lose-the-ability-to-focus-when-clicking
    <Draggable cancel="._draggable__input">
      <MuiPaper {...props} />
    </Draggable>
  );
};

const DraggableModal = ({ children, ...rest }) => {
  const isMobileDevice = isMobile();

  // if user didn't type anything, it's draggable.
  // if it's not a mobile device, it's draggable
  return !isMobileDevice ? (
    <MuiDialog {...rest} PaperComponent={DraggablePaper}>
      {children}
    </MuiDialog>
  ) : (
    // if device is mobile, don't make dialog draggable
    <MuiDialog {...rest}>{children}</MuiDialog>
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
    customStyles = null,
    renderBackButton = false,
    onClickBack = null,
    contentClassName = 'modal__content',
    closeBtnTitle = 'Close',
  }) => {
    return (
      <DraggableModal open={open} onClose={onClose}>
        <DialogTitle
          renderBackButton={renderBackButton}
          onClickBack={onClickBack}
          onClose={onClose}>
          {title}
        </DialogTitle>

        <DialogContent
          dividers
          className={contentClassName}
          style={
            customStyles
              ? {
                  ...customStyles,
                }
              : {
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '350px',
                  maxHeight: '300px',
                  overflowWrap: 'break-word',
                }
          }>
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
            {closeBtnTitle}
          </Button>
        </DialogActions>
      </DraggableModal>
    );
  }
);
