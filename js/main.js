/****** constants ******/
const boardConfig = {
  // pits per player
  boardPits: 6,
  homePits: 1,
};

/****** state variables ******/
let homePitStones,
  boardStones,
  // todo: complete coin toss
  turn = "player1",
  turnCount = 0,
  selectedPit,
  winner,
  gamePlay,
  extraTurn,
  playTurnBtn,
  // set the default difficulty level
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
      playerPane: document.querySelector("#player-1-pane"),
      pitSelected: document.querySelector("#pit-info-1"),
      stonesSelected: document.querySelector("#stone-count-1"),
      boardPitPositions: [1, 2, 3, 4, 5, 6],
    }),
      (this.player2 = {
        name: "Player 2",
        homePit: 0,
        homePitPosition: 14,
        playerPane: document.querySelector("#player-2-pane"),
        pitSelected: document.querySelector("#pit-info-2"),
        stonesSelected: document.querySelector("#stone-count-2"),
        boardPitPositions: [8, 9, 10, 11, 12, 13],
      });
    // utility function: if we get an opposing side parameter, we return the
    // opposing side. if not, we return the player who owns the position
    this.boardPosition = function (position, opposingSide) {
      let player =
        position <= this.player1.homePitPosition ? `player1` : `player2`;
      return opposingSide ? this.player2.homePitPosition - position : player;
    };
  }
}

/****** functions ******/
const setPlayerParams = () => {
  // set the player params after each DOM update
  ["player1", "player2"].forEach((item) => {
    gamePlay[item].homePit = homePitStones[gamePlay[item].homePitPosition];
    document.getElementById(
      gamePlay[item].homePitPosition.toString()
    ).innerHTML = homePitStones[gamePlay[item].homePitPosition];
    gamePlay[item].stonesSelected.innerHTML = gamePlay[item].homePit;
    gamePlay[item].playerPane.children[0].innerHTML = gamePlay[item].name;
    gamePlay[item].pitSelected.innerHTML = `Home Pit`;
  });
};

// on initialization, prevent stones from being added to the home pits.
// on every other turn, prevent stones from being added to the home pit
// of the opposite player and the pit that they selected for the turn.
const pitTainted = (position, init) => {
  let oppositePlayer = turn === "player1" ? "player2" : "player1";
  if (init === true && (position === gamePlay.player1.homePitPosition || position === gamePlay.player2.homePitPosition)) return true;
  if (position === gamePlay[oppositePlayer].homePitPosition) return true;
  delete oppositePlayer;
  return selectedPit ? position === selectedPit : false;
};
// add stones to the proper pits on game initialization
const initialPitStones = () => {
  for (let i = 1; i <= gamePlay.player2.homePitPosition; i++) {
    // taint home pits. init parameter for current state
    if (pitTainted(i, true)) continue;
    for (let j = 0; j < difficulty; j++) {
      boardStones.add(i);
    }
  }
  playerPits();
};

// play a turn
const playTurn = (position) => {
  // collect stones from a selected pit and distribute to all pits except the tainted
  // pits, return the id of the last pit we drop on.
  position = Number(position);
  selectedPit = position;
  let dropPosition,
    stones = boardStones.collect(position);
  // drop position +1 because we're dropping on the next position.
  // board ends at 14 so 14 +1 is 1.
  position === 14 ? (dropPosition = 1) : (dropPosition = position + 1);
  if (stones === 0) {
    createMessage(`That pit has no stones. Select another.`);
    return;
  }
  while (stones > 0) {
    if (pitTainted(dropPosition)) {
      dropPosition === gamePlay.player2.homePitPosition ? (dropPosition = 1) : dropPosition++;
      continue;
    }
    if (dropPosition === gamePlay.player1.homePitPosition || dropPosition === gamePlay.player2.homePitPosition) {
      homePitStones.add(dropPosition);
      stones--;
    } else {
      boardStones.add(dropPosition);
      stones--;
    }
    dropPosition === gamePlay.player2.homePitPosition ? (dropPosition = 1) : dropPosition++;
  }
  setPlayerParams();
  dropPosition = checkState(dropPosition);
  if (gameOver()) return;
  turnCount++;
  switchTurn();
  return dropPosition;
};

