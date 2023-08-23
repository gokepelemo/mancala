/****** constants ******/
const boardConfig = {
  // pits per player
  boardPits: 6,
  homePits: 1,
};

/****** state variables ******/
let homePitStones,
  boardStones,
  turn = "player1",
  turnCount = 0,
  selectedPit,
  winner,
  gamePlay,
  extraTurn,
  playTurnBtn,
  // todo: add validation to prevent numbers outside the range of 3 and 10
  difficulty = 3;

/****** cached DOM elements ******/
const infoPane = document.querySelector("#info-pane");
const playerPane = document.querySelector("#player-pane");
const gameBoard = document.querySelector("#game-board");

/****** classes ******/
class GameScene {
  constructor() {
    (this.player1 = {
      name: "Player 1",
      homePit: 0,
      homePitPosition: 7,
      playerPane: document.querySelector("#player-1-pane"),
      pitSelected: document.querySelector("#pit-info-1"),
      stonesSelected: document.querySelector("#stone-count-1"),
      boardPitPositions: [1, 2, 3, 4, 5, 6, 7],
    }),
      (this.player2 = {
        name: "Player 2",
        homePit: 0,
        homePitPosition: 14,
        playerPane: document.querySelector("#player-2-pane"),
        pitSelected: document.querySelector("#pit-info-2"),
        stonesSelected: document.querySelector("#stone-count-2"),
        boardPitPositions: [8, 9, 10, 11, 12, 13, 14],
      });
    // utility function: if we get an opposing side parameter, we return the
    // opposing side. if not, we return the player who owns the position
    this.boardPosition = function (position, opposingSide) {
      let player =
        position < this.player1.homePitPosition
          ? this.player1.name
          : this.player2.name;
      return opposingSide ? this.player2.homePitPosition - position : player;
    };
  }
}

/****** functions ******/
const setPlayerParams = () => {
  // set the number of stones in the homepit after each turn
  gamePlay.player1.homePit = homePitStones[7];
  gamePlay.player2.homePit = homePitStones[14];
  gamePlay[turn].pitSelected.innerHTML = `Home Pit`;
  gamePlay[`player1`].stonesSelected.innerHTML = gamePlay[`player1`].homePit;
  gamePlay[`player2`].stonesSelected.innerHTML = gamePlay[`player2`].homePit;
};

// on initialization, prevent stones from being added to the home pits.
// on every other turn prevent stones from being added to the home pit
// of the opposite player and the pit that they selected for the turn.
const pitTainted = (position, init) => {
  let oppositePlayer = turn === "player1" ? "player2" : "player1";
  if (init && (position === 7 || position === 14)) return true;
  if (position === gamePlay[oppositePlayer].homePitPosition) return true;
  return selectedPit ? position === selectedPit : false;
};
// add stones to the proper pits on game initialization
const initialPitStones = () => {
  for (let i = 1; i <= 14; i++) {
    // taint pit for the current player
    if (pitTainted(i, true)) continue;
    // todo: difficulty should be set in dialog at the beginning of the game
    for (let j = 0; j < difficulty; j++) {
      addStone(document.getElementById(i.toString()));
    }
  }
  playerPits();
};

// play a turn
const playTurn = (position) => {
  // collect stones from a selected pit and distribute to all pits except the tainted
  // pits, return the id of the last pit we drop on
  let dropPosition,
    stones = boardStones.collect(position);
  selectedPit = position;
  position = Number(position);
  position === 14 ? (dropPosition = 1) : (dropPosition = position + 1);
  if (stones === 0) {
    createMessage(`That pit has no stones. Select another.`);
    return;
  }
  while (stones > 0) {
    if (pitTainted(dropPosition)) {
      dropPosition === 14 ? (dropPosition = 1) : dropPosition++;
      continue;
    }
    if (dropPosition === 7 || dropPosition === 14) {
      homePitStones.add(dropPosition);
      stones--;
    } else {
      boardStones.add(dropPosition);
      stones--;
    }
    dropPosition === 14 ? (dropPosition = 1) : dropPosition++;
  }
  setPlayerParams(turn);
  dropPosition = checkState(dropPosition);
  turnCount++;
  switchTurn();
  return dropPosition;
};

const checkState = (position) => {
  let turnState = position === 1 ? 14 : position - 1;
  console.log(`Last pit was ${turnState}`);
  // if the last pit is a home pit, the current player plays again.
  if (turnState === 7 || turnState === 14) {
    extraTurn = true;
    // if the last pit is empty and on the current player's side, all the opponent's stones
    // on the opposite pit are added to the current player's home pit.
  } else if (
    boardStones[turnState] === 1 &&
    gamePlay[turn].boardPitPositions.indexOf(turnState) != -1
  ) {
    let capturedStones = boardStones.collect(
      gamePlay.boardPosition(turnState, true)
    );
    console.log(
      `Big capture of ${capturedStones} stones from ${gamePlay.boardPosition(
        turnState,
        true
      )}. Ended on ${turnState}.`
    );
    for (let i = 0; i < capturedStones; i++) {
      homePitStones.add(gamePlay[turn].homePitPosition);
    }
  }
  // Return the last position that was played.
  return turnState;
};
const checkForWinner = () => {
  let pitCount = 0;
  document.querySelectorAll(`.player1`).forEach((item) => {
    if (item.dataset.stones === 0) pitCount++;
  });
  if (pitCount === 6) {
    return true;
  } else {
    pitCount = 0;
  }
  document.querySelectorAll(`.player2`).forEach((item) => {
    if (item.dataset.stones === 0) pitCount++;
  });
  document.querySelectorAll(`.player1`).forEach((item) => {
    if (item.dataset.stones === 0) pitCount++;
  });
  if (pitCount === 6) {
    return true;
  }
  return false;
};
// create a message for the info pane.
const createMessage = (msg, position) => {
  infoPane.innerHTML = msg;
};

