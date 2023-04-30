# LoL-scrims-finder

live deploy: https://lol-scrims-finder.netlify.app/

# What is LoL Scrims Finder?

`LoL Scrims Finder` is a webapp made to help users host and manage custom lobbies for the video game `League of Legends` as easily as possible without the need of
messy spreadsheets. It is designed to be as plug and play as possible.
If you have an admin key, you can host a scrim/lobby. Then players just have to click on the spot/role and team they want to play in, they can change roles/teams and leave the game. Once the countdown reaches 0 for the lobby, a password and name will appear and the lobby captain has to make it. Then enjoy the game!, at the end of the game the loobby captain has to say who won (he will have the choice in the lobby page / section).

# MVP

- Be able to create and delete lobbies. ✔️
- Countdown Timer with lobby name and password. ✔️
- Complete join, leave and swap functionality for players ✔️
- Sessions with transactions in the back-end (solve the classic "move-ticket buy at same time") issue for same players clicking on spots at same time. ✔️
- Desktop media queries. ✔️

# POST-MVP

- Authentication (Maybe, trying to keep it plug and play...) ✔️
- Profile pages, notifications, friends ✔️
- Use the Riot Live Client API for summoner data.
- Discord validation
- Be able to host tournaments with classic tourney-style functionality and interface.
- Mobile media queries

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

### 9/16/2021

- Added back-end unit tests with Travis CI Pipeline

### 10/10/2021

- Added user profile page, users can now visit their own or other users profiles.
- Added the option to make scrim private on creation or edit.

### 10/16/2021

- Added the option to send each other friend requests
- added the option to search all the users.
- added notifications on friend request created

### 10/17/2021

- Added live chat functionality using socket.io:
- private chat between friends
- public scrim chat for each scrim
- replaced scrim data fetching interval with socket.io.

### 10/18/2021

- Added live socket new message notifications.

### 5/26/2022

- Admins can now swap between 2 players / 1 player and 1 empty spot using drag and drop

### 9/11/2022

- userAgent data now gets saved in the DB when logging in, that is for security purposes.

# 4/30/2023
- socket is now hosted with the server, instead of a different hierarchy
- conversations on the messenger dropdown are now sorted by unseen messages, then by online status
---

<br />
<br />

# Developer area

## Back-end

Back-end is made using `Express` & `Node.js`, with `Mongoose` to connect to the `MongoDB` database.
There are a few .env variables you need to set-up.

```
X_API_KEY=api_key_here
SECRET_OR_KEY=secret_or_key_here
ADMIN_KEY=admin_key_here

S3_ACCESS_KEY_ID=value
S3_SECRET_ACCESS_KEY=value
```

There are 2 models currently, the `User` and the `Scrim` models.
A `Scrim` is basically a game lobby that contains 2 teams, and casters, and more. Most of these objects nested inside the scrim reference the `User` model.
The `User` is authenticated using both Google (for email) and JWT (to save decoded user into local storage and to ping node-api for verification).

## Front-End

Front-end is made using the `React` library and was bootstrapped using `Create-React-App`. It uses `@material-ui/core` as the UI framework, please check the documentation for Material-UI here: https://material-ui.com/ if not familiar with it.

The folder hiearchy for the react-app looks something like this:

```
src
|__ assets/
      |__ images
        |__ ranks
          |__ diamond.png
          |__ bronze.png
        |__ roles
          |__ top.png
          |__ bottom.png

|__ store
  |__ store.dev.js
  |__ store.prod.js
  |__ index.js

|__ reducers
  |__ auth.reducer.js
  |__ scrims.reducer.js

|__ components
  |__ CountdownTimer.jsx
  |__ IntroForms.jsx
  |__ ScrimTeamList.jsx
  |__ UploadPostGameImage.jsx
  |__ shared
    |__ Navbar.jsx
    |__ NavbarDrawer.jsx
    |__ Loading.jsx
    |__ Footer.jsx
    |__ Tooltip.jsx

|__ services/
   |__ apiConfig.js
   |__ users.services.js
   |__ auth.services.js
   |__ scrims.services.js

|_ styles/
   |__ scrimSection.styles.js

|_ screens/
   |__ Intro.jsx
   |__ Scrims.jsx
   |__ ScrimDetail.jsx
   |__ ScrimCreate.jsx
   |__ ScrimEdit.jsx
   |__ Settings.jsx

|__ utils/
 |__ keycodes.js
 |__ copyToClipboard.js
```

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

- to run back-end, type in cmd: `yarn` to install latest-dependencies, then run the command: `yarn dev`.
- to run front-end, cd into `client` directory and run `yarn` to install dependencies, then run `yarn start` to run the server.
- to run socket, cd into `socket` and run `yarn` to install dependencies, then run the command: `yarn dev`

## pull requests

- Please link your issue to your pull request when making one.
- Please the request to merge into develop instead of master.
- Do not merge without being approved.
- Please squash your commits before merging.
