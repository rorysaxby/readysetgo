(() => {
  const players = [];

  const player = (props) => {
    this.snake = [];
    this.direction = 1;
    this.score = 0;
    this.intervalTime = 1000;
    document.addEventListener("keydown", playerControls.bind(this));
  };

  player.prototype.initPlayer = () => {
    this.direction = 1;
    this.score = 0;
    scoreDisplay.innerHTML = score;
    intervalTime = 1000;
    snake = [2, 1, 0];
    currentIndex = 0;
    snake.forEach((index) => squares[index].classList.add("snake"));
    interval = setInterval(moveOutcome, intervalTime);
  };

  const loadPlayer = () => {
    players.push(new player());
  };

  const initPlayers = () => {
    for (let i = 0; i < players.length; i++) {
      players[i].initPlayer();
    }
  };

  // let appleIndex;
  // let snake;
  // let direction;
  // let interval;
  // let intervalTime;

  let gridSquaresYnum;
  let gridSquaresXnum;
  let totalSquaresNum;

  let grid = document.querySelector(".grid");
  let startBtn = document.querySelector(".start");
  let scoreDisplay = document.querySelector(".scoreDisplay");
  let controlsDisplay = document.querySelector(".controls-display");

  let squareWidth = 20;
  let score = 0;
  let speed = 0.8;

  const createBoard = () => {
    loadSquares();
    for (let i = 0; i < totalSquaresNum; i++) {
      let div = document.createElement("div");
      grid.appendChild(div);
    }
  };

  const loadSquares = () => {
    gridSquaresYnum = Math.floor(document.body.clientHeight / squareWidth);
    gridSquaresXnum = Math.floor(document.body.clientWidth / squareWidth);
    totalSquaresNum = gridSquaresXnum * gridSquaresYnum;
  };

  const startGame = () => {
    controlsDisplay.classList.add("visually-hidden");
    let squares = document.querySelectorAll(".grid div");
    randomApple(squares);
    // direction = 1;
    // score = 0;
    // scoreDisplay.innerHTML = score;
    // intervalTime = 1000;
    // snake = [2, 1, 0];
    // currentIndex = 0;
    // snake.forEach((index) => squares[index].classList.add("snake"));
    // interval = setInterval(moveOutcome, intervalTime);
  };

  const moveOutcome = () => {
    let squares = document.querySelectorAll(".grid div");
    if (checkForHits(squares)) {
      alert("you hit something");
      controlsDisplay.classList.remove("visually-hidden");
      return clearInterval(interval);
    } else {
      moveSnake(squares);
    }
  };

  const moveSnake = (squares) => {
    let tail = snake.pop();
    squares[tail].classList.remove("snake");
    snake.unshift(snake[0] + direction);
    // movement ends here
    eatApple(squares, tail);
    squares[snake[0]].classList.add("snake");
  };

  function checkForHits(squares) {
    return (
      (snake[0] + gridSquaresXnum >= totalSquaresNum &&
        direction === gridSquaresXnum) ||
      (snake[0] % gridSquaresXnum === gridSquaresXnum - 1 && direction === 1) ||
      (snake[0] % gridSquaresXnum === 0 && direction === -1) ||
      (snake[0] - gridSquaresXnum <= 0 && direction === -gridSquaresXnum) ||
      squares[snake[0] + direction].classList.contains("snake")
    );
  }

  const eatApple = (squares, tail) => {
    if (squares[snake[0]].classList.contains("apple")) {
      squares[snake[0]].classList.remove("apple");
      squares[tail].classList.add("snake");
      snake.push(tail);
      randomApple(squares);
      score++;
      scoreDisplay.textContent = score;
      clearInterval(interval);
      intervalTime = intervalTime * speed;
      interval = setInterval(moveOutcome, intervalTime);
    }
  };

  const randomApple = (squares) => {
    do {
      appleIndex = Math.floor(Math.random() * squares.length);
    } while (squares[appleIndex].classList.contains("snake"));
    squares[appleIndex].classList.add("apple");
  };

  const playerControls = (e) => {
    switch (e.key) {
      case "ArrowRight":
        direction = 1;
        break;
      case "ArrowLeft":
        direction = -1;
        break;
      case "ArrowUp":
        direction = -gridSquaresXnum;
        break;
      case "ArrowDown":
        direction = +gridSquaresXnum;
        break;
    }
  };

  const loadGame = () => {
    grid.innerHTML = "";
    createBoard();
    // startGame();
    initPlayers();
  };

  const loadOnceinit = (function () {
    createBoard();
    startBtn.addEventListener("click", loadGame);
  })();

  loadPlayer();
})();
