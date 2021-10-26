const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');

// @route   POST /api/conversations
// @desc    create one conversation between a sender and a receiver (For user messenger)
// @access  Public
const postConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId) {
      return res.status(500).json({ message: 'senderId not provided' });
    }

    if (!receiverId) {
      return res.status(500).json({ message: 'receiverId not provided' });
    }

    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    let savedConversation = await newConversation.save();

    savedConversation = await savedConversation
      .populate('members', ['name', 'discord', 'rank', 'region'])
      .execPopulate();

    return res.status(200).json(savedConversation);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/conversations/user/:userId?uid="xxx"
// @desc    get many conversations of one specific user (user needs to be authorized with req.body.uid)
// @access  Private
const getUserConversations = async (req, res) => {
  try {
    // authorize so only validated user can see his own conversations
    const user = req.user ?? false; // comes from auth middleware;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const foundUser = await User.findById(user._id);

    if (!foundUser) {
      return res.status(500).json({ error: 'User not found' });
    }

    const isMatch = user.email === foundUser.email; // tbh ofc it's going to be a match, if it found the user it already will match LOL...

    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', status: false });
    }

    // find the  conversations for that user
    const conversations = await Conversation.find({
      members: { $in: [user._id] },
    })
      .populate('members', ['name', 'discord', 'region', 'rank'])
      .exec();

    if (!conversations) {
      return res.status(200).json({ conversations: [] });
    }

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/conversations/find/:firstUserId/:secondUserId
// @desc    get one conversation between 2 users (order doesn't matter)
// @access  Private
const findOneConversation = async (req, res) => {
  try {
    const userId = req.user._id ?? false;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', status: false });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });

    const authorized = conversation.members.find((memberId) => {
      return String(memberId) === String(userId);
    });

    if (!authorized) {
      return res.status(401).json({ error: 'Unauthorized', status: false });
    }

    // populate so client can receive the members attributes
    conversation = await conversation
      .populate('members', ['name', 'discord', 'rank', 'region'])
      .execPopulate();

    return res.status(200).json(conversation);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// @route   GET /api/conversations/find-by-id/:conversationId
// @desc    get one conversation by conversation._id
// @access  Public
const findOneConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(500).json({ message: 'conversationId not provided!' });
    }

    let conversation = await Conversation.findById(conversationId);

    // populate so client can receive the members attributes
    conversation = await conversation
      .populate('members', ['name', 'discord', 'rank', 'region'])
      .execPopulate();

    return res.status(200).json(conversation);
  } catch (err) {
    return res.status(500).json(err);
  }
};

// @route   GET /api/conversations/scrim/:scrimId
// @desc    get one conversation that belongs to a scrim by the scrim._id
// @access  Public
const findScrimConversation = async (req, res) => {
  try {
    const { scrimId } = req.params;

    if (!scrimId) {
      return res.status(500).json({ message: 'scrimId not provided!' });
    }

    let conversation = await Conversation.findOne({ _scrim: scrimId });

    // populate so client can receive the members attributes
    conversation = await conversation
      .populate('members', ['name', 'discord', 'rank', 'region'])
      .execPopulate();

    return res.status(200).json(conversation);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  postConversation,
  getUserConversations,
  findOneConversation,
  findOneConversationById,
  findScrimConversation,
};
