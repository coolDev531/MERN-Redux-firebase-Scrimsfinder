// hooks
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

// components
import { Modal } from '../shared/ModalComponents';
import Grid from '@mui/material/Grid';
import Tyopgrahy from '@mui/material/Typography';
import useAuth from './../../hooks/useAuth';

// services
import { updateUser } from './../../services/auth.services';

// this modal was created to ask users if they would be interested in receiving emails.
// this boolean is stored in the db as canSendEmailsToUser.
// This modal will probably only be used for 1 day until users know about this feature and then they will just access it in settings (will default to false in db)
// DISCONTINUED THIS MODAL IS NOT USED
export default function CanSendEmailsModal() {
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const { currentUser } = useAuth();
  const dispatch = useDispatch();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(() => {
    if (currentUser?.canSendEmailsToUser) return false;

    if (!localStorage.getItem('isEmailModalAnswered')) {
      return true;
    }

    return false;
  });

  const handleAcceptClick = useCallback(async () => {
    localStorage.setItem('isEmailModalAnswered', true);
    setSubmitDisabled(true);

    const { canSendEmailsToUser } = await updateUser({
      ...currentUser,
      canSendEmailsToUser: true, // user accepted emails
    });

    dispatch({
      type: 'auth/updateCurrentUser',
      payload: { canSendEmailsToUser },
    });
    setIsEmailModalOpen(false);
  }, [currentUser, dispatch]);

  const handleRejectClick = useCallback(async () => {
    localStorage.setItem('isEmailModalAnswered', true);

    const { canSendEmailsToUser } = await updateUser({
      ...currentUser,
      canSendEmailsToUser: false, // user rejected emails.
    });

    dispatch({
      type: 'auth/updateCurrentUser',
      payload: { canSendEmailsToUser },
    });

    setIsEmailModalOpen(false);
  }, [currentUser, dispatch]);

  return (
    <Modal
      title="Email preferences"
      open={isEmailModalOpen}
      onClose={handleRejectClick}
      closeBtnTitle="No (close)"
      actionButtonProps={{
        onClick: handleAcceptClick,
        title: 'Yes',

        appearance: {
          disabled: submitDisabled,
        },
      }}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Tyopgrahy
            textAlign="center"
            variant="body1"
            style={{ fontWeight: 700 }}
            className="text-white">
            Would you be interested in receiving emails for upcoming updates?
          </Tyopgrahy>
        </Grid>

        <Grid item container justifyContent="center">
          <Tyopgrahy textAlign="center" variant="body2">
            (you can change this in settings later)
          </Tyopgrahy>
        </Grid>
      </Grid>
    </Modal>
  );
}