const checkState = (position) => {
  // turn state -1 because the loop increments before testing for stones left
  // board ends at 14, so -1 of 1 is 14
  let turnState = position === 1 ? gamePlay.player2.homePitPosition : position - 1;
  // console.log(`Last pit was ${turnState}`); // debug logging
  // if the last pit is a home pit, the current player plays again.
  if (turnState === gamePlay.player1.homePitPosition || turnState === gamePlay.player2.homePitPosition) {
    extraTurn = true;
    // if the last pit is empty and on the current player's side, all the opponent's stones
    // on the opposite pit are added to the current player's home pit.
  } else if (
    boardStones[turnState] === 1 &&
    gamePlay.boardPosition(turnState) === turn
  ) {
    let capturedStones = boardStones.collect(
      gamePlay.boardPosition(turnState, true)
    );
    console.log(
      `Capture of ${capturedStones} stone(s) from ${gamePlay.boardPosition(
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
  let pitCount = 0,
    stones = 0;
  pitCount = gamePlay.player1.boardPitPositions.reduce((accumulator, item) => {
    return accumulator = boardStones[item] === 0 ? accumulator + 1 : accumulator
  },0);
  if (pitCount === gamePlay.player1.boardPitPositions.length) {
    gamePlay.player2.boardPitPositions.forEach((item) => {
      if (gamePlay.player2.homePitPosition !== item) {
        stones += boardStones.collect(item);
        console.log(`Collected ${stones} to end the game.`);
      }
    });
    for (let i = 0; i < stones; i++) {
      homePitStones.add(gamePlay.player2.homePitPosition);
    }
  } else {
    pitCount = 0;
  }
  pitCount = gamePlay.player2.boardPitPositions.reduce((accumulator, item) => {
    return accumulator = boardStones[item] === 0 ? accumulator + 1 : accumulator
  },0);
  if (pitCount === gamePlay.player2.boardPitPositions.length) {
    gamePlay.player1.boardPitPositions.forEach((item) => {
      if (gamePlay.player1.homePitPosition !== item) {
        stones += boardStones.collect(item);
        console.log(`Collected ${stones} to end the game. Position ${item}.`);
      }
    });
    for (let i = 0; i < stones; i++) {
      homePitStones.add(7);
    }
  }
  setPlayerParams();
  if (stones > 0 || winner) {
    if (gamePlay.player1.homePit === gamePlay.player2.homePit) {
      winner = `tie`;
      return winner;
    } else {
      winner =
        gamePlay.player1.homePit > gamePlay.player2.homePit
          ? `player1`
          : `player2`;
      return winner;
    }
  } else {
    return false;
  }
};

// UX function: when we need to clear the board at the end of the game
// reset pit boards, remove play buttons, and generate a play again link.
// adding a remove parameter removes the play again link.
const resetPitSelect = (remove) => {
  if (remove === true) {
    document.querySelector("#play-again").remove();
    document.querySelectorAll(".player-info").forEach((item) => {
      item.removeAttribute("style");
      item.classList.add("pane-resize");
    });
    return;
  }
  document.querySelectorAll(".board-pit").forEach((item) => {
    item.style.removeAttribute();
  });
  document.querySelectorAll(".play-turn-btn").forEach((item) => {
    item.remove();
  });
  document.querySelectorAll(".player-info").forEach((item) => {
    item.style.height = "20vmin";
    item.classList.remove("pane-resize");
  });
  let playAgainBtn = document.createElement("div");
  playAgainBtn.innerHTML = "Play Again?";
  playAgainBtn.classList.add("play-again");
  playAgainBtn.id = "play-again";
  playerPane.appendChild(playAgainBtn);
  playAgainBtn.addEventListener("click", handleClick);
};

const gameOver = () => {
  let gameState = checkForWinner();
  // console.log(gameState);
  if (gameState != false) {
    switch (gameState) {
      case "Tie":
        createMessage(`It's a tie!`);
        break;
      default:
        createMessage(`${gamePlay[gameState].name} Wins!`);
        break;
    }
    resetPitSelect();
  } else {
    return false;
  }
};
// create a message for the info pane.
const createMessage = (msg, position) => {
  infoPane.innerHTML = msg;
};

// toggle pit selection.
const togglePit = (position, reset) => {
  if (winner) return;
  document.querySelectorAll(".board-pit").forEach((item) => {
    item.style.border = "";
    playerPits();
  });
  if (!reset)
    document.getElementById(position).style.border = "var(--selected-pit)";
};

// switch turns unless they landed on a home pit on their last turn.
const switchTurn = () => {
  if (winner) return;
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
  let playTurnBtn = document.querySelector("#play-turn-btn");
  gamePlay[turn].pitSelected.innerHTML = `Pit ${position} Selected`;
  gamePlay[turn].stonesSelected.innerHTML = `${boardStones[position]}`;
  gamePlay[turn].boardPitPositions.indexOf(position) === -1
    ? (playTurnBtn.disabled = true)
    : (playTurnBtn.disabled = false);
  playTurnBtn.dataset.pit = position;
};

// add pits to the game board.
const createPits = () => {
  let pitPosition = 1;
  // add pits for player 1.
  for (let i = 0; i < boardConfig.boardPits; i++) {
    let pit = document.createElement("div");
    pit.classList.add("board-pit", "player1");
    pit.id = pitPosition;
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
    document.querySelector("#board-pits-1").appendChild(pit);
    pitPosition--;
  }
  delete pitPosition;
};
// whenever the pit stone objects are updated, also update the DOM.
const updatePit = (position) => {
  let strPosition = position.toString();
  if (position === gamePlay.player1.homePitPosition || position === gamePlay.player2.homePitPosition) {
    document.getElementById(strPosition).innerHTML = homePitStones[position];
  } else {
    document.getElementById(strPosition).innerHTML = "";
    for (let i = 0; i < boardStones[position]; i++) {
      let newStone = document.createElement("div");
      newStone.classList.add("stone");
      document.getElementById(strPosition).appendChild(newStone);
    }
  }
  delete strPosition;
};

