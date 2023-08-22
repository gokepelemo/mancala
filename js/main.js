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
  turnCount,
  selectedPit = 1,
  winner,
  gamePlay,
  difficulty = 6;

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
    }),
      (this.player2 = {
        name: "Player 2",
        homePit: 0,
        homePitPosition: 14,
      });
    // utility function: if we get an opposing side parameter, we return the
    // opposing side. if not, we return the player who owns the position
    this.boardPositions = function (position, opposingSide) {
      let player =
        position > this.player1.homePitPosition
          ? this.player1.name
          : this.player2.name;
      return opposingSide ? this.player2.homePitPosition - position : player;
    };
  }
}

/****** functions ******/
const pitTainted = (...args) => {
  if (args == 7 && turn == "player1") {
    return true;
  } else if (args == 14 && turn == "player2") {
    return true;
  }
  args.forEach((item) => {
    console.log(gamePlay[turn].homePitPosition);
    return item == selectedPit || item == gamePlay[turn].homePitPosition
      ? true
      : false;
  });
};
// add stone to the proper pits on game initialization
const addPitStones = () => {
  for (let i = 1; i <= 14; i++) {
    // taint pit for the current player
    if (pitTainted(i)) continue;
    // difficulty should be set in dialogue at the beginning of the game
    for (let j = 0; j < difficulty; j++) {
      let position = i.toString();
      console.log(i)
      addStones(1, document.getElementById(i.toString()));
    }
  }
};
// create messages for the info pane
const createMessage = (msg, position) => {
  infoPane.innerHTML = msg;
};
//
// add stones to a pit on the game board
const addStones = (quantity, position) => {
  for (let i = 0; i < quantity; i++) {
    let newStone = document.createElement("div");
    newStone.classList.add("stone");
    position.appendChild(newStone);
  }
};
// add pits to the game board
const createPits = () => {
  let stonePosition = 1;
  // add pits for player 2
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit");
    pit.id = stonePosition;
    document.querySelector("#board-pits-2").appendChild(pit);
    stonePosition++;
  }
  // skip the home pit and decrement
  stonePosition = 13;
  // add pits for player 1
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit");
    pit.id = stonePosition;
    document.querySelector("#board-pits-1").appendChild(pit);
    stonePosition--;
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
  };
  homePitStones = {
    7: 0,
    14: 0,
  };
  addPitStones();
};
const init = () => {
  gamePlay = new GameScene();
  renderBoard();
};

init();
