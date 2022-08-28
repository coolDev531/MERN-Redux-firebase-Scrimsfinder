import { useState, useMemo, useCallback } from 'react';
import useAlerts from '../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import AdminArea from './../shared/AdminArea';
import BanUserModal from '../modals/BanUserModal';

// services
import { banUser, unbanUser } from '../../services/admin.services.js';

// icons
import BanIcon from '@mui/icons-material/Gavel';
import UnbanIcon from '@mui/icons-material/AccessibilityNew';

export default function BanUser({ user, setUser }) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setCurrentAlert } = useAlerts();

  const openBanModal = () => setIsModalOpen(true);
  const closeBanModal = useCallback(
    () => setIsModalOpen(false),
    [setIsModalOpen]
  );

  const isBanned = useMemo(
    () => user?.currentBan?.isActive,
    [user?.currentBan?.isActive]
  );
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'));

  const onBanClick = useCallback(
    async (body) => {
      try {
        setButtonsDisabled(true);

        const {
          success = false,
          dateFrom,
          dateTo,
          _bannedBy,
        } = await banUser(user._id, body);

        if (success) {
          setUser((prevState) => ({
            ...prevState,
            currentBan: {
              isActive: true,
              dateFrom,
              dateTo,
              _bannedBy,
            },
          }));

          setCurrentAlert({
            type: 'Success',
            message: 'User banned successfully',
          });
        }
      } catch (error) {
        const errorMsg =
          error?.response?.data?.error ??
          error?.message ??
          JSON.stringify(error);

        setCurrentAlert({
          type: 'Error',
          message: errorMsg,
        });
      } finally {
        closeBanModal();
        setButtonsDisabled(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setButtonsDisabled, setUser, user._id]
  );

  const onUnbanClick = async () => {
    try {
      setButtonsDisabled(true);
      const { success } = await unbanUser(user._id);

      if (success) {
        setUser((prevState) => ({
          ...prevState,
          currentBan: {
            isActive: false,
          },
        }));

        setCurrentAlert({
          type: 'Success',
          message: 'User unbanned successfully',
        });
      }
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error unbanning user',
      });
    } finally {
      setButtonsDisabled(false);
    }
  };

  return (
    <AdminArea>
      <FormGroup
        row
        style={{
          transition: 'all 250ms ease-in-out',
        }}>
        {/* if not banned, show send ban user button */}
        {!isBanned ? (
          <Button
            style={{
              width: '100%',
              height: '50px',
              alignSelf: 'center',
              marginLeft: !matchesSm ? '0' : '20px',
              marginTop: '20px',
            }}
            startIcon={<BanIcon />}
            variant="contained"
            disabled={buttonsDisabled || isBanned}
            onClick={openBanModal}>
            Ban This User
          </Button>
        ) : (
          <Button
            style={{
              width: '100%',
              height: '50px',
              alignSelf: 'center',
              marginLeft: !matchesSm ? '0' : '20px',
              marginTop: '20px',
            }}
            startIcon={<UnbanIcon />}
            variant="contained"
            disabled={buttonsDisabled || !isBanned}
            onClick={onUnbanClick}>
            Unban This User
          </Button>
        )}
      </FormGroup>
      <BanUserModal
        isOpen={isModalOpen}
        onClose={closeBanModal}
        onBanClick={onBanClick}
        submitDisabled={buttonsDisabled}
      />
    </AdminArea>
  );
}
