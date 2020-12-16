(() => {
  const socket = io();

  const views = {
    player: document.querySelector(".player-view"),
    game: document.querySelector(".game-view"),
  };
  const loadPlayerBtn = document.querySelector("#loadPlayer");
  const playerNameInput = document.querySelector("#playerName");
  const playerNameDisplay = document.querySelector(".player-name");
  const grid = document.querySelector(".grid");
  const startBtn = document.querySelector(".start");
  const scoreDisplay = document.querySelector(".score-display");
  const controlsDisplay = document.querySelector(".controls-display");

  let playerId = "";
  let gameLoopTime;
  let speed;
  let gameProps = {};
  let gameLoop;

  const createBoard = () => {
    grid.innerHTML = "";
    grid.style.width = gameProps.screenX + "px";
    grid.style.height = gameProps.screenY + "px";
    for (let i = 0; i < gameProps.totalSquares; i++) {
      let div = document.createElement("div");
      grid.appendChild(div);
    }
  };

  const creatScoreboard = () => {
    scoreDisplay.innerHTML = "";
    for (let i = 0; i < gameProps.players.length; i++) {
      let div = document.createElement("div");
      div.className = "player-score";
      div.innerHTML =
        '<div class="player"><div class="score-square ' +
        gameProps.players[i].color +
        '"></div>' +
        gameProps.players[i].name +
        "</div>" +
        "<div id=" +
        gameProps.players[i].id +
        ' class="score">0</div>';
      scoreDisplay.appendChild(div);
    }
  };

  const updatePlayerScore = (player) => {
    let score = document.getElementById(player.id);
    score.innerText = player.score;
  };

  const control = (e) => {
    switch (e.key) {
      case "ArrowRight":
        direction = 1;
        break;
      case "ArrowLeft":
        direction = -1;
        break;
      case "ArrowUp":
        direction = -gameProps.squaresX;
        break;
      case "ArrowDown":
        direction = +gameProps.squaresX;
        break;
    }
    socket.emit("playerDirection", { playerId, direction });
  };

  const renderSnakes = () => {
    let squares = document.querySelectorAll(".grid div");
    gameProps.players.forEach((player) => {
      player.snake.forEach((pos) => {
        squares[pos].classList.add("snake", player.id, player.color);
      });
    });
  };

  const checkCollisions = (player, squares) => {
    return (
      (player.snake[0] + gameProps.squaresX >= gameProps.totalSquares &&
        player.direction === gameProps.squaresX) ||
      (player.snake[0] % gameProps.squaresX === gameProps.squaresX - 1 &&
        player.direction === 1) ||
      (player.snake[0] % gameProps.squaresX === 0 && player.direction === -1) ||
      (player.snake[0] - gameProps.squaresX <= 0 &&
        player.direction === -gameProps.squaresX) ||
      (squares[player.snake[0] + player.direction].classList.contains(
        "snake"
      ) &&
        squares[player.snake[0] + player.direction].classList.contains(
          player.id
        ))
    );
  };

  const allPlayersDead = () => {
    for (let i = 0; i < gameProps.players.length; i++) {
      if (gameProps.players[i].alive) return false;
    }
    return true;
  };

  const moveChecks = () => {
    let squares = document.querySelectorAll(".grid div");
    gameProps.players.forEach((player) => {
      if (checkCollisions(player, squares)) {
        player.snake.forEach((pos) => {
          squares[pos].classList.remove("snake", player.id, player.color);
        });
        player.alive = false;
        if (player.id === playerId) {
          document.removeEventListener("keydown", control);
        }
      } else {
        if (player.alive) {
          moveSnake(player, squares);
        }
      }
    });
    if (allPlayersDead()) {
      clearInterval(gameLoop);
      controlsDisplay.classList.remove("visually-hidden");
    }
  };

  const changePlayerDirection = (obj) => {
    gameProps.players.forEach((player) => {
      if (player.id === obj.playerId) {
        player.direction = obj.direction;
      }
    });
  };

  socket.on("playerChangedDirection", changePlayerDirection);

  const eatApple = (squares, tail, player) => {
    if (squares[player.snake[0]].classList.contains("apple")) {
      squares[player.snake[0]].classList.remove("apple");
      squares[tail].classList.add("snake", player.id, player.color);
      player.snake.push(tail);
      if (player.id === playerId) {
        randomApple(squares);
      }
      player.score++;
      updatePlayerScore(player);
      // clearInterval(gameLoop);
      // gameLoopTime = gameLoopTime * speed;
      // gameLoop = setInterval(moveChecks, gameLoopTime);
    }
  };

  const randomApple = (squares) => {
    let appleIndex;
    do {
      appleIndex = Math.floor(Math.random() * squares.length);
    } while (squares[appleIndex].classList.contains("snake"));
    socket.emit("newApple", appleIndex);
  };

  const addApple = (index) => {
    let squares = document.querySelectorAll(".grid div");
    squares[index].classList.add("apple");
  };

  socket.on("addNewApple", addApple);

  const moveSnake = (player, squares) => {
    let tail = player.snake.pop();
    squares[tail].classList.remove("snake", player.id, player.color);
    player.snake.unshift(player.snake[0] + player.direction);
    eatApple(squares, tail, player);
    squares[player.snake[0]].classList.add("snake", player.id, player.color);
  };

  const loadGame = (props) => {
    gameProps = props;
    gameLoopTime = 300;
    speed = 0.8;
    createBoard();
    creatScoreboard();
    document.addEventListener("keydown", control);
    controlsDisplay.classList.add("visually-hidden");
    scoreDisplay.classList.remove("visually-hidden");
    renderSnakes();
    addApple(gameProps.firstAppleIndex);
    gameLoop = setInterval(moveChecks, gameLoopTime);
  };

  socket.on("loadGame", loadGame);

  const initGame = () => {
    socket.emit("startGame");
  };

  const initLoadScreen = (player) => {
    playerId = player.id;
    views.player.classList.add("visually-hidden");
    views.game.classList.remove("visually-hidden");
    views.game.classList.add(player.color);
    startBtn.addEventListener("click", initGame);
  };

  socket.on("playerLoaded", initLoadScreen);

  const loadPlayer = () => {
    playerName = playerNameInput.value;
    playerNameDisplay.innerText = playerName;
    socket.emit("playerSetup", {
      name: playerName,
      screenX: document.body.clientWidth,
      screenY: document.body.clientHeight,
      score: 0,
      snake: [],
      direction: 1,
      alive: true,
      color: "",
    });
  };

  const init = (function () {
    loadPlayerBtn.addEventListener("click", loadPlayer);
  })();
})();
