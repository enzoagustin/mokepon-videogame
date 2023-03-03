const express = require("express");
const cors = require("cors");

const app = express();

// CONFIGURING THE APP
app.use(express.static('public'));
app.use(cors()); // CORS: Cross-Origin Resource Sharing
app.use(express.json());

const players = [];

class Player {
  constructor(id) {
    this.id = id;
  }

  asignMokepon(mokepon) {
    this.mokepon = mokepon;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  asignAttacksSet(attacks) {
    this.attacks = attacks;
  }
}

class Mokepon {
  constructor(name) {
    this.name = name;
  }
}

app.get("/join", (req, res) => {
  const id = `${Math.random()}`;
  const player = new Player(id);

  players.push(player);

  res.setHeader("Access-Control-Allow-Origin", "*"); // *: Allows sources from all origins
  res.send(id); // Fronted calls endpoint "/join" <--> Backend sends player ID
});

app.post("/mokepon/:playerID", (req, res) => {
  const playerID = req.params.playerID || "";
  const mokeponName = req.body.mokeponName || "";
  const mokepon = new Mokepon(mokeponName);
  
  const playerIndex = players.findIndex((player) => playerID === player.id);

  if (playerIndex >= 0) {
    players[playerIndex].asignMokepon(mokepon);
  }
  
  res.end();
});

app.post("/mokepon/:playerID/position", (req, res) => {
  const playerID = req.params.playerID || "";
  const x = req.body.x || 0;
  const y = req.body.y || 0;

  const playerIndex = players.findIndex((player) => playerID === player.id);

  if (playerIndex >= 0) {
    players[playerIndex].updatePosition(x, y);
  }



  const enemies = players.filter((player) => playerID !== player.id);

  res.send({ enemies });
});

app.post("/mokepon/:playerID/attacks", (req, res) => {
  const playerID = req.params.playerID || "";
  const attacks = req.body.attacks || [];
  
  const playerIndex = players.findIndex((player) => playerID === player.id);

  if (playerIndex >= 0) {
    players[playerIndex].asignAttacksSet(attacks);
  }

  res.end();
});

app.get("/mokepon/:playerID/attacks", (req, res) => {
  const playerID = req.params.playerID || "";
  const player = players.find((player) => player.id === playerID);

  res.send({ attacks: player.attacks || [] });
});

app.listen(8080, () => {
  console.log("Server running at port 8080");
});
