# LoL-scrims-finder

live deploy: https://lol-scrims-finder.netlify.app/

# What is LoL Scrims Finder?

`LoL Scrims Finder` is a webapp made to help users host and manage custom lobbies for the video game `League of Legends` as easily as possible without the need of
messy spreadsheets. It is designed to be as plug and play as possible.
If you have an admin key, you can host a scrim/lobby. Then players just have to click on the spot/role and team they want to play in, they can change roles/teams and leave the game. Once the countdown reaches 0 for the lobby, a password and name will appear and the lobby captain has to make it. Then enjoy the game!, at the end of the game the loobby captain has to say who won (he will have the choice in the lobby page / section).

# MVP

- Plug and Play.
- Be able to create and delete lobbies.
- Countdown Timer with lobby name and password.
- Complete join, leave and swap functionality for players
- Sessions with transactions in the back-end (solve the classic "move-ticket buy at same time") issue for same players clicking on spots at same time.
- Desktop queries.

# POST-MVP

- Authentication (Maybe, trying to keep it plug and play...) ✔️
- Use the Riot Live Client API for summoner data.
- Be able to host tournaments with classic tourney-style functionality and interface.
- Mobile queries

<br />

# changelog (major)

### 8/29/2021

- first app live deploy

### 8/30/2021

- tons of bug fixes that I can't even type in.

### 8/31/2021

- admins can now choose a custom lobby title when creating a scrim
- Admins can now kick players from lobbies.
- all api routes require an x-api-key (safer app).
- lobby names generated for scrims are now the amount of scrims created that day and in that region plus the one created. (previous word api brought weird names sometimes)

### 9/1/2021

- admins can now edit scrims.

### 9/2/2021

- lobby hosts/captains and admins can now upload a post game image to verify winner.
- accounts are now authenticated using google and stored in database.
- users can edit their account information as long as it isn't taken

### 9/4/2021
- Database is now fully relational (teams and casters of scrim reference the user, etc).
- Added JWT & bcrypt ontop of google authentication with firebase.

### 9/5/2021
- Created a navbar drawer/burger-menu
- Moved the date select filter and region filter for scrims into the drawer
- Moved the show/hide current, previous, upcoming scrims toggles into the drawer.

---

<br />

# Developer area

## Back-end

Back-end is made using `Express` & `Node.js`, with `Mongoose` to connect to the `MongoDB` database.
There are a few .env variables you need to set-up.

```
X_API_KEY=api_key_here
SECRET_OR_KEY=secret_or_key_here
ADMIN_KEY=admin_key_here
```

## Front-End

Front-end is made using the `React` library and was bootstrapped using `Create-React-App`. It uses `@material-ui/core` as the UI framework, please check the documentation for Material-UI here: https://material-ui.com/ if not familiar with it.

There are some .env variables you need to set up before getting started:
```
REACT_APP_ADMIN_KEY

# Node API
REACT_APP_API_URL
REACT_APP_API_KEY

# S3
REACT_APP_S3_ACCESS_KEY_ID
REACT_APP_S3_SECRET_ACCESS_KEY

# Firebase
REACT_APP_FIREBASE_MEASUREMENT_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_API_KEY
```


## running it on your machine
- to run back-end, type in cmd: `yarn` to install latest-dependencies, then run the command: `npm run dev`.
- to run front-end, cd into `client` directory and run `yarn` to install dependencies, then run `yarn start` to run the server.


## pull requests
Please link your issue to your pull request when making one. Please the request to merge into develop instead of master.
Do not merge without being approved.
Please squash your commits before merging.

