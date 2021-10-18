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

  socket.on(
    'sendConversation',
    async ({ conversationId, senderId, receiverId }) => {
      const receiverUser = getUser(receiverId); // send message to receiver from sender client

      // don't emit if there isn't a receiverUser
      if (!receiverUser) {
        return;
      }

      console.log('receiverUser! ', receiverUser);

      io.to(receiverUser.socketId).emit('getConversation', {
        senderId,
        receiverId,
        conversationId,
      });

      return;
    }
  );

  socket.on(
    'sendNotification',
    async ({
      message,
      _relatedUser = null,
      receiverId,
      isConversationStart = false,
      isFriendRequest = false,
      _relatedScrim = null,
      conversation,
    }) => {
      const receiverUser = getUser(receiverId); // send message to receiver from sender client

      // don't emit if there isn't a receiverUser
      if (!receiverUser) {
        return;
      }

      console.log('receiverUser! ', receiverUser);

      io.to(receiverUser.socketId).emit('getNotification', {
        message,
        receiverId,
        _relatedUser,
        isConversationStart,
        _relatedScrim,
        isFriendRequest,
        conversation,
      });

      return;
    }
  );

  // add user to scrim chat
  socket.on('scrimChatOpen', async ({ userId, scrimId }) => {
    console.log('ScrimChatOpen', userId, scrimId);

    return;
  });

  socket.on('scrimChatClose', async () => {
    console.log('scrimChatClose');
  });

  socket.on(
    'sendScrimMessage',
    async ({ senderId, text, messageId, createdAt, _conversation }) => {
      console.log('sendScrimMessage');
      // don't emit if there isn't a receiverUser

      io.emit('getScrimMessage', {
        senderId,
        text,
        messageId,
        createdAt,
        _conversation,
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
