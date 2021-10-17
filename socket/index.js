// index.js socket
const PORT = process.env.PORT || 8900;

const io = require('socket.io')(PORT, {
  cors: {
    origin: '*',
  },
});

let users = [];

const addUser = (userId, socketId) => {
  // if user wasn't found, you can push him to users array
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
  }
  return;
};

const getUser = (userId) => {
  console.log({ users });
  return users.find((user) => user.userId === userId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  return;
};

io.on('connection', (socket) => {
  // when connect-
  console.log('a user connected');

  // io.emit('welcome', 'hello this is socket server'); // send to every client (public) (eventName, result)

  // take userId and socketId from user
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users); // emit to client
  });

  socket.on(
    'sendMessage',
    async ({ senderId, receiverId, text, messageId, createdAt }) => {
      const receiverUser = getUser(receiverId); // send message to receiver from sender client

      // don't emit if there isn't a receiverUser
      if (!receiverUser) {
        return;
      }

      io.to(receiverUser.socketId).emit('getMessage', {
        senderId,
        text,
        messageId,
        createdAt,
      });

      return;
    }
  );

  // when disconnect
  // add unsubscribe event listener
  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    removeUser(socket.id);
    io.emit('getUsers', users); // emit to client (return new users state)

    return;
  });
});
