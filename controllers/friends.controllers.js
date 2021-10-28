const User = require('../models/user.model');

const nestedPopulate = (path, modelPath) => {
  // nested populate
  return {
    path: path,
    populate: {
      path: modelPath,
      model: 'User',
      select: 'name discord rank region', // exclude adminKey,uid and email from showing
    },
  };
};

// @route   GET api/friends/user-friends/:id
// @desc    get all the friends for that specific user
// @access  Public
const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    return await User.findById(id)
      .populate(nestedPopulate('friends', '_id'))
      .exec((err, user) => {
        const friends = user?.friends ?? [];
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err.message });
        }
        return res.status(200).json(friends);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET api/friend-requests/verifiedUser
// @desc    get friend requests for that specific user.
// @access  Private
const getUserFriendRequests = async (req, res) => {
  try {
    const id = req.user._id;

    return await User.findById(id)
      .populate(nestedPopulate('friendRequests', '_user'))
      .exec((err, user) => {
        const friendRequests = user?.friendRequests ?? [];
        if (err) {
          console.log(err);
          return res.status(500).json({ error: err.message });
        }
        console.log('success');
        return res.status(200).json(friendRequests);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET api/friend-requests/check-friend-request-sent/:receiverId
// @desc    check if the sender sent a friend request to the receiver user
// @access  Private
const checkFriendRequestSent = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    const receiverUser = await User.findById(receiverId);

    if (!receiverUser) {
      return res.status(500).json({ error: 'receiver not found' });
    }

    const isFriendRequestSentBySender = receiverUser.friendRequests.some(
      (request) => String(request?._user) === String(senderId)
    );

    return res.status(200).json(isFriendRequestSentBySender);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST api/friend-requests/send-friend-request/:userReceivingId/:userSendingId
// @desc    remove one friend request from user (ex: reject a friend request)
// @access  Public
const sendFriendRequest = async (req, res) => {
  try {
    const { userSendingId, userReceivingId } = req.params;

    const userSending = await User.findById(userSendingId);
    const userReceiving = await User.findById(userReceivingId);

    const sendingToSelf = String(userSendingId) === String(userReceivingId);

    if (sendingToSelf) {
      return res.status(500).json({
        error: 'Friend request cannot be sent to yourself',
      });
    }

    const friendRequestFound = userReceiving.friendRequests.find(
      ({ _user }) => String(_user) === String(userSending._id)
    );

    if (friendRequestFound) {
      return res.status(500).json({
        error: `Friend request already sent to: ${userReceiving.name} by ${userSending.name}`,
      });
    }

    const newFriendRequest = {
      _user: {
        _id: userSending._id,
        name: userSending.rank,
        region: userSending.region,
        discord: userSending.discord,
      },
    };

    //  add a new notification to the user
    let newNotification = {
      _relatedUser: userSendingId,
      message: `${userSending.name} sent you a friend request!`,
      isFriendRequest: true,
      createdDate: Date.now(),
    };

    const reqBody = {
      friendRequests: [...userReceiving.friendRequests, newFriendRequest],
      notifications: [...userReceiving.notifications, newNotification],
    };

    await User.findByIdAndUpdate(
      userReceivingId,
      reqBody,
      { new: true },
      async (error, user) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        if (!user) {
          return res.status(500).send('User not found');
        }

        await user.save();

        return res.status(200).json({
          newFriendRequest: {
            ...newFriendRequest,
            _user: userSending._id,
          },

          newNotification,
          sentToUser: `${userReceiving.name} (${userReceiving.region})`,
          sentToUserId: userReceiving._id,
        });
      }
    );

    return;
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/friend-requests/:userId/reject-friend-request/:requestId
// @desc    remove one friend request from user (ex: reject a friend request)
// @access  Public
const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({ error: 'User not found' });
    }

    const filteredFriendRequests = user.friendRequests.filter(
      ({ _id }) => String(_id) !== requestId
    );

    user.friendRequests = filteredFriendRequests;

    await user.save();

    return res.status(200).json({
      removedFriendRequestId: requestId,
      friendRequests: user.friendRequests,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST api/friend-requests/accept-request/:id
// @desc    add a new friend to both parties (the friend requesting and accepting), this happens when a friend request is accepted
// @access  Public
const acceptFriendRequest = async (req, res) => {
  const { id } = req.params;

  const { newFriendUserId } = req.body;

  const sendingToSelf = String(newFriendUserId) === String(id);

  if (sendingToSelf) {
    return res.status(500).json({
      error: 'Friend request cannot be accepted by yourself',
    });
  }

  // user receiving the  friend request
  let user = await User.findById(id);

  // user sent the friendRequest
  let friendUser = await User.findById(newFriendUserId);

  if (!user) {
    return res.status(500).send(`User not found with id: ${escape(id)}`);
  }

  if (!friendUser) {
    return res
      .status(500)
      .send(`Friend user not found with id: ${escape(newFriendUserId)}`);
  }

  if (user.friends.find(({ _id }) => String(_id) === String(friendUser._id))) {
    res.status(500).send({ error: 'Friend already added!' });
    return;
  }

  if (friendUser.friends.find(({ _id }) => String(_id) === String(user._id))) {
    res.status(500).send({ error: 'Friend already added!' });
    return;
  }

  if (user.friends) {
    user.friends.push(friendUser);
  } else {
    user.friends = [friendUser];
  }

  await user.save();

  if (friendUser.friends) {
    friendUser.friends.push(user);
  } else {
    friendUser.friends = [user];
  }

  await friendUser.save();

  return res.status(200).json({
    updatedUserFriends: user.friends,
    updatedFriendFriends: friendUser.friends,
  });
};

// @route   POST api/friends/remove-friend/:id
// @desc    when both users are already friends but one user decides to "Unfriend" the friend.
// @access  Private
const unfriendUser = async (req, res) => {
  const { friendUserId } = req.body;
  const currentUserId = req.user._id;

  // user making the friend deletion call
  let user = await User.findById(currentUserId);

  // user's friend
  let friendUser = await User.findById(friendUserId);

  if (!user) {
    return res
      .status(500)
      .send(`User not found with id: ${escape(currentUserId)}`);
  }

  if (!friendUser) {
    return res
      .status(500)
      .send(`Friend user not found with id: ${escape(friendUserId)}`);
  }

  user.friends = user.friends.filter(
    ({ _id }) => String(_id) !== String(friendUser._id)
  );

  await user.save();

  friendUser.friends = friendUser.friends.filter(
    ({ _id }) => String(_id) !== String(user._id)
  );

  await friendUser.save();

  return res.status(200).json({
    userFriends: user.friends,
    friendUserFriends: friendUser.friends,
  });
};

module.exports = {
  getUserFriends,
  sendFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  unfriendUser,
  getUserFriendRequests,
  checkFriendRequestSent,
};
