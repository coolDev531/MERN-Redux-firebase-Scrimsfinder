const { sendMessage } = require('./events/sendMessage');
const { sendNotification } = require('./events/sendNotification');
const { addUser, removeUser, getUser } = require('./_helpers');

require('dotenv').config();

const createSocket = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? 'https://lol-scrims-finder.netlify.app'
          : '*',
      credentials: true,
    },
    path: '/socket.io', // specify the namespace path here
  });

  io.on('connection', (socket) => {
    // when connect-
    console.log('a user connected');

    // io.emit('welcome', 'hello this is socket server'); // send to every client (public) (eventName, result)

    // take userId and socketId from user
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', global.socketUsers); // emit to client
    });

    socket.on('sendMessage', (data) => {
      sendMessage(io, data);
    });

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

    // for friend requests or conversation starts
    socket.on('sendNotification', (data) => {
      sendNotification(io, data);
    });

    // just checking that scrim chat has been opened or closed
    socket.on('scrimChatOpen', async ({ userId, scrimId }) => {
      console.log('ScrimChatOpen', userId, scrimId);

      return;
    });
    socket.on('scrimChatClose', async () => {
      console.log('scrimChatClose');
    });

    // send scrim to scrim chat box
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
          _conversation, // make sure that it's only being sent to that specific scrim chat box.
        });

        return;
      }
    );

    // scrim team list socket here:
    socket.on('sendScrimTransaction', async (updatedScrim) => {
      console.log('sendScrimTransaction: ', updatedScrim);
      // send the updated scrim
      io.emit('getScrimTransaction', updatedScrim);
    });

    // when disconnect
    // add unsubscribe event listener
    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUser(socket.id);
      io.emit('getUsers', global.socketUsers); // emit to client (return new users state)

      return;
    });
  });
};

module.exports = createSocket;
