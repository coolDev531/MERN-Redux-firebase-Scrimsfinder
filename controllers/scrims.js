const mongoose = require('mongoose');
const db = require('../db/connection');
// models
const Scrim = require('../models/scrim');
const User = require('../models/user');

// utils
const sample = require('../utils/sample');
const generatePassword = require('../utils/generatePassword');
const {
  checkIfScrimIsToday,
  checkIfScrimIsInACertainDate,
} = require('../utils/scrimUtils');
const capitalizeWord = require('../utils/capitalizeWord');
const AWS = require('aws-sdk');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

let s3bucket = new AWS.S3({
  Bucket: 'lol-scrimsfinder-bucket',
  accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY,
});

/**
 * @method compareArrays
    compare if the previous state of team that the player is joining is identical.
    If it is, he isn't swapping teams (will return true), if it isn't identical, he is swapping teams (will return false)
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {Boolean}
 */
const compareArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i]._id !== arr2[i]._id) return false;
  }

  // If all elements were same.
  return true;
};

const getLobbyName = async (region, createdScrimStartTime) => {
  const scrims = await Scrim.find();
  const scrimsInRegion = scrims.filter((scrim) => scrim.region === region);

  // get scrims that are made in THAT specific day.
  const scrimsThatDay = scrimsInRegion.filter((scrim) =>
    checkIfScrimIsInACertainDate(scrim, createdScrimStartTime)
  );

  return `Scrim ${scrimsThatDay.length + 1} Custom Game (${region})`;
};

const populateTeam = (teamName) => {
  // nested populate
  return {
    path: teamName,
    populate: {
      path: '_user',
      model: 'User',
      select: '-adminKey -email -uid -createdAt -updatedAt -__v', // exclude adminKey,uid and email from showing
    },
  };
};

const populateUser = ['name', 'discord'];

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
    let createdByUser = await User.findOne({ _id: req.body.createdBy._id });

    let requestBody = {
      ...req.body,
      lobbyName: await getLobbyName(
        req.body?.region ?? 'NA',
        req.body?.gameStartTime
      ),
      lobbyPassword: await generatePassword(),
      createdBy: createdByUser,
    };

    const scrim = new Scrim(requestBody);

    await scrim.save();
    console.log('Scrim created: ', scrim);
    return res.status(201).json(scrim);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const swapPlayer = (currentTeam, movingTeam, movingPlayer) => {
  const indexToRemove = currentTeam.findIndex(
    (player) => String(player?._user) === String(movingPlayer?._user._id)
  );
  if (indexToRemove > -1) currentTeam.splice(indexToRemove, 1);
  movingTeam = [...movingTeam, movingPlayer];
  return [currentTeam, movingTeam];
};

const getAvailableRoles = (team) => {
  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const takenRoles = new Set();

  for (const role of roles) {
    for (const player of team) {
      if (role === player.role) {
        takenRoles.add(role);
      }
    }
  }

  return roles.filter((r) => !takenRoles.has(r)).join(', ');
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
  });
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
      return res.status(200).send(`Scrim with id: ${id} deleted`);
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
    const { id } = req.params;

    const { playerData } = req.body;

    if (!playerData) {
      return res.status(500).json({ error: 'playerData object not provided' });
    }

    const teamJoiningName = playerData.team.name;

    const scrim = await Scrim.findById(id);

    const user = await User.findById(playerData._id);

    const playerExists = [...scrim._doc.teamOne, ...scrim._doc.teamTwo].find(
      (player) => String(player._user) === String(user._id)
    );

    // when somebody makes an api call for /insert-player but actually meant to move the player.
    if (playerExists) {
      return res.status(500).json({
        error: `Player already exists in game. Did you mean to move the player? use the /move-player endpoint instead.`,
      });
    }

    const playerInTransaction = {
      role: capitalizeWord(playerData.role),
      team: playerData.team,

      _user: {
        ...user._doc,
      },
    };

    const teamJoiningArr =
      teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

    const spotsAvailable = getAvailableRoles(teamJoiningArr);

    let newBody = {};

    // if  just joining
    newBody = {
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
      return res.status(500).json({
        error: `spot taken! spots available for ${teamJoiningTitle}: ${spotsAvailable}`,
      });
    }

    await Scrim.findByIdAndUpdate(
      id,
      newBody,
      { new: true },
      async (error, scrim) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        if (!scrim) {
          return res.status(500).send('Scrim not found');
        }

        const lobbyHost = scrim.lobbyHost ?? null;

        // select lobby host
        if (lobbyHost !== null) {
          scrim.lobbyHost = lobbyHost;
          // if lobby is full after user is joining
        } else if (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5) {
          const result = sample([...scrim.teamOne, ...scrim.teamTwo]);
          const userResult = await User.findById(result._user);
          scrim.lobbyHost = userResult;
        } else {
          scrim.lobbyHost = null;
        }

        scrim.save();
        return res.status(200).json(scrim);
      }
    );
  });

  // end of session
  session.endSession();
};

