const Scrim = require('../models/scrim');
const db = require('../db/connection');
const sample = require('../utils/sample');
const toIsoString = require('../utils/toIsoString');
const User = require('../models/user');
const mongoose = require('mongoose');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const checkIfScrimIsToday = (scrim) => {
  let now = Date.now();
  let nowDate = new Date(now).setHours(0, 0, 0, 0);
  let today = toIsoString(nowDate);

  let scrimGameDay = new Date(scrim.gameStartTime).setHours(0, 0, 0, 0);
  let scrimIso = toIsoString(scrimGameDay);

  return today === scrimIso;
};

const checkIfScrimIsInACertainDate = (scrim, date) => {
  let certainDate = new Date(date).setHours(0, 0, 0, 0);
  certainDateIso = toIsoString(certainDate);

  let scrimGameDay = new Date(scrim.gameStartTime).setHours(0, 0, 0, 0);
  let scrimIso = toIsoString(scrimGameDay);

  return certainDateIso === scrimIso;
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

const getAllScrims = async (req, res) => {
  const region = req.query?.region;
  // /api/scrims?region=NA
  if (region) {
    try {
      const scrims = await Scrim.find({ region: region });
      res.json(scrims);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // if no region, just get all scrims.
    try {
      const scrims = await Scrim.find()
        .populate('users')
        .then((u) => u);
      res.json(scrims);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

const getTodaysScrims = async (_req, res) => {
  try {
    const scrims = await Scrim.find();
    const todaysScrims = scrims.filter(checkIfScrimIsToday);
    res.json(todaysScrims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getScrimById = async (req, res) => {
  try {
    const { id } = req.params;
    let scrim = Scrim.findOne({ _id: id });

    if (!scrim) return res.status(404).json({ message: 'Scrim not found!' });

    // using populate to show more than _id when using Ref on the model.
    return scrim
      .populate('casters', ['name', 'discord', 'uid'])
      .exec((err, newScrim) => {
        if (err) {
          console.log(err);
          res.status(400).end();
        }
        return res.json(newScrim);
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createScrim = async (req, res) => {
  try {
    let requestBody = {
      ...req.body,
      lobbyName: await getLobbyName(
        req.body?.region ?? 'NA',
        req.body?.gameStartTime
      ),
    };

    const scrim = new Scrim(requestBody);

    await scrim.save();
    res.status(201).json(scrim);
    console.log('Scrim created: ', scrim);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const swapPlayer = (currentTeam, movingTeam, movingPlayer) => {
  const indexToRemove = currentTeam.findIndex(
    (player) => player?.uid === movingPlayer?.uid
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

const insertPlayerInScrim = async (req, res) => {
  const session = await Scrim.startSession();

  // beginning of session
  await session.withTransaction(async () => {
    const { id } = req.params;

    const { playerData } = req.body;

    const isMoving = req.body.swapData?.isMoving ?? false;
    const isChangingTeams = req.body.swapData?.isChangingTeams ?? false;

    const teamJoiningName = playerData.team.name;

    const scrim = await Scrim.findById(id);

    const teamJoiningArr =
      teamJoiningName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

    const spotTaken = scrim._doc[teamJoiningName].find(
      (player) => player.role === playerData.role
    );

    const spotsAvailable = getAvailableRoles(teamJoiningArr);

    let newBody = {};

    if (isMoving) {
      if (isChangingTeams) {
        const { currentTeamName, teamChangingToName } = req.body.swapData;
        const teamLeavingName = currentTeamName;

        const currentTeamArray =
          currentTeamName === 'teamOne'
            ? scrim._doc.teamOne
            : scrim._doc.teamTwo;

        const teamChangingToArray =
          teamChangingToName === 'teamOne'
            ? scrim._doc.teamOne
            : scrim._doc.teamTwo;

        let [teamLeft, teamJoined] = swapPlayer(
          currentTeamArray,
          teamChangingToArray,
          playerData
        );

        newBody = {
          [teamLeavingName]: teamLeft,
          [teamJoiningName]: [
            ...teamJoined.map((player) =>
              player.uid === playerData.uid ? { ...playerData } : player
            ),
          ],
        };
      } else {
        let filtered = [...teamJoiningArr].filter(
          (player) => player.uid !== playerData.uid
        );

        newBody = {
          [teamJoiningName]: [...filtered, { ...playerData }],
        };
      }
    } else {
      newBody = {
        [teamJoiningName]: [...teamJoiningArr, playerData],
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
    } else {
      await Scrim.findByIdAndUpdate(
        id,
        newBody,
        { new: true },
        (error, scrim) => {
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          if (!scrim) {
            return res.status(500).send('Scrim not found');
          }

          const lobbyHost = scrim.lobbyHost ?? null;

          if (lobbyHost !== null) {
            scrim.lobbyHost = lobbyHost;
          } else if (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5) {
            const result = sample([...scrim.teamOne, ...scrim.teamTwo]);
            scrim.lobbyHost = result;
          } else {
            scrim.lobbyHost = null;
          }

          scrim.save();
          res.status(200).json(scrim);
        }
      );
    }
  });

  // end of session
  session.endSession();
};

const updateScrim = async (req, res) => {
  // for admins changing scrim data not average user.
  const { id } = req.params;

  await Scrim.findByIdAndUpdate(id, req.body, { new: true }, (error, scrim) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!scrim) {
      return res.status(500).send('Scrim not found');
    }

    res.status(200).json(scrim);
  });
};

const deleteScrim = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Scrim.findByIdAndDelete(id);
    if (deleted) {
      return res.status(200).send(`Scrim with id: ${id} deleted`);
    }
    throw new Error('Scrim not found');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removePlayerFromScrim = async (req, res) => {
  const { playerData } = req.body;
  const { id } = req.params;

  const teamLeavingName = playerData?.teamLeavingName;

  const scrim = await Scrim.findById(id);

  const teamLeavingArr =
    teamLeavingName === 'teamOne' ? scrim._doc.teamOne : scrim._doc.teamTwo;

  const scrimData = {
    [teamLeavingName]: teamLeavingArr.filter(
      (player) => player.uid !== playerData.uid
    ),
    lobbyHost: playerData.isLobbyHost ? null : scrim._doc.lobbyHost,
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

      res.status(200).json(scrim);
    }
  );
};

const insertCasterInScrim = async (req, res) => {
  const session = await Scrim.startSession();
  const { id } = req.params;
  const { casterData } = req.body;

  await session.withTransaction(async () => {
    const scrim = await Scrim.findById(id);

    const casterId = casterData.uid;

    const casterJoining = await User.findOne({ uid: casterId });

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

          res.status(200).json(scrim);
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
  const { id } = req.params;
  const { casterData } = req.body;

  await session.withTransaction(async () => {
    const scrim = await Scrim.findById(id);

    const bodyData = {
      casters: scrim._doc.casters.filter(
        (caster) => caster.uid !== casterData.uid
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

        res.status(200).json(scrim);
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

      res.status(200).json(scrim);
    }
  );
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
};
