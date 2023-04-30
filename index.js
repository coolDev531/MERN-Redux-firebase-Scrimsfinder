const createServer = require('./server');
const mongooseConnect = require('./db/connection');
const { MONGODB_URI } = require('./utils/constants');
const createSocket = require('./socket');

const PORT = process.env.PORT || 3000;

const app = createServer();

const server = app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`);
});

createSocket(server);

const connection = mongooseConnect.dbConnect(MONGODB_URI);

connection.on(`error`, console.error.bind(console, `connection error:`));

connection.once(`open`, () => {
  // we`re connected!
  console.log(`index.js: MongoDB connected on "  ${MONGODB_URI}`);
});
