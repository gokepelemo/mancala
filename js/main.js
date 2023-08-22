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
  // todo: add validation to prevent numbers outside the range of 3 and 10
  difficulty = 10;

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
      pitSelected: document.querySelector("#pit-info-1"),
      stonesSelected: document.querySelector("#stone-count-1"),
    }),
      (this.player2 = {
        name: "Player 2",
        homePit: 0,
        homePitPosition: 14,
        pitSelected: document.querySelector("#pit-info-2"),
        stonesSelected: document.querySelector("#stone-count-2"),
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
  gamePlay[turn].homePit = homePitStones[7];
  gamePlay[turn].homePit = homePitStones[14];
};

// on initialization, prevent stones from being added to the home pits.
// on every other turn prevent stones from being added to the home pit
// of the current player and the pit they selected for the turn.
const pitTainted = (position, init) => {
  let oppositeTurn = turn === "player1" ? "player2" : "player1";
  if (init && (position === 7 || position === 14)) return true;
  if (position === gamePlay[oppositeTurn].homePitPosition) return true;
  return selectedPit ? position === selectedPit : false;
};
// add stones to the proper pits on game initialization
const initialPitStones = () => {
  for (let i = 1; i <= 14; i++) {
    // taint pit for the current player
    if (pitTainted(i, true)) continue;
    // todo: difficulty should be set in dialogue at the beginning of the game
    for (let j = 0; j < difficulty; j++) {
      addStone(document.getElementById(i.toString()));
    }
  }
};

// play a turn
const playTurn = (position) => {
  // collect stones from a selected pit and distribute to all pits except the tainted pits, return the id of the last pit it drops on
  let dropPosition,
    stones = boardStones.collect(position);
  position === 14 ? (dropPosition = 1) : (dropPosition = position + 1);
  selectedPit = position;
  while (stones > 0) {
    if (pitTainted(dropPosition)) {
      console.log(`${dropPosition} is tainted`);
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
  return checkState(dropPosition);
};

const checkState = (position) => {
  let turnState = position - 1;
  // If the last pit is a home pit, current player plays again.
  if (turnState === 7 || turnState === 14) {
    extraTurn = true;
  // If the last pit is empty and on the current player's side, all the opponent's stones on the opposite pit are added to the current player's home pit.
  } else if (boardStones[turnState] === 1) {
    let capturedStones = boardStones.collect(
      gamePlay.boardPosition(turnState, true)
    );
    for (let i = 0; i < capturedStones; i++) {
      homePitStones.add(gamePlay[turn].homePitPosition);
    }
  }
  // Return the last position that was played.
  return turnState
};
// create a message for the info pane
const createMessage = (msg, position) => {
  infoPane.innerHTML = msg;
};

// toggle pit selection
const togglePit = (position) => {
  let hasBorder = document.getElementById(position).style.border != "";
  hasBorder
    ? (document.getElementById(position).style.border = "")
    : (document.getElementById(position).style.border = "var(--selected-pit)");
};

// switch turns unless they landed on a home pit on their last turn
const switchTurn = () => {
  if (extraTurn === true) {
    createMessage(`Landed on your home pit. You get an extra turn.`);
    extraTurn = false;
    return turn;
  } else {
    turn === "player1" ? (turn = "player2") : (turn = "player1");
    return turn;
  }
};

// coin toss
const coinToss = () => {
  return Math.ceil(Math.random() * 2) === 1 ? "Heads" : "Tails";
};

// handle player selecting a pit
const pitSelect = (position) => {
  gamePlay[turn].pitSelected.innerHTML = `Pit ${position} Selected`;
  gamePlay[turn].stonesSelected.innerHTML = `${boardStones[position]}`;
};

// add a stone to a pit on the game board
const addStone = (position) => {
  let numPosition = Number(position.id);
  if (numPosition == 7 || numPosition == 14) homePitStones.add(numPosition);
  if (numPosition != 7 || numPosition < 14) boardStones.add(numPosition);
};

// add pits to the game board
const createPits = () => {
  let pitPosition = 1;
  // add pits for player 2
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit");
    pit.id = pitPosition;
    pit.dataset.stones = 0;
    document.querySelector("#board-pits-2").appendChild(pit);
    pitPosition++;
  }
  // skip the home pit and decrement
  pitPosition = 13;
  // add pits for player 1
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit");
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
  initialPitStones();
};
const init = () => {
  gamePlay = new GameScene();
  renderBoard();
};

init();
