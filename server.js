const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const db = require('./db/connection');
const scrimRoutes = require('./routes/scrims');
const bodyParser = require('body-parser');
const { createScrimOnInterval } = require('./controllers/scrims');
const setHours = require('./utils/setHours');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(logger('dev'));

app.get('/', (_req, res) => {
  res.send(
    '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
  );
});

app.use('/api', scrimRoutes);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

// const d = new Date();

// setInterval(
//   () =>
//     createScrimOnInterval({
//       body: {
//         teamOne: [],
//         teamTwo: [],
//         casters: [],
//         gameStartTime: setHours(d, '3:00pm'),
//       },
//     }),
//   10000
// );
