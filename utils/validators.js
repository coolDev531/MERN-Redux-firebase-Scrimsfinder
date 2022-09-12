const validateRank = async ({ rank, req, res }) => {
  const divisionsWithNumbers = [
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
  ];

  const allowedRanks = [
    'Unranked',
    'Iron',
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster',
    'Challenger',
  ];

  let rankDivision = rank.replace(/[0-9]/g, '').trim();

  let isDivisionWithNumber = divisionsWithNumbers.includes(rankDivision);

  const rankInvalid = !allowedRanks.includes(rankDivision);

  if (rankInvalid) {
    res.status(500).json({
      status: false,
      error: 'Invalid rank provided.',
    });

    return false;
  }

  if (isDivisionWithNumber) {
    const rankNumber = rank.replace(/[a-z]/gi, '').trim();

    // check that rank has digits
    if (!/\d/.test(rank)) {
      res.status(500).json({
        status: false,
        error: 'Rank number not provided',
      });

      return false;
    }

    // check that rankNumber is only 1 digit
    if (!/^\d{1,1}$/.test(rankNumber)) {
      res.status(500).json({
        status: false,
        error: 'Rank number invalid: should only contain one digit from 1-4.',
      });

      return false;
    }

    // check that rankNumber is a digit in range from one to four
    if (!/[1-4]/.test(rankNumber)) {
      res.status(500).json({
        status: false,
        error:
          'Rank number is invalid! (should only contain one digit from 1-4)',
      });

      return false;
    }
  } else if (!isDivisionWithNumber) {
    // if the rank division doesn't have a number (aka challenger, master, etc), check that it doesn't have digits
    if (/\d/.test(rank)) {
      res.status(500).json({
        status: false,
        error: 'The provided rank should not have a number',
      });

      return false;
    }
  }

  return true;
};

const checkSummonerNameValid = (summonerName) => {
  const format = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  // dont allow special characters
  return format.test(summonerName);
};

module.exports = {
  validateRank,
  checkSummonerNameValid,
};
