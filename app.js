const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const databasePath = path.join(__dirname, "cricketTeam.db");
const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log("error juszt exit");
    process.exit(1);
  }
};
initializeDbAndServer();

//arrow function to convert from one case to another(camel case)

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//writing API for different scenarios

//getting all the players

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
select * from cricket_team;`;
  const playerArray = await database.all(getPlayerQuery);
  response.send(
    playerArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//inserting a new player into table with the help of post api

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
    insert into cricket_team(player_name,jersey_number,role)
    values("${playerName}",${jerseyNumber},"${role}");`;
  const player = await database.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//obtaining information of the player based on the player Id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    select * from cricket_team where player_id=${playerId};`;
  const player = await database.get(getPlayer);
  response.send(convertDbObjectToResponseObject(player));
});

//updating the details of the player based on the player Id using put method

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatedPlayerQuery = `
    update cricket_team
    set player_name="${playerName}",
    jersey_number=${jerseyNumber},
    role="${role}";`;
  const UpdatedPlayer = await database.run(updatedPlayerQuery);
  response.send("Player Details Updated");
});

//delete the user based on the id

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteUserQuery = `
    delete from cricket_team where player_id=${playerId};`;
  await database.run(deleteUserQuery);
  response.send("Player Removed");
});

module.exports = app;
