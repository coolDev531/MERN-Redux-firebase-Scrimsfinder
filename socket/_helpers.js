global.socketUsers = [];

const addUser = (userId, socketId) => {
  // if user wasn't found, you can push him to users array
  if (!global.socketUsers.some((user) => user.userId === userId)) {
    global.socketUsers.push({ userId, socketId });
  }
  return;
};

const getUser = (userId) => {
  return global.socketUsers.find((user) => user.userId === userId);
};

const removeUser = (socketId) => {
  global.socketUsers = global.socketUsers.filter(
    (user) => user.socketId !== socketId
  );
  return;
};

module.exports = { addUser, getUser, removeUser };
