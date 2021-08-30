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
- Authentication (Maybe, trying to keep it plug and play...)
- Use the Riot Live Client API for summoner data.
- Be able to host tournaments with classic tourney-style functionality and interface.
- Convert the webapp to an Electron GUI app.


# Some debates
- Not sure if everyone should be able to make lobbies or only people with admin keys (trying to keep scrims amount low for the free-plan database)
- Not sure if we should have full authentication with passwords and usernames (pros: removal of impersonation, reliable. cons: less plug and play, people more likely to get discouraged of using it)


-----------

# Dev area

 ## Back-end
  Back-end is made using `Express` & `Node.js`, with `Mongoose` to connect to the `MongoDB` database.
  
 ## Front-End
  Front-end is made using the `React` library and was bootstrapped using `Create-React-App`. It uses `@material-ui/core` as the UI framework.
  
 ## running it on your machine
 - to run back-end, type in cmd: `yarn` to install latest-dependencies, then run the command: `npm run dev`.
 - to run front-end, cd into `client` directory and run `yarn` to install dependencies, then run `yarn start` to run the server.
