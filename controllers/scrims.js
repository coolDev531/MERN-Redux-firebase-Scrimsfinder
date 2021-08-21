const Scrim = require('../models/scrim');
const db = require('../db/connection');
const sample = require('../utils/sample');

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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
    res.status(404).json({ message: 'Lobby not found!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createScrim = async (req, res) => {
  try {
    const scrim = new Scrim(req.body);
    await scrim.save();
    res.status(201).json(scrim);
    console.log('lobby created: ', scrim);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateScrim = async (req, res) => {
  // for changing times, players or casters joining.

  const { id } = req.params;
  const { teamOne, teamTwo } = req.body;

  let requestBody = {
    ...req.body,
  };

  if (teamOne.length === 5 && teamTwo.length === 5) {
    requestBody.lobbyHost = sample([...teamOne, ...teamTwo]);
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
        return res.status(404).json(scrim);
      }

      if (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5) {
        scrim.lobbyCaptain === 'testing123';
        scrim.save();
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
    throw new Error('Transportation type not found');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllScrims,
  getScrimById,
  createScrim,
  updateScrim,
  deleteScrim,
};