// toggle pit selection.
const togglePit = (position, reset) => {
  document.querySelectorAll(".board-pit").forEach((item) => {
    item.style.border = "";
    playerPits();
  });
  if (!reset)
    document.getElementById(position).style.border = "var(--selected-pit)";
};

// switch turns unless they landed on a home pit on their last turn.
const switchTurn = () => {
  if (extraTurn === true) {
    createMessage(`Landed on your home pit. You get an extra turn.`);
    extraTurn = false;
  } else {
    turn === "player1" ? (turn = "player2") : (turn = "player1");
    createMessage(`${gamePlay[turn].name}'s turn. Play from a dotted pit.`);
  }
  updatePlayerPane();
  setPlayerParams();
  togglePit(0, true);
  return turn;
};

// coin toss.
const coinToss = () => {
  return Math.ceil(Math.random() * 2) === 1 ? "Heads" : "Tails";
};

// handle player selecting a pit.
const pitSelect = (position) => {
  let numPosition = Number(position);
  let playTurnBtn = document.querySelector("#play-turn-btn");
  gamePlay[turn].pitSelected.innerHTML = `Pit ${position} Selected`;
  gamePlay[turn].stonesSelected.innerHTML = `${boardStones[position]}`;
  gamePlay[turn].boardPitPositions.indexOf(numPosition) === -1
    ? (playTurnBtn.disabled = true)
    : (playTurnBtn.disabled = false);
  playTurnBtn.dataset.pit = position;
};

// add a stone to a pit on the game board.
const addStone = (positionElement) => {
  let numPosition = Number(positionElement.id);
  if (numPosition == 7 || numPosition == 14) homePitStones.add(numPosition);
  if (numPosition != 7 || numPosition < 14) boardStones.add(numPosition);
};

// add pits to the game board.
const createPits = () => {
  let pitPosition = 1;
  // add pits for player 1.
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit", "player1");
    pit.id = pitPosition;
    pit.dataset.stones = 0;
    document.querySelector("#board-pits-2").appendChild(pit);
    pitPosition++;
  }
  // skip the home pit and decrement.
  pitPosition = 13;
  // add pits for player 2.
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit", "player2");
    pit.id = pitPosition;
    pit.dataset.stones = 0;
    document.querySelector("#board-pits-1").appendChild(pit);
    pitPosition--;
  }
};
// whenever the pit stone objects are updated, also update the DOM.
const updatePit = (position) => {
  let numPosition = position.toString();
  if (position === 7 || position === 14) {
    document.getElementById(numPosition).innerHTML = homePitStones[numPosition];
  } else {
    document.getElementById(numPosition).innerHTML = "";
    for (let i = 0; i < boardStones[numPosition]; i++) {
      let newStone = document.createElement("div");
      newStone.classList.add("stone");
      document.getElementById(numPosition).appendChild(newStone);
    }
  }
};

const updatePlayerPane = () => {
  document.querySelectorAll(".play-turn-btn").forEach((item) => {
    item.remove();
  });
  playTurnBtn = document.createElement("button");
  playTurnBtn.classList.add("play-turn-btn", "btn", "btn-light");
  playTurnBtn.id = "play-turn-btn";
  playTurnBtn.innerHTML = "Play Turn";
  playTurnBtn.disabled = true;
  gamePlay[turn].playerPane.appendChild(playTurnBtn);
  playTurnBtn.addEventListener("click", handleClick);
};

const playerPits = () => {
  let selector = turn === "player1" ? ".player1" : ".player2";
  document.querySelectorAll(selector).forEach((item) => {
    item.style.borderStyle = "dotted";
  });
};

const handleClick = (e) => {
  if (e.target.classList.contains("board-pit")) {
    togglePit(Number(e.target.id));
    pitSelect(e.target.id);
  } else if (e.target.classList.contains("play-turn-btn")) {
    playTurn(e.target.dataset.pit);
  }
};

const renderPlayerPane = () => {
  updatePlayerPane();
  createMessage(`The dotted pits are yours. Select one to play from.`);
};

const renderBoard = () => {
  createPits();
  boardStones = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    add: function (position) {
      this[position] = this[position] + 1;
      document.getElementById(position.toString()).dataset.stones =
        this[position];
      updatePit(position);
      return this[position];
    },
    collect: function (position) {
      let stonesCollected = this[position];
      this[position] = 0;
      document.getElementById(position.toString()).dataset.stones =
        this[position];
      updatePit(position);
      return stonesCollected;
    },
  };
  homePitStones = {
    7: 0,
    14: 0,
    add: function (position) {
      this[position] = this[position] + 1;
      document.getElementById(position.toString()).dataset.stones =
        this[position];
      updatePit(position);
      return this[position];
    },
  };
  turnCount = 0;
  initialPitStones();
};
const init = () => {
  gamePlay = new GameScene();
  renderBoard();
  renderPlayerPane();
};

init();

/****** event listeners ******/
gameBoard.addEventListener("click", handleClick);
