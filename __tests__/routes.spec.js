// utils
const createServer = require('../server.js');
const faker = require('faker');
const sample = require('../utils/sample');
const mongooseConnect = require('../db/connection');
const generatePassword = require('../utils/generatePassword');
const KEYS = require('../config/keys');
const databaseName = 'scrimsTestDatabase';
const { uuid: makeUuid } = require('uuidv4');

// models
const User = require('../models/user.model');
const Scrim = require('../models/scrim.model');

let request = require('supertest');
let headers = { 'x-api-key': KEYS.API_KEY };

let connection;
beforeAll(async () => {
  //  seed users and scrims beforeAll
  const TEST_ENV_MONGODB_URI = `mongodb://127.0.0.1/${databaseName}`;
  connection = mongooseConnect.dbConnect(TEST_ENV_MONGODB_URI);

  connection.on(`error`, console.error.bind(console, `connection error:`));

  connection.once(`open`, () => {
    // we`re connected!
    console.log(
      `routes.spec.js: MongoDB connected on "  ${TEST_ENV_MONGODB_URI}`
    );
  });

  const ranks = [
    'Diamond 2',
    'Platinum 1',
    'Platinum 4',
    'Grandmaster',
    'Challenger',
    'Gold 3',
    'Silver 3',
    'Bronze 1',
    'Gold 2',
    'Master',
  ];

  let users = new Array(10).fill().map((_user, idx) => {
    let name = faker.name.firstName();

    return {
      name: name,
      rank: sample(ranks),
      discord: `${name}#1${idx}3`,
      email: faker.internet.email(name),
      region: 'NA',
      uid: makeUuid(),
    };
  });

  let createdUsers = await User.insertMany(users);

  console.log(
    `Created ${createdUsers.length} new users (testing environment)!`
  );

  const firstFivePlayers = [...createdUsers].slice(0, 5);
  const secondFivePlayers = [...createdUsers].slice(-5);

  const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const teamOne = firstFivePlayers.map((user, idx) => ({
    role: roles[idx],
    team: { name: 'teamOne' },
    _user: {
      ...user,
    },
  }));

  const teamTwo = secondFivePlayers.map((user, idx) => ({
    role: roles[idx],
    team: { name: 'teamTwo' },
    _user: {
      ...user,
    },
  }));

  let scrims = [
    {
      createdBy: createdUsers[0],
      teamOne,
      teamTwo,
      lobbyHost: createdUsers[2],
      lobbyPassword: generatePassword(),
      gameStartTime: Date.now(),
      title: `${createdUsers[0].name}'s scrim`,
      lobbyName: 'Scrim 1 Custom Game (NA)',
      lobbyHost: createdUsers[0],
      teamWon: 'teamTwo',
    },
  ];

  let createdScrims = await Scrim.insertMany(scrims);

  console.log(
    `Created ${createdScrims.length} new scrims (testing environment)!`
  );
});

let user, scrim;

const app = createServer();

describe('GET /', () => {
  it('should show welcome with instructions on how to use api', async (done) => {
    // headers aren't required on this path
    const response = await request(app).get('/').expect(200);

    expect(response.text).toBe(
      '<h1>LOL BOOTCAMP SCRIMS FINDER</h1> <h2>How to use: go to /api/scrims to find all scrims.</h2>'
    );

    done();
  });
});

// get all scrims
describe('/api/scrims', () => {
  it('should show all scrims', async (done) => {
    const response = await request(app)
      .get('/api/scrims')
      .set(headers)
      .expect(200);

    scrim = response.body[0];
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0]).toHaveProperty('teamOne');
    expect(response.body[0]).toHaveProperty('teamTwo');
    expect(response.body[0]).toHaveProperty('gameStartTime');
    expect(response.body[0]).toHaveProperty('lobbyHost');
    expect(response.body[0]).toHaveProperty('lobbyName');
    expect(response.body[0]).toHaveProperty('lobbyPassword');
    expect(response.body[0]).toHaveProperty('teamWon');

    const teamOne = response.body[0].teamOne;
    expect(teamOne[0]).toHaveProperty('_user');
    expect(teamOne[0]).toHaveProperty('role');
    expect(teamOne[0]).toHaveProperty('team');

    const teamTwo = response.body[0].teamOne;
    expect(teamTwo[0]).toHaveProperty('_user');
    expect(teamTwo[0]).toHaveProperty('role');
    expect(teamTwo[0]).toHaveProperty('team');

    expect(response.body[0]).not.toHaveProperty('randomProperty');

    done();
  });
});

// get one scrim by id
describe('/api/scrims/:id', () => {
  it('should show one scrim by id', async (done) => {
    const response = await request(app)
      .get(`/api/scrims/${scrim._id}`)
      .set(headers)
      .expect(200);

    const oneScrim = response.body;

    expect(oneScrim).toHaveProperty('_id');
    expect(oneScrim).toHaveProperty('teamOne');
    expect(oneScrim).toHaveProperty('teamTwo');
    expect(oneScrim).toHaveProperty('gameStartTime');
    expect(oneScrim).toHaveProperty('lobbyHost');
    expect(oneScrim).toHaveProperty('lobbyName');
    expect(oneScrim).toHaveProperty('lobbyPassword');
    expect(oneScrim).toHaveProperty('teamWon');

    const teamOne = oneScrim.teamOne;
    expect(teamOne[0]).toHaveProperty('_user');
    expect(teamOne[0]).toHaveProperty('role');
    expect(teamOne[0]).toHaveProperty('team');

    const teamTwo = oneScrim.teamOne;
    expect(teamTwo[0]).toHaveProperty('_user');
    expect(teamTwo[0]).toHaveProperty('role');
    expect(teamTwo[0]).toHaveProperty('team');

    expect(oneScrim).not.toHaveProperty('randomProperty');

    done();
  });
});

// get all users
describe('/api/users', () => {
  it('should show all users', async (done) => {
    const response = await request(app)
      .get('/api/users')
      .set(headers)
      .expect(200);

    user = response.body[0];
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0]).toHaveProperty('discord');
    expect(response.body[0]).toHaveProperty('rank');
    expect(response.body[0]).toHaveProperty('name');

    expect(response.body[0]).not.toHaveProperty('randomProperty');

    done();
  });
});

afterAll(async () => {
  // clear database and close after tests are over
  console.log('dropping test database');
  await connection.dropDatabase();
  await connection.close();
});
