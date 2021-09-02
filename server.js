const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const db = require('./db/connection');
const bodyParser = require('body-parser');
const apiKey = require('./utils/apiKey');
const scrimRoutes = require('./routes/scrims');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(logger('dev'));

// this route doesn't need an api key because app.use(apikey) is called later
app.get('/', (_req, res) => {
  res.send(
    '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
  );
});

// require an api key for these routes
app.use(apiKey);
app.use('/api', scrimRoutes);
app.use('/api', userRoutes);

// another way to require api key for a specific route only.
// router.get('/scrims', apiKey, controllers.getAllScrims);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});
