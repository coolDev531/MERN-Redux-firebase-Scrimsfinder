const mongoose = require('mongoose');

// models
const Scrim = require('../models/scrim.model');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');

// utils
const generatePassword = require('../utils/generatePassword');
const {
  checkIfScrimIsToday,
  swapPlayer,
  getAvailableRoles,
  compareArrays,
  isValidRole,
  populateTeam,
  populateUser,
  getLobbyName,
  getLobbyHost,
  populateOneScrim,
  onSpotTaken,
  checkUnauthorized,
} = require('../utils/scrimUtils');
const capitalizeWord = require('../utils/capitalizeWord');
const KEYS = require('../config/keys');
const escape = require('escape-html');
const createS3 = require('../utils/createS3');
const uploadToBucket = require('../utils/uploadToBucket');

// for post-game lobby image upload
let s3Bucket = createS3();

// @route   GET /api/scrims
// @desc    Get all scrims / games.
// @access  Public
const getAllScrims = async (req, res) => {
  const region = req.query?.region;
  // /api/scrims?region=NA
  // right now the region query isn't being used in the app.
  if (region) {
    try {
      // might have to use populate on this, not necessary now.
      return await Scrim.find({ region: region })
        .select('-editHistory')
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec((err, scrimData) => {
          if (err) {
            console.log(err);
            return res.status(400).end();
          }
          return res.json(scrimData);
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
      return;
    }
  } else {
    // if no region, just get all scrims.
    // this is what we use in the app to get all scrims.
    try {
      return await Scrim.find()
        .select('-editHistory')
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec((err, scrimData) => {
          if (err) {
            console.log(err);
            return res.status(400).end();
          }
          return res.json(scrimData);
        });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};
// @route   GET /api/scrims/today
// @desc    Get all scrims where the gameStartTime is today, can be scuffed with live server due to different timezone on server host.
// this is not used in the app, but may be useful.
// @access  Public
const getTodaysScrims = async (_req, res) => {
  try {
    const scrims = await Scrim.find().select('-editHistory');
    const todaysScrims = scrims.filter(checkIfScrimIsToday);
    return res.json(todaysScrims);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/scrims/:id
// @desc    Get a specific scrim.
// @access  Public
const getScrimById = async (req, res) => {
  try {
    const { id } = req.params;
    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let scrim = Scrim.findOne({ _id: { $eq: id } }).select('-editHistory');

    if (!scrim) return res.status(404).json({ message: 'Scrim not found!' });

    // using populate to show more than _id when using Ref on the model.
    return await scrim
      .populate('casters', populateUser)
      .populate('createdBy', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec((err, scrimData) => {
        if (err) {
          console.log(err);
          return res.status(400).end();
        }
        return res.json(scrimData);
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   POST /api/scrims
// @desc    create a new scrim / game
// @access  Private (only people with the admin key can see this page in the app and create one)
const createScrim = async (req, res) => {
  try {
    let createdByUser = await User.findOne({
      _id: { $eq: req.body.createdBy._id },
    });

    const requestBody = {
      ...req.body,
      lobbyName:
        req.body.lobbyName ??
        getLobbyName(
          req.body.title ?? `${createdByUser?.name}'s Scrim`,
          req.body?.region ?? 'NA'
        ),
      lobbyPassword: generatePassword(),
      createdBy: createdByUser,
    };

    const scrim = new Scrim(requestBody);

    // add scrim to new conversation
    const scrimConversation = new Conversation({
      members: [],
      _scrim: scrim._id,
    });

    // add that new conversation as _conversation inside scrim
    scrim._conversation = scrimConversation._id;

    await scrim.save(); // save scrim

    const savedConversation = await scrimConversation.save(); // save conv

    console.log('Scrim created: ', scrim);
    console.log('conversation created for scirm: ', savedConversation);

    return res.status(201).json(scrim);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// @route   PUT /api/scrims/:id
// @desc    update an existing scrim (is ScrimEdit in the react app)
// @access  Private (only people with the admin key can update a scrim)
const updateScrim = async (req, res) => {
  const { id } = req.params;

  let isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    return res.status(500).json({ error: 'invalid id' });
  }

  const oneScrim = await Scrim.findById(id).select([
    '-teamOne',
    '-teamTwo',
    '-casters',
    '-lobbyHost',
  ]);

  if (!oneScrim) {
    return res.status(500).json({ error: 'scrim not found' });
  }

  let editHistory;

  if (oneScrim._doc.editHistory?.length) {
    editHistory = [
      {
        ...oneScrim._doc.editHistory,
        previousTitle: oneScrim._doc.title,
        payload: JSON.stringify(req.body),
        _user: req.user,
      },
    ];
  } else {
    editHistory = [
      {
        payload: JSON.stringify(req.body),
        _user: req.user,
        previousTitle: oneScrim._doc.title,
      },
    ];
  }

  const payload = {
    ...req.body,
    editHistory,
  };

  await Scrim.findByIdAndUpdate(id, payload, { new: true }, (error, scrim) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!scrim) {
      return res.status(500).send('Scrim not found');
    }

    return res.status(200).json(scrim);
  })
    .populate('createdBy', populateUser)
    .populate('casters', populateUser)
    .populate('lobbyHost', populateUser)
    .populate(populateTeam('teamOne'))
    .populate(populateTeam('teamTwo'))
    .exec();
};

// @route   DELETE /api/scrims/:id
// @desc    delete an existing scrim
// @access  Private (only people with the admin key can delete a scrim)
const deleteScrim = async (req, res) => {
  try {
    const { id } = req.params;

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    const deleted = await Scrim.findByIdAndDelete(id);

    if (deleted) {
      return res.status(200).send(`Scrim with id: ${escape(id)} deleted`);
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// @route   PATCH /api/scrims/:scrimId/insert-player/:userId
// @desc    This is how a player joins a team in the scrim (is used in ScrimTeamList.jsx)
// @access  Private
const insertPlayerInScrim = async (req, res) => {
  try {
    // when player joins
    const session = await Scrim.startSession();

    // beginning of session
    await session.withTransaction(async () => {
      const { scrimId, userId } = req.params;
      const { playerData } = req.body;

      const currentUser = req.user; // from auth middleware

      let isValidUser = mongoose.Types.ObjectId.isValid(userId);
      let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

      if (!isValidUser) {
        return res.status(500).json('invalid user id.');
      }

      if (!isValidScrim) {
        return res.status(500).json('invalid scrim id.');
      }

      const isUnauthorized = checkUnauthorized(currentUser, userId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      if (!playerData) {
        return res.status(500).json({
          error:
            'playerData object not provided, looks like this: playerData: { team: {name: String}, role: String }',
        });
      }

      // if req.body has no team name
      if (!playerData.team?.name) {
        return res.status(500).json({
          error:
            'team object not provided! looks like this: playerData: { {team: {name: String}} }',
        });
      }

      if (!playerData?.role) {
        return res.status(500).json({
          error:
            'role string not provided! looks like this: playerData {role: String}',
        });
      }

      let roleIsValid = isValidRole(playerData.role);

      if (!roleIsValid) {
        return res.status(500).json({
          error: 'role not valid: has to match: Top, Jungle, Mid, ADC, Support',
        });
      }

      const scrim = await Scrim.findById(scrimId);
      const user = await User.findById(userId);

      if (!scrim) {
        return res.status(500).send('Scrim not found');
      }

      if (!user) {
        return res.status(500).send('User not found');
      }

      const playerExists = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
        (player) => String(player._user) === String(user._id)
      );

      const casterExists = scrim._doc.casters.find(
        (caster) => String(caster._id) === String(user._id)
      );

      // when somebody makes an api call for /insert-player but actually meant to move the player.
      if (playerExists) {
        return res.status(500).json({
          error:
            'Player already exists in game. Did you mean to move the player? use the /move-player endpoint instead.',
        });
      }

      if (casterExists) {
        return res.status(500).json({
          error:
            'User already is a caster. you cannot be a caster and a player in the same game!.',
        });
      }

      const teamJoiningName = playerData.team.name;

      const playerInTransaction = {
        // if role is adc make it all uppercase, else just capitalize first letter of role.
        role: /adc/gi.test(playerData.role)
          ? playerData.role.toUpperCase()
          : capitalizeWord(playerData.role),
        team: playerData.team,

        _user: {
          ...user._doc,
        },
      };

      const teamJoiningArr =
        teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

      const spotsAvailable = getAvailableRoles(teamJoiningArr);

      let reqBody = {
        [teamJoiningName]: [...teamJoiningArr, playerInTransaction],
      };

      const spotTaken = scrim._doc[teamJoiningName].find(
        (player) => player.role === playerInTransaction.role
      );

      if (spotTaken) {
        onSpotTaken(scrim._doc, res, spotsAvailable, teamJoiningName);
        return;
      }

      await Scrim.findByIdAndUpdate(
        scrimId,
        reqBody,
        { new: true },
        async (error, scrim) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          if (!scrim) {
            return res.status(500).send('Scrim not found');
          }

          // check for lobby host / captain everytime player joins
          const lobbyHost = await getLobbyHost(scrim);
          scrim.lobbyHost = lobbyHost;

          await scrim.save();
          return res.status(200).json(scrim);
        }
      )
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec();
    });

    // end of session
    session.endSession();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:scrimId/remove-player/:userId
// @desc    This is how a player leaves a team in the scrim or an admin kicks a player (is used in ScrimTeamList.jsx)
// @access  Private
const removePlayerFromScrim = async (req, res) => {
  try {
    // when player leaves or gets kicked
    const { userId, scrimId } = req.params;

    const currentUser = req.user;

    let isValidUser = mongoose.Types.ObjectId.isValid(userId);
    let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

    if (!isValidUser) {
      return res.status(500).json('invalid user id.');
    }

    if (!isValidScrim) {
      return res.status(500).json('invalid scrim id.');
    }

    const isUnauthorized = checkUnauthorized(currentUser, userId); // here it's important to use, because admins can kick players

    if (isUnauthorized) {
      // if user isn't admin or isn't himself, that means he is not authorized to do this.
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const scrim = await Scrim.findById(scrimId);
    const _user = await User.findById(userId); // user leaving or being kicked

    if (!scrim) {
      return res.status(500).send('Scrim not found');
    }

    if (!_user) {
      return res.status(500).json('user not found!');
    }

    const teamLeavingName = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
      (player) => String(player._user) === String(userId)
    ).team.name;

    const teamLeavingArr =
      teamLeavingName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

    let isLobbyHost = String(scrim._doc.lobbyHost?._id) === String(_user?._id);

    const scrimData = {
      // filter array to remove player leaving
      [teamLeavingName]: teamLeavingArr.filter(
        (player) =>
          //  we didn't populate here so player._user is actually just user._id
          String(player._user) !== String(_user?._id)
      ),
      lobbyHost: isLobbyHost ? null : scrim?._doc?.lobbyHost ?? null, // if player leaving is hosting, reset the host to null
    };

    await Scrim.findByIdAndUpdate(
      scrimId,
      scrimData,
      { new: true },
      (error, scrim) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        if (!scrim) {
          return res.status(500).send('Scrim not found');
        }

        return res.status(200).json(scrim);
      }
    )
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:scrimId/move-player/:userId
// @desc    This is how a player moves positions/roles and also may or may not change teams (is used in ScrimTeamList.jsx)
// very similiar to insertPlayerInScrim, I used to have both of these in 1 function that would just know what to do, and I think maybe it was better, not sure.
// @access  Private
const movePlayerInScrim = async (req, res) => {
  try {
    // when player moves positions and/or teams
    const session = await Scrim.startSession();

    // beginning of session
    await session.withTransaction(async () => {
      const { userId, scrimId } = req.params;
      const { playerData } = req.body;

      const currentUser = req.user;

      // check for invalid/malicious ids
      let isValidUser = mongoose.Types.ObjectId.isValid(userId);
      let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

      if (!isValidUser) {
        return res.status(500).json({ error: 'invalid user id.' });
      }

      if (!isValidScrim) {
        return res.status(500).json({ error: 'invalid scrim id.' });
      }

      const isUnauthorized = checkUnauthorized(currentUser, userId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const scrim = await Scrim.findById(scrimId);
      const user = await User.findById(userId);

      if (!scrim) {
        return res.status(500).send({ error: 'Scrim not found' });
      }

      if (!user) {
        return res.status(500).send({ error: 'User not found' });
      }

      const teamJoiningName = playerData.team.name;

      const teamJoiningArr =
        teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

      const playerFound = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
        (player) => String(player._user) === String(user._id)
      );

      if (!playerData?.role) {
        return res.status(500).json({
          error:
            'role string not provided! looks like this: playerData {role: String}',
        });
      }

      let roleIsValid = isValidRole(playerData.role);

      if (!roleIsValid) {
        return res.status(500).json({
          error: 'role not valid: has to match: Top, Jungle, Mid, ADC, Support',
        });
      }

      // when somebody makes an api call for /insert-player but actually meant to move the player.
      if (!playerFound) {
        return res.status(500).json({
          error:
            'Player does not exist in game. Did you mean to join or insert the player? use the /insert-player endpoint instead.',
        });
      }

      // the player state before the transaction
      const previousPlayerState = [
        ...scrim._doc.teamOne,
        ...scrim._doc.teamTwo,
      ].find((player) => String(player._user) === String(user._id));

      let previousTeamArr =
        previousPlayerState.team.name === 'teamOne'
          ? scrim._doc.teamOne
          : scrim._doc.teamTwo;

      const isChangingTeams =
        compareArrays(previousTeamArr, teamJoiningArr) === false;

      const playerInTransaction = {
        // if it's adc, make it all uppercase, else capitalize it.
        // this is just if someone is using postman and is misspelling the casing.
        role: /adc/gi.test(playerData.role)
          ? playerData.role.toUpperCase()
          : capitalizeWord(playerData.role),
        team: playerData.team,

        _user: {
          ...user._doc,
        },
      };

      const spotTaken = scrim._doc[teamJoiningName].find(
        (player) => player.role === playerInTransaction.role
      );

      const spotsAvailable = getAvailableRoles(teamJoiningArr);

      let newBody = {};

      if (isChangingTeams) {
        // if player is changing teams

        const teamChangingToName = playerData.team.name,
          teamLeavingName = previousPlayerState.team.name;

        const teamLeavingArray =
          teamLeavingName === 'teamOne'
            ? scrim._doc.teamOne
            : scrim._doc.teamTwo;

        const teamChangingToArray =
          teamChangingToName === 'teamOne'
            ? scrim._doc.teamOne
            : scrim._doc.teamTwo;

        let [teamLeft, teamJoined] = swapPlayer(
          teamLeavingArray,
          teamChangingToArray,
          playerInTransaction
        );

        newBody = {
          // team left array state after swap player function
          [teamLeavingName]: teamLeft,
          [teamJoiningName]: [
            ...teamJoined.map((player) =>
              // ._user is just an id here because of no populate
              player._user === playerInTransaction._user._id
                ? playerInTransaction
                : player
            ),
          ],
        };
      } else {
        // if moving but not changing teams

        // remove the player from the team
        let restOfTeam = [...teamJoiningArr].filter(
          (player) => String(player._user) !== String(user._id)
        );

        // re-insert him in the same team in his new role.
        newBody = {
          [teamJoiningName]: [...restOfTeam, playerInTransaction],
        };
      }

      if (spotTaken) {
        onSpotTaken(scrim._doc, res, spotsAvailable, teamJoiningName);
        return;
      }

      await Scrim.findByIdAndUpdate(
        scrimId,
        newBody,
        { new: true },
        async (error, scrim) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          if (!scrim) {
            return res.status(500).send('Scrim not found');
          }

          // check to select lobby host / captain for the scrim everytime someone moves
          const lobbyHost = await getLobbyHost(scrim);
          scrim.lobbyHost = lobbyHost;

          await scrim.save();
          return res.status(200).json(scrim);
        }
      )
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec();
    });

    // end of session
    session.endSession();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const swapPlayersInScrim = async (req, res) => {
  try {
    const session = await Scrim.startSession();

    // beginning of session
    await session.withTransaction(async () => {
      const { playerOne, playerTwo } = req.body;

      const scrimId = req.params.scrimId;
      let scrim = await Scrim.findOne({ _id: scrimId });
      const teams = [...scrim.teamOne, ...scrim.teamTwo];

      let updatedTeamOne = [];
      let updatedTeamTwo = [];

      if (!!playerOne._user && !!playerTwo._user) {
        // if swapping between two players
        for await (player of scrim.teamOne) {
          if (String(player._user) === String(playerOne._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerTwo._user,
            };

            updatedTeamOne.push(swappedPlayer);
          } else if (String(player._user) === String(playerTwo._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerOne._user,
            };

            updatedTeamOne.push(swappedPlayer);
          } else {
            updatedTeamOne.push(player);
          }
        }

        for await (player of scrim.teamTwo) {
          if (String(player._user) === String(playerOne._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerTwo._user,
            };

            updatedTeamTwo.push(swappedPlayer);
          } else if (String(player._user) === String(playerTwo._user)) {
            const swappedPlayer = {
              ...player._doc,
              _user: playerOne._user,
            };

            updatedTeamTwo.push(swappedPlayer);
          } else {
            updatedTeamTwo.push(player);
          }
        }
      } else {
        // if only moving 1 player to empty spot (not swapping between two players)
        return await movePlayerInScrim(
          {
            ...req,
            params: {
              ...req.params,
              userId: playerOne._user,
            },
            body: {
              playerData: {
                role: playerTwo.role,
                team: { name: playerTwo.team },
              },
            },
          },
          res
        );
      }

      scrim.teamOne = updatedTeamOne;
      scrim.teamTwo = updatedTeamTwo;

      let savedScrim = await scrim.save();
      const populatedScrim = await populateOneScrim(scrimId);

      return res.status(200).json(populatedScrim);
    });

    session.endSession();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:scrimId/insert-caster/:casterId
// @desc    This is how a user can become a caster for a scrim (used in ScrimSectionHeader)
// @access  Private
const insertCasterInScrim = async (req, res) => {
  try {
    const session = await Scrim.startSession();

    await session.withTransaction(async () => {
      const { scrimId, casterId } = req.params;
      const currentUser = req.user;

      const isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);
      const isValidCaster = mongoose.Types.ObjectId.isValid(casterId);

      if (!isValidCaster) {
        return res.status(500).json('invalid user id.');
      }

      if (!isValidScrim) {
        return res.status(500).json('invalid scrim id.');
      }

      const isUnauthorized = checkUnauthorized(currentUser, casterId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const scrim = await Scrim.findById(scrimId);

      if (!scrim.isWithCasters) {
        return res.status(500).json({
          error: 'Cannot join as caster, (scrim has casters disabled)',
        });
      }

      if (scrim.casters.length >= scrim.maxCastersAllowedCount) {
        return res
          .status(500)
          .json({ error: 'Cannot join as caster, (caster spots full)' });
      }

      const casterJoining = await User.findById(casterId);

      if (!casterJoining) {
        return res.status(500).json('user not found');
      }

      const casterFound = scrim._doc.casters.find(
        (caster) => String(caster._id) === String(casterId)
      );

      if (casterFound) {
        return res
          .status(500)
          .json(
            `caster ${casterJoining.name} is already a caster for this game!.`
          );
      }

      const teams = [...scrim._doc.teamOne, ...scrim._doc.teamTwo];

      const playerFound = teams.find(
        (player) => String(player?._user) === String(casterJoining._id)
      );

      if (playerFound) {
        return res
          .status(500)
          .json(
            `player ${casterJoining.name} (team: ${playerFound.team.name}, role: ${playerFound.role}) cannot be a player and a caster at the same time!.`
          );
      }

      let bodyData = {
        casters: [...scrim._doc.casters, casterJoining],
      };

      if (scrim._doc.casters.length < 2) {
        await Scrim.findByIdAndUpdate(
          scrimId,
          bodyData,
          { new: true },
          (error, scrim) => {
            if (error) {
              return res.status(500).json({ error: error.message });
            }
            if (!scrim) {
              return res.status(500).send('Scrim not found');
            }

            return res.status(200).json(scrim);
          }
        )
          .populate('createdBy', populateUser)
          .populate('casters', populateUser)
          .populate('lobbyHost', populateUser)
          .populate(populateTeam('teamOne'))
          .populate(populateTeam('teamTwo'))
          .exec();
      } else {
        return res.status(500).json({
          error: 'Caster spots full!',
          scrim: await populateOneScrim(scrimId),
        });
      }
    });
    session.endSession();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:scrimId/remove-caster/:casterId
// @desc    This is how a user can leave the caster list if he was one for a scrim (used in ScrimSectionHeader)
// @access  Private
const removeCasterFromScrim = async (req, res) => {
  try {
    const session = await Scrim.startSession();

    await session.withTransaction(async () => {
      const { scrimId, casterId } = req.params; // scrim id
      const currentUser = req.user;

      const scrim = await Scrim.findOne({ _id: scrimId });

      const isValid = mongoose.Types.ObjectId.isValid(casterId);

      if (!isValid) {
        return res.status(500).json('invalid response.');
      }

      const isUnauthorized = checkUnauthorized(currentUser, casterId);

      if (isUnauthorized) {
        // if user isn't admin or isn't himself, that means he is not authorized to do this.
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const casterLeaving = await User.findOne({ _id: casterId });

      if (!casterLeaving) {
        return res.status(500).json(`caster not found in scrim ${scrimId}`);
      }

      const { casters } = scrim;

      // without populate the only data is the id's.
      const bodyData = {
        casters: [...casters].filter(
          (casterId) => String(casterId) !== String(casterLeaving._id)
        ),
      };

      await Scrim.findByIdAndUpdate(
        scrimId,
        bodyData,
        { new: true },
        (error, scrim) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }
          if (!scrim) {
            return res.status(500).send('Scrim not found');
          }

          return res.status(200).json(scrim);
        }
      )
        .populate('createdBy', populateUser)
        .populate('casters', populateUser)
        .populate('lobbyHost', populateUser)
        .populate(populateTeam('teamOne'))
        .populate(populateTeam('teamTwo'))
        .exec();
    });
    session.endSession();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:id/add-image
// @desc    This is how a lobbyHost or an admin can upload an image to the scrim to verify the winner (more uploading func is in UploadPostGameImage.jsx)
// @access  Private
const addImageToScrim = async (req, res) => {
  try {
    // client uplaods to s3 bucket, back-end saves endpoints
    const { id } = req.params;
    const { timestampNow = Date.now(), uploadedBy, base64 } = req.body;

    const scrim = await Scrim.findById(id);

    const isLobbyHost =
      String(scrim._doc.lobbyHost?._id) === String(req.user?._id);

    if (!base64) {
      return res.status(500).json({
        error: 'image not provided',
      });
    }

    if (!isLobbyHost) {
      if (req.user.adminKey !== KEYS.ADMIN_KEY) {
        return res.status(401).json({
          error:
            'You cannot upload an image (you are not a lobby host or an admin)',
        });
      }
    }

    const { bucket, key, location } = await uploadToBucket({
      fileName: `${scrim._id}-${timestampNow}`,
      dirName: `postGameLobbyImages/${scrim._id}`,
      base64,
    });

    let dataSending = {
      postGameImage: {
        bucket,
        key,
        location,
        uploadedBy,
      },
    };

    await Scrim.findByIdAndUpdate(
      id,
      dataSending,
      { new: true },
      (error, scrim) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        if (!scrim) {
          return res.status(500).send('Scrim not found');
        }

        return res.status(200).json(scrim);
      }
    )
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec();
  } catch (err) {
    console.log('error uploading image', err);
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:id/remove-image
// @desc    This is how only an admin can remove an image from a scrim
// @access  Private
const removeImageFromScrim = async (req, res) => {
  const { id } = req.params;

  try {
    const scrim = await Scrim.findById(id);

    if (!scrim) {
      return res.status(500).send('Scrim not found');
    }

    if (scrim.postGameImage === null) {
      return res.status(500).send('Image does not exist!');
    }

    const params = {
      Bucket: KEYS.S3_BUCKET_NAME,
      Key: scrim.postGameImage.key,
    };

    const dataSending = {
      postGameImage: null,
    };

    // delete image in S3
    await s3Bucket.deleteObject(params).promise();

    // delete it from the scrim object in the mongoose database
    await Scrim.findByIdAndUpdate(
      id,
      dataSending,
      { new: true },
      (error, scrim) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        if (!scrim) {
          return res.status(500).send('Scrim not found');
        }

        return res.status(200).json(scrim);
      }
    )
      .populate('createdBy', populateUser)
      .populate('casters', populateUser)
      .populate('lobbyHost', populateUser)
      .populate(populateTeam('teamOne'))
      .populate(populateTeam('teamTwo'))
      .exec();
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

// @route   PATCH /api/scrims/:id/set-winner
// @desc    select a winner for the scrim, only an admin or a lobby host can select a winner
// @access  Public
const setScrimWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const winnerTeamName = escape(req.body.winnerTeamName) ?? ''; // we don't need escape anymore because we use sanitize in server.js

    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let scrim = await Scrim.findOne({ _id: { $eq: id } });

    if (!scrim) return res.status(404).json({ message: 'Scrim not found!' });

    const isLobbyHost =
      String(scrim._doc.lobbyHost?._id) === String(req.user?._id);

    if (!isLobbyHost) {
      if (req.user.adminKey !== KEYS.ADMIN_KEY) {
        return res.status(401).json({
          error:
            'You cannot upload an image (you are not a lobby host or an admin)',
        });
      }
    }

    // 1: blueside, 2: redside
    if (!['teamOne', 'teamTwo'].includes(winnerTeamName)) {
      return res.status(404).json({ message: 'Invalid team name' });
    }

    scrim.teamWon = winnerTeamName;

    await scrim.save();

    let populatedScrim = await populateOneScrim(scrim._id);

    return res.status(200).send(populatedScrim);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

module.exports = {
  getAllScrims,
  getTodaysScrims,
  getScrimById,
  createScrim,
  updateScrim,
  insertPlayerInScrim,
  deleteScrim,
  removePlayerFromScrim,
  removeCasterFromScrim,
  insertCasterInScrim,
  addImageToScrim,
  movePlayerInScrim,
  removeImageFromScrim,
  setScrimWinner,
  swapPlayersInScrim,
};
