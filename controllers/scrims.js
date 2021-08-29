const Scrim = require('../models/scrim');
const db = require('../db/connection');
const sample = require('../utils/sample');
const axios = require('axios');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const getWords = async () => {
  const URL = 'https://random-word-api.herokuapp.com/word?number=50&swear=0';
  return axios.get(URL).then(({ data }) => {
    let wordsArr = new Array(...data);

    let randomWordOne = sample(wordsArr),
      randomWordTwo = sample(wordsArr);

    return `${randomWordOne} ${randomWordTwo}`;
  });
};

const getLobbyName = async () => {
  const words = await getWords();
  return String(words);
};

const getAllScrims = async (_req, res) => {
  try {
    const scrims = await Scrim.find();
    res.json(scrims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getScrimById = async (req, res) => {
  try {
    const { id } = req.params;
    const scrim = await Scrim.findById(id);
    if (scrim) {
      return res.json(scrim);
    }
    res.status(404).json({ message: 'Scrim not found!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createScrim = async (req, res) => {
  try {
    let requestBody = {
      ...req.body,
      lobbyName: await getLobbyName(),
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
    (player) => player?.name === movingPlayer?.name
  );
  if (indexToRemove > -1) currentTeam.splice(indexToRemove, 1);
  movingTeam = [...movingTeam, movingPlayer];
  return [currentTeam, movingTeam];
};

const insertPlayerInScrim = async (req, res) => {
  const session = await Scrim.startSession();

  // beginning of session
  await session.withTransaction(async () => {
    // return Customer.create([{ name: 'Test' }], { session: session })

    const { id } = req.params;

    const { playerData } = req.body;
    const isMoving = req.body.swapData?.isMoving ?? false;
    const isChangingTeams = req.body.swapData?.isChangingTeams ?? false;

    const teamJoiningName = playerData.team.name;

    const scrim = await Scrim.findById(id);

    const teamJoiningArr =
      teamJoiningName === 'teamOne' ? scrim.teamOne : scrim.teamTwo;

    const spotTaken = scrim[teamJoiningName].find(
      (player) => player.role === playerData.role
    );

    const spotsAvailable = scrim[teamJoiningName].filter(
      (player) => !player.role
    );

    let newBody = {};

    if (isMoving) {
      if (isChangingTeams) {
        const { currentTeamName, teamChangingTo } = req.body.swapData;
        const teamLeavingName = currentTeamName;

        const currentTeamArray =
          currentTeamName === 'teamOne' ? scrim.teamOne : scrim.teamTwo;

        let [teamLeft, teamJoined] = swapPlayer(
          currentTeamArray,
          teamChangingTo,
          playerData
        );

        newBody = {
          ...scrim._doc,
          [teamLeavingName]: teamLeft,
          [teamJoiningName]: [
            ...teamJoined.map((player) =>
              player.name === playerData.name ? { ...playerData } : player
            ),
          ],
        };
      } else {
        let filtered = [...teamJoiningArr].filter(
          (player) => player.name !== playerData.name
        );

        newBody = {
          ...scrim._doc,
          [teamJoiningName]: [...filtered, { ...playerData }],
        };
      }
    } else {
      newBody = {
        ...scrim._doc,
        [teamJoiningName]: [...teamJoiningArr, playerData],
      };
    }

    if (spotTaken) {
      console.log(
        `spot taken! spots available for team ${playerData.team.name}: ${spotsAvailable}`
      );

      return res.status(500).json({
        error: `spot taken! spots available for team ${playerData.team.name}: ${spotsAvailable}`,
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

          res.status(200).json(scrim);
        }
      );
    }
  });

  // end of session
  console.log({ session });
  session.endSession();
};

const updateScrim = async (req, res) => {
  // for changing times, players or casters joining.

  const { id } = req.params;
  const scrim = await Scrim.findById(id);

  const { teamOne, teamTwo } = req.body;

  let requestBody = {
    ...req.body,
  };

  if (scrim.lobbyHost !== null) {
    requestBody.lobbyHost = scrim.lobbyHost;
  } else if (teamOne.length === 5 && teamTwo.length === 5) {
    const lobbyHost = sample([...teamOne, ...teamTwo]);
    requestBody.lobbyHost = lobbyHost;
  } else {
    requestBody.lobbyHost = null;
  }

  await Scrim.findByIdAndUpdate(
    id,
    requestBody,
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

module.exports = {
  getAllScrims,
  getScrimById,
  createScrim,
  updateScrim,
  insertPlayerInScrim,
  deleteScrim,
};
