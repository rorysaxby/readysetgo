const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const squareWidth = 20;
let gameProps = {
  players: [],
  squaresX: 0,
  squaresY: 0,
  totalSquares: 0,
  screenX: 0,
  screenY: 0,
  firstAppleIndex: 0,
};

const setMaxScreenSize = () => {
  gameProps.screenX = gameProps.players[0].screenX;
  gameProps.screenY = gameProps.players[0].screenY;
  if (gameProps.players.length > 1) {
    for (let i = 1; i < gameProps.players.length; i++) {
      if (gameProps.screenX > gameProps.players[i].screenX)
        gameProps.screenX = gameProps.players[i].screenX;
      if (gameProps.screenY > gameProps.players[i].screenY)
        gameProps.screenY = gameProps.players[i].screenY;
    }
  }
};

const setTotalSquares = () => {
  gameProps.squaresX = Math.floor(gameProps.screenX / squareWidth);
  gameProps.squaresY = Math.floor(gameProps.screenY / squareWidth);
  gameProps.totalSquares = gameProps.squaresX * gameProps.squaresY;
};

const setPlayerStartPositions = () => {
  let increment = Math.floor(gameProps.squaresX / gameProps.players.length);
  let pos1 = Math.floor(increment / 2);

  for (let i = 0; i < gameProps.players.length; i++) {
    gameProps.players[i].snake = [
      pos1 + gameProps.squaresX * 2,
      pos1 + gameProps.squaresX,
      pos1,
    ];
    gameProps.players[i].direction = gameProps.squaresX;
    pos1 += increment;
  }
};

const checkIndexIsSnake = () => {
  for (let i = 0; i < gameProps.players.length; i++) {
    for (let j = 0; j < gameProps.players[i].snake.length; j++) {
      if (gameProps.players[i].snake[j] === gameProps.firstAppleIndex) {
        return true;
      }
    }
  }
  return false;
};

const setFirstAppleIndex = () => {
  do {
    gameProps.firstAppleIndex = Math.floor(
      Math.random() * gameProps.totalSquares
    );
  } while (checkIndexIsSnake());
};

const setupGameProps = () => {
  gameProps.squaresX = 0;
  gameProps.squaresY = 0;
  gameProps.totalSquares = 0;
  gameProps.screenX = 0;
  gameProps.screenY = 0;

  setMaxScreenSize();
  setTotalSquares();
  setPlayerStartPositions();
  setFirstAppleIndex();
};

app.use(express.static("client"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("playerDirection", (obj) => {
    io.emit("playerChangedDirection", obj);
  });

  socket.on("playerSetup", (playerProps) => {
    gameProps.players.push({ id: socket.id, ...playerProps });
    socket.emit("playerLoaded", socket.id);
  });

  socket.on("startGame", () => {
    setupGameProps();
    io.emit("loadGame", gameProps);
  });

  socket.on("newApple", (index) => {
    io.emit("addNewApple", index);
  });

  socket.on("disconnect", () => {
    for (let i = 0; i < gameProps.players.length; i++) {
      if (gameProps.players[i].id === socket.id) {
        console.log("player disconnected " + gameProps.players[i].name);
        gameProps.players.splice(i, 1);
      }
    }
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
