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
} = require('../utils/scrimUtils');
const capitalizeWord = require('../utils/capitalizeWord');
const AWS = require('aws-sdk');
const KEYS = require('../config/keys');
const escape = require('escape-html');

// for post-game lobby image upload
let s3Bucket = new AWS.S3({
  Bucket: 'lol-scrimsfinder-bucket',
  accessKeyId: KEYS.S3_ACCESS_KEY_ID,
  secretAccessKey: KEYS.S3_SECRET_ACCESS_KEY,
});

const getAllScrims = async (req, res) => {
  const region = req.query?.region;
  // /api/scrims?region=NA
  if (region) {
    try {
      // might have to use populate on this, not necessary now.
      return await Scrim.find({ region: region })
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
    try {
      return await Scrim.find()
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

const getTodaysScrims = async (_req, res) => {
  try {
    const scrims = await Scrim.find();
    const todaysScrims = scrims.filter(checkIfScrimIsToday);
    return res.json(todaysScrims);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getScrimById = async (req, res) => {
  try {
    const { id } = req.params;
    let isValid = mongoose.Types.ObjectId.isValid(id);

    if (!isValid) {
      return res.status(500).json({ error: 'invalid id' });
    }

    let scrim = Scrim.findOne({ _id: id });

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

const createScrim = async (req, res) => {
  try {
    let createdByUser = await User.findOne({
      _id: { $eq: req.body.createdBy._id },
    });

    let requestBody = {
      ...req.body,
      lobbyName: getLobbyName(
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

    let savedConversation = await scrimConversation.save(); // save conv

    console.log('Scrim created: ', scrim);
    console.log('conversation created for scirm: ', savedConversation);

    return res.status(201).json(scrim);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateScrim = async (req, res) => {
  // for admins changing scrim data not average user.

  const { id } = req.params;

  let isValid = mongoose.Types.ObjectId.isValid(id);

  if (!isValid) {
    return res.status(500).json({ error: 'invalid id' });
  }

  await Scrim.findByIdAndUpdate(id, req.body, { new: true }, (error, scrim) => {
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

const insertPlayerInScrim = async (req, res) => {
  // when player joins
  const session = await Scrim.startSession();

  // beginning of session
  await session.withTransaction(async () => {
    const { scrimId, userId } = req.params;
    const { playerData } = req.body;

    let isValidUser = mongoose.Types.ObjectId.isValid(userId);
    let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

    if (!isValidUser) {
      return res.status(500).json('invalid user id.');
    }

    if (!isValidScrim) {
      return res.status(500).json('invalid scrim id.');
    }

    if (!playerData) {
      return res.status(500).json({
        error:
          'playerData object not provided, looks like this: team: {name: String}, role: String',
      });
    }

    // if req.body has no team name
    if (!playerData.team?.name) {
      return res.status(500).json({
        error:
          'team object not provided! looks like this: playerData {team: {name: String}}',
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

    const teamJoiningTitle =
      teamJoiningName === 'teamOne'
        ? 'Team 1 (Blue Side)'
        : 'Team 2 (Red Side)';

    const spotTaken = scrim._doc[teamJoiningName].find(
      (player) => player.role === playerInTransaction.role
    );

    if (spotTaken) {
      onSpotTaken(scrim._doc, res, spotsAvailable, teamJoiningTitle);
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
};

const removePlayerFromScrim = async (req, res) => {
  // when player leaves or gets kicked
  const { userId, scrimId } = req.params;

  let isValidUser = mongoose.Types.ObjectId.isValid(userId);
  let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

  if (!isValidUser) {
    return res.status(500).json('invalid user id.');
  }

  if (!isValidScrim) {
    return res.status(500).json('invalid scrim id.');
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
};

// move roles/teams
const movePlayerInScrim = async (req, res) => {
  // when player moves positions and/or teams
  const session = await Scrim.startSession();

  // beginning of session
  await session.withTransaction(async () => {
    const { scrimId, userId } = req.params;
    const { playerData } = req.body;

    let isValidUser = mongoose.Types.ObjectId.isValid(userId);
    let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);

    if (!isValidUser) {
      return res.status(500).json('invalid user id.');
    }

    if (!isValidScrim) {
      return res.status(500).json('invalid scrim id.');
    }

    const scrim = await Scrim.findById(scrimId);
    const user = await User.findById(userId);

    if (!scrim) {
      return res.status(500).send('Scrim not found');
    }

    if (!user) {
      return res.status(500).send('User not found');
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
      // if player is changing teams-

      const teamChangingToName = playerData.team.name,
        teamLeavingName = previousPlayerState.team.name;

      const teamLeavingArray =
        teamLeavingName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

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

    const teamJoiningTitle =
      teamJoiningName === 'teamOne'
        ? 'Team 1 (Blue Side)'
        : 'Team 2 (Red Side)';

    if (spotTaken) {
      onSpotTaken(scrim._doc, res, spotsAvailable, teamJoiningTitle);
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
};

const insertCasterInScrim = async (req, res) => {
  const session = await Scrim.startSession();
  const { scrimId, casterId } = req.params;

  await session.withTransaction(async () => {
    let isValidScrim = mongoose.Types.ObjectId.isValid(scrimId);
    let isValidCaster = mongoose.Types.ObjectId.isValid(casterId);

    if (!isValidCaster) {
      return res.status(500).json('invalid user id.');
    }

    if (!isValidScrim) {
      return res.status(500).json('invalid scrim id.');
    }

    const scrim = await Scrim.findById(scrimId);
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
};

const removeCasterFromScrim = async (req, res) => {
  const session = await Scrim.startSession();

  await session.withTransaction(async () => {
    const { scrimId, casterId } = req.params; // scrim id

    const scrim = await Scrim.findOne({ _id: scrimId });

    let isValid = mongoose.Types.ObjectId.isValid(casterId);

    if (!isValid) {
      return res.status(500).json('invalid response.');
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
};

const addImageToScrim = async (req, res) => {
  // client uplaods to s3 bucket, back-end saves endpoints
  const { id } = req.params;
  const { bucket, key, location, result, uploadedBy } = req.body;

  let dataSending = {
    postGameImage: {
      bucket,
      key,
      location,
      result,
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
};

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
      Bucket: 'lol-scrimsfinder-bucket',
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

async function populateOneScrim(scrimId) {
  const scrimData = await Scrim.findById(scrimId)
    .populate('createdBy', populateUser)
    .populate('casters', populateUser)
    .populate('lobbyHost', populateUser)
    .populate(populateTeam('teamOne'))
    .populate(populateTeam('teamTwo'))
    .exec();

  return scrimData;
}

async function onSpotTaken(scrim, res, spotsAvailable, teamJoiningTitle) {
  const scrimData = await populateOneScrim(scrim._id);

  return res.status(500).json({
    error: `spot taken! spots available for ${teamJoiningTitle}: ${spotsAvailable}`,
    scrim: scrimData,
  });
}

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
};
