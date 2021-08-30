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