const removePlayerFromScrim = async (req, res) => {
  // when player leaves
  const { playerData } = req.body;
  const { id } = req.params;

  const teamLeavingName = playerData?.teamLeavingName;

  const scrim = await Scrim.findById(id);
  const _user = await User.findById(playerData._id); // user leaving or being kicked

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
    id,
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
  );
};

// move roles/teams
const movePlayerInScrim = async (req, res) => {
  // when player moves positions and/or teams
  const session = await Scrim.startSession();

  // beginning of session
  await session.withTransaction(async () => {
    const { id } = req.params;

    const { playerData } = req.body;

    const scrim = await Scrim.findById(id);
    const user = await User.findById(playerData._id);

    const teamJoiningName = playerData.team.name;

    const teamJoiningArr =
      teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

    const previousPlayerState = [
      ...scrim._doc.teamOne,
      ...scrim._doc.teamTwo,
    ].find((p) => String(p._user) === String(user._id));

    let previousTeamArr =
      previousPlayerState.team.name === 'teamOne'
        ? scrim._doc.teamOne
        : scrim._doc.teamTwo;

    const isChangingTeams =
      compareArrays(previousTeamArr, teamJoiningArr) === false;

    const playerInTransaction = {
      role: capitalizeWord(playerData.role),
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
      const { currentTeamName, teamChangingToName } = {
        currentTeamName: previousPlayerState.team.name,
        teamChangingToName: playerData.team.name,
      };

      const teamLeavingName = currentTeamName;

      const currentTeamArray =
        currentTeamName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

      const teamChangingToArray =
        teamChangingToName === 'teamOne'
          ? scrim._doc.teamOne
          : scrim._doc.teamTwo;

      let [teamLeft, teamJoined] = swapPlayer(
        currentTeamArray,
        teamChangingToArray,
        playerInTransaction
      );

      newBody = {
        [teamLeavingName]: teamLeft,
        [teamJoiningName]: [
          ...teamJoined.map((player) =>
            // ._user is just an id here because of no populate
            player._user === playerInTransaction._user._id
              ? { ...playerInTransaction }
              : player
          ),
        ],
      };
    } else {
      // if moving but not changing teams
      // remove the player from the team
      let filtered = [...teamJoiningArr].filter(
        (player) => String(player._user) !== String(user._id)
      );

      // re-insert him in his new role.
      newBody = {
        [teamJoiningName]: [...filtered, playerInTransaction],
      };
    }

    const teamJoiningTitle =
      teamJoiningName === 'teamOne'
        ? 'Team 1 (Blue Side)'
        : 'Team 2 (Red Side)';

    if (spotTaken) {
      return res.status(500).json({
        error: `spot taken! spots available for ${teamJoiningTitle}: ${spotsAvailable}`,
      });
    }

    await Scrim.findByIdAndUpdate(
      id,
      newBody,
      { new: true },
      async (error, scrim) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        if (!scrim) {
          return res.status(500).send('Scrim not found');
        }

        const lobbyHost = scrim.lobbyHost ?? null;

        // select lobby host
        if (lobbyHost !== null) {
          scrim.lobbyHost = lobbyHost;
          // if lobby is full after user is joining
        } else if (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5) {
          const result = sample([...scrim.teamOne, ...scrim.teamTwo]);
          const userResult = await User.findById(result._user);
          scrim.lobbyHost = userResult;
        } else {
          scrim.lobbyHost = null;
        }

        scrim.save();
        return res.status(200).json(scrim);
      }
    );
  });

  // end of session
  session.endSession();
};

const insertCasterInScrim = async (req, res) => {
  const session = await Scrim.startSession();
  const { id } = req.params;
  const { casterData } = req.body;

  await session.withTransaction(async () => {
    const scrim = await Scrim.findById(id);

    const casterId = casterData._id;

    const casterJoining = await User.findOne({ _id: casterId });

    let isValid = mongoose.Types.ObjectId.isValid(casterJoining._id);

    if (!isValid) {
      return res(500).json('invalid response.');
    }

    let bodyData = {
      casters: [...scrim._doc.casters, casterJoining],
    };

    if (scrim._doc.casters.length < 2) {
      await Scrim.findByIdAndUpdate(
        id,
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
      );
    } else {
      return res.status(500).json({
        error: 'Caster spots full!',
      });
    }
  });
  session.endSession();
};

const removeCasterFromScrim = async (req, res) => {
  const session = await Scrim.startSession();
  const { id } = req.params; // scrim id
  const { casterData } = req.body;

  await session.withTransaction(async () => {
    const scrim = await Scrim.findOne({ _id: id });

    const casterId = casterData._id;

    const casterLeaving = await User.findOne({ _id: casterId });

    let isValid = mongoose.Types.ObjectId.isValid(casterLeaving._id);

    if (!isValid) {
      return res(500).json('invalid response.');
    }

    const { casters } = scrim;

    // without populate the only data is the id's.
    const bodyData = {
      casters: [...casters].filter(
        (casterId) => String(casterId) !== String(casterLeaving._id)
      ),
    };

    await Scrim.findByIdAndUpdate(
      id,
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
    );
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
  );
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

    s3bucket.deleteObject(params, function (err, data) {
      if (err) return res.status(500).json({ error: err });
      // an error occurred
      else return data; // successful response
    });

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
    );
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
};
