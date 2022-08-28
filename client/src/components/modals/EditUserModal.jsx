import { useState, useMemo, useEffect } from 'react';
import useAlerts from '../../hooks/useAlerts';

// components
import { Modal } from '../shared/ModalComponents';
import Grid from '@mui/material/Grid';
import UserRankFields from '../shared/Form_components/UserRankFields';

// services
import { updateUserAsAdmin } from '../../services/admin.services';

export default function EditUserModal({
  isOpen,
  openModal,
  onClose,
  modalTitle,
  user,
  setUser,
}) {
  const initialRankDataState = {
    rankDivision: user?.rank?.replace(/[0-9]/g, '').trim(), // match letters, trim spaces.
    rankNumber: user?.rank?.replace(/[a-z]/gi, '').trim(), // match numbers
  };

  const [rankData, setRankData] = useState(initialRankDataState);

  const { setCurrentAlert } = useAlerts();

  const resetInputs = () => {
    setRankData(initialRankDataState);
  };

  const onSaveClick = async () => {
    const body = {
      rank: createRankFromRankData(rankData),
    };

    const updatedUser = await updateUserAsAdmin(
      user?._id,
      body,
      setCurrentAlert
    );

    setUser((prevState) => ({
      ...prevState,
      ...updatedUser,
    }));

    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        resetInputs();
      }, 250);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const renderFieldsJSX = useMemo(() => {
    if (openModal === 'rank') {
      return <UserRankFields rankData={rankData} setRankData={setRankData} />;
    }

    return <></>;
  }, [openModal, rankData, setRankData]);

  if (!isOpen) return null;

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onClose={onClose}
      closeBtnTitle="Close"
      actionButtonProps={{
        onClick: () => {
          onSaveClick();
        },
        title: 'Save',

        appearance: {
          // disabled: submitDisabled,
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
          {renderFieldsJSX}
        </Grid>
      </Grid>
    </Modal>
  );
}

function createRankFromRankData(rankData) {
  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
  ];

  const { rankNumber, rankDivision } = rankData;
  let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

  let rankResult = isDivisionWithNumber
    ? `${rankDivision} ${rankNumber === '' ? '4' : rankNumber}`
    : rankDivision;

  return rankResult;
}