// creates the play turn button
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
// highlight the pits that the current player can select
const playerPits = () => {
  let selector = turn === "player1" ? ".player1" : ".player2";
  document.querySelectorAll(selector).forEach((item) => {
    item.style.borderStyle = "dotted";
  });
};
// handle click across the entire game scene
const handleClick = (e) => {
  let numPosition = Number(e.target.id);
  if (e.target.classList.contains("board-pit")) {
    if (winner) return;
    togglePit(numPosition);
    pitSelect(numPosition);
  } else if (e.target.classList.contains("play-turn-btn")) {
    if (winner) return;
    playTurn(e.target.dataset.pit);
  } else if (e.target.classList.contains("play-again")) {
    resetPitSelect(true);
    init();
  } else if (e.target.id === "new-game-button") {
    gamePlay.player1.name = document.getElementById("player1NameInput").value;
    gamePlay.player2.name = document.getElementById("player2NameInput").value;
    difficulty = document.getElementById("difficulty").value;
    initialPitStones();
    setPlayerParams();
    toggleStartDialog();
    createMessage(`The dotted pits are yours. Select one to play from.`);
  }
};

const clearGameBoard = () => {
  document.querySelectorAll(".board-pit").forEach((item) => {
    item.remove();
  });
};

const renderPlayerPane = () => {
  updatePlayerPane();
  createMessage(`Choose your player names and difficulty level.`);
};

const renderBoard = () => {
  clearGameBoard();
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
      updatePit(position);
      return this[position];
    },
    collect: function (position) {
      let stonesCollected = this[position];
      this[position] = 0;
      updatePit(position);
      return stonesCollected;
    },
  };
  homePitStones = {
    7: 0,
    14: 0,
    add: function (position) {
      this[position] = this[position] + 1;
      updatePit(position);
      return this[position];
    },
  };
  turnCount = 0;
  setPlayerParams();
  toggleStartDialog();
};
const toggleStartDialog = () => {
  if (document.getElementById("start-dialog")) {
    document.getElementById("start-dialog").remove();
    document.querySelector("#player-1-pane").removeAttribute("style");
    document.querySelector("#player-2-pane").removeAttribute("style");
  } else {
    let dialogElements = {};
    dialogElements.container = document.createElement("div");
    dialogElements.container.classList.add("start-dialog");
    dialogElements.container.id = "start-dialog";
    // name inputs
    dialogElements.player1Name = document.createElement("input");
    dialogElements.player1Name.value = "Player 1";
    dialogElements.player1Name.id = "player1NameInput";
    dialogElements.player2Name = document.createElement("input");
    dialogElements.player2Name.value = "Player 2";
    dialogElements.player2Name.id = "player2NameInput";
    //difficulty select
    dialogElements.difficultyLabel = document.createElement("label");
    dialogElements.difficultyLabel.for = "difficulty";
    dialogElements.difficultyLabel.id = "difficulty-label";
    dialogElements.difficultyLabel.innerText = "Difficulty";
    dialogElements.difficulty = document.createElement("select");
    dialogElements.difficulty.id = "difficulty";
    dialogElements.difficulty.name = "difficulty";
    dialogElements.difficultyOptions = [3, 4, 5, 6, 7, 8, 9, 10];
    dialogElements.difficultyOptions.forEach((item) => {
      let option = document.createElement("option");
      option.value = item;
      if (item === difficulty) option.selected = "true";
      option.innerHTML = item;
      dialogElements.difficulty.appendChild(option);
    });
    // start a new game button
    dialogElements.startButton = document.createElement("button");
    dialogElements.startButton.id = "new-game-button";
    dialogElements.startButton.innerText = "Start A New Game";
    dialogElements.startButton.classList.add("new-game-button");
    // append elements to container
    dialogElements.container.appendChild(dialogElements.player1Name);
    dialogElements.container.appendChild(dialogElements.player2Name);
    dialogElements.container.appendChild(dialogElements.difficultyLabel);
    dialogElements.container.appendChild(dialogElements.difficulty);
    dialogElements.container.appendChild(dialogElements.startButton);
    document.querySelector("#player-1-pane").style.display = "none";
    document.querySelector("#player-2-pane").style.display = "none";
    playerPane.appendChild(dialogElements.container);
    document
      .querySelector("#new-game-button")
      .addEventListener("click", handleClick);
    delete dialogElements;
  }
};
const init = () => {
  gamePlay = new GameScene();
  renderBoard();
  renderPlayerPane();
};

init();

/****** event listeners ******/
gameBoard.addEventListener("click", handleClick);
