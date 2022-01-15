const Ban = require('../models/ban.model');

const banDateExpired = (dateTo) => {
  return (
    new Date(
      new Date(dateTo).toLocaleDateString('en-US').split(' ')[0]
    ).getTime() <= new Date(new Date().toLocaleDateString('en-US')).getTime()
  );
};

const unbanUser = async (selectedUser) => {
  let foundBan = await Ban.findById(String(selectedUser.currentBan._ban));

  foundBan._unbannedBy = null;
  foundBan.isActive = false;

  await foundBan.markModified('_unbannedBy');
  await foundBan.markModified('isActive');

  const savedBan = await foundBan.save();

  selectedUser.currentBan = {
    isActive: false,
    dateFrom: null,
    dateTo: null,
    _bannedBy: selectedUser.currentBan._bannedBy,
    _unbannedBy: null,
    _ban: selectedUser.currentBan?._ban,
  };

  // update ban history
  selectedUser.bansHistory = selectedUser.bansHistory?.map((ban) => {
    return String(selectedUser.currentBan?._ban) === String(ban._id)
      ? savedBan
      : ban;
  });

  await selectedUser.markModified('currentBan');
  await selectedUser.markModified('bansHistory');

  const updatedUser = await selectedUser.save();
  return { updatedUser, savedBan };
};

module.exports = {
  banDateExpired,
  unbanUser,
};
