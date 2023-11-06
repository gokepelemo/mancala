let homePitStones,
  boardStones,
  turn,
  turnCount,
  selectedPit,
  winner,
  gamePlay,
  extraTurn,
  difficulty;

const infoPane = document.querySelector(`#info-pane`);
const playerPane = document.querySelector(`#player-pane`);
const gameBoard = document.querySelector(`#game-board`);
let playTurnBtn, playAgainBtn, coinTossBtn, newGameBtn;

class GameScene {
  constructor() {
    this.players = {
      player1: {
        name: `Player 1`,
        homePit: 0,
        homePitPosition: 7,
        coinSideTossed: ``,
        playerPane: document.querySelector(`#player1-pane`),
        pitSelected: document.querySelector(`#player1-pit-info`),
        stonesSelected: document.querySelector(`#player1-stone-count`),
        boardPitPositions: [1, 2, 3, 4, 5, 6],
      },
      player2: {
        name: `Player 2`,
        homePit: 0,
        coinSideTossed: ``,
        homePitPosition: 14,
        playerPane: document.querySelector(`#player2-pane`),
        pitSelected: document.querySelector(`#player2-pit-info`),
        stonesSelected: document.querySelector(`#player2-stone-count`),
        boardPitPositions: [8, 9, 10, 11, 12, 13],
      },
    };
    this.player1 = this.players.player1;
    this.player2 = this.players.player2;
    this.boardPosition = function (position, oppositeSide) {
      let player =
        position <= this.player1.homePitPosition ? `player1` : `player2`;
      return oppositeSide === true
        ? this.player2.homePitPosition - position
        : player;
    };
  }
}

const coinToss = () => {
  return Math.ceil(Math.random() * 2) === 1 ? `Heads` : `Tails`;
};

const setPlayerParams = () => {
  Object.keys(gamePlay.players).forEach((item) => {
    gamePlay[item].homePit = homePitStones[gamePlay[item].homePitPosition];
    document.getElementById(gamePlay[item].homePitPosition).innerHTML =
      homePitStones[gamePlay[item].homePitPosition];
    gamePlay[item].stonesSelected.innerHTML = gamePlay[item].homePit;
    gamePlay[item].playerPane.children[0].innerHTML = gamePlay[item].name;
    gamePlay[item].pitSelected.innerHTML = `Home Pit`;
  });
};

const pitTainted = (position, init) => {
  let oppositePlayer = turn === `player1` ? `player2` : `player1`;
  if (
    init === true &&
    (position === gamePlay.player1.homePitPosition ||
      position === gamePlay.player2.homePitPosition)
  )
    return true;
  if (position === gamePlay[oppositePlayer].homePitPosition) return true;
  delete oppositePlayer;
  return selectedPit ? position === selectedPit : false;
};

const initialPitStones = () => {
  for (let i = 1; i <= gamePlay.player2.homePitPosition; i++) {
    if (pitTainted(i, true)) continue;
    for (let j = 0; j < difficulty; j++) {
      boardStones.add(i);
    }
  }
};

const playTurn = (position) => {
  selectedPit = position;
  let dropPosition,
    stones = boardStones.collect(position);
  position === gamePlay.player2.homePitPosition
    ? (dropPosition = 1)
    : (dropPosition = position + 1);
  if (stones === 0) {
    createMessage(`That pit has no stones. Select another.`);
    return;
  }
  while (stones > 0) {
    if (pitTainted(dropPosition)) {
      dropPosition === gamePlay.player2.homePitPosition
        ? (dropPosition = 1)
        : dropPosition++;
      continue;
    }
    if (
      dropPosition === gamePlay.player1.homePitPosition ||
      dropPosition === gamePlay.player2.homePitPosition
    ) {
      homePitStones.add(dropPosition);
      stones--;
    } else {
      boardStones.add(dropPosition);
      stones--;
    }
    dropPosition === gamePlay.player2.homePitPosition
      ? (dropPosition = 1)
      : dropPosition++;
  }
  setPlayerParams();
  dropPosition = checkState(dropPosition);
  turnCount++;
  if (gameOver()) return;
  switchTurn();
  return dropPosition;
};

const checkState = (position) => {
  let turnState =
    position === 1 ? gamePlay.player2.homePitPosition : position - 1;
  if (
    turnState === gamePlay.player1.homePitPosition ||
    turnState === gamePlay.player2.homePitPosition
  ) {
    extraTurn = true;
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
  return turnState;
};

const checkForWinner = () => {
  let pitCount = 0,
    stones = 0;
  pitCount = gamePlay.player1.boardPitPositions.reduce((accumulator, item) => {
    return (accumulator =
      boardStones[item] === 0 ? accumulator + 1 : accumulator);
  }, 0);
  if (pitCount === gamePlay.player1.boardPitPositions.length) {
    gamePlay.player2.boardPitPositions.forEach((item) => {
      if (gamePlay.player2.homePitPosition !== item) {
        stones += boardStones.collect(item);
        console.log(`Collected ${stones} to end the game. Position ${item}.`);
      }
    });
    for (let i = 0; i < stones; i++) {
      homePitStones.add(gamePlay.player2.homePitPosition);
    }
  } else {
    pitCount = 0;
  }
  pitCount = gamePlay.player2.boardPitPositions.reduce((accumulator, item) => {
    return (accumulator =
      boardStones[item] === 0 ? accumulator + 1 : accumulator);
  }, 0);
  if (pitCount === gamePlay.player2.boardPitPositions.length) {
    gamePlay.player1.boardPitPositions.forEach((item) => {
      if (gamePlay.player1.homePitPosition !== item) {
        stones += boardStones.collect(item);
        console.log(`Collected ${stones} to end the game. Position ${item}.`);
      }
    });
    for (let i = 0; i < stones; i++) {
      homePitStones.add(gamePlay.player1.homePitPosition);
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

const togglePlayAgain = (remove) => {
  if (remove === `remove`) {
    document.querySelector(`#play-again`).remove();
    document.querySelectorAll(`.player-info`).forEach((item) => {
      item.removeAttribute(`style`);
      item.classList.add(`pane-resize`);
    });
    return;
  }
  document.querySelectorAll(`.board-pit`).forEach((item) => {
    item.removeAttribute(`style`);
  });
  document.querySelectorAll(`.play-turn-btn`).forEach((item) => {
    item.remove();
  });
  document.querySelectorAll(`.player-info`).forEach((item) => {
    item.style.height = `20vmin`;
    item.classList.remove(`pane-resize`);
  });
  playAgainBtn = document.createElement(`DIV`);
  playAgainBtn.innerHTML = `Play Again?`;
  playAgainBtn.classList.add(`play-again`);
  playAgainBtn.id = `play-again`;
  playerPane.appendChild(playAgainBtn);
  playAgainBtn.setAttribute(`tabindex`, 0);
  playAgainBtn.addEventListener(`click`, handleClick);
};

const gameOver = () => {
  let gameState = checkForWinner();
  if (gameState) {
    switch (gameState) {
      case `Tie`:
        createMessage(`It's a tie!`);
        break;
      default:
        createMessage(`${gamePlay[gameState].name} Wins!`);
        break;
    }
    togglePlayAgain();
  } else {
    return false;
  }
};

const createMessage = (msg, position) => {
  infoPane.innerHTML = msg;
};

const togglePit = (position, reset) => {
  if (winner) return;
  document.querySelectorAll(`.board-pit`).forEach((item) => {
    item.removeAttribute(`style`);
    currentPlayerPits();
  });
  if (!reset)
    document.getElementById(position).style.border = `var(--selected-pit)`;
};

const switchTurn = () => {
  if (winner) return;
  if (extraTurn) {
    createMessage(`Landed on your home pit. You get an extra turn.`);
    extraTurn = false;
  } else {
    turn = turn === `player1` ? `player2` : `player1`;
    createMessage(`${gamePlay[turn].name}'s turn. Play from a dotted pit.`);
  }
  createPlayerBtn();
  setPlayerParams();
  togglePit(0, true);
  return turn;
};

const pitSelect = (position) => {
  playTurnBtn = document.querySelector(`#play-turn-btn`);
  gamePlay[turn].pitSelected.innerHTML = `Pit ${position} Selected`;
  gamePlay[turn].stonesSelected.innerHTML = `${boardStones[position]}`;
  gamePlay[turn].boardPitPositions.indexOf(position) === -1
    ? playTurnBtn
      ? (playTurnBtn.disabled = true)
      : playTurnBtn
    : playTurnBtn
    ? (playTurnBtn.disabled = false)
    : playTurnBtn;
  playTurnBtn ? (playTurnBtn.dataset.pit = position) : playTurnBtn;
};

const createPits = () => {
  clearCurrentPits();
  Object.keys(gamePlay.players)
    .reverse()
    .forEach((player) => {
      let boardPitPos =
        player === `player2`
          ? gamePlay[player].boardPitPositions.reverse()
          : gamePlay[player].boardPitPositions;
      boardPitPos.forEach((item) => {
        let pit = document.createElement(`DIV`);
        pit.classList.add(`board-pit`, player, `pit`);
        pit.setAttribute(`tabindex`, item);
        pit.setAttribute(`id`, item);
        document.querySelector(`#board-${player}`).appendChild(pit);
      });
      let homePit = document.createElement(`DIV`);
      homePit.setAttribute(`id`, gamePlay[player].homePitPosition);
      homePit.classList.add(`home-pits`, `${player}-home-pit`, `pit`);
      homePit.setAttribute(`tabindex`, gamePlay[player].homePitPosition);
      homePit.innerText = 0;
      document.querySelector(`#game-board`).appendChild(homePit);
    });
};

const updatePit = (position) => {
  let strPosition = position.toString();
  if (
    position === gamePlay.player1.homePitPosition ||
    position === gamePlay.player2.homePitPosition
  ) {
    document.getElementById(strPosition).innerHTML = homePitStones[position];
  } else {
    let pitStones = document.getElementById(strPosition).childNodes;
    if (pitStones) {
      document.getElementById(strPosition).childNodes.forEach((item) => {
        item.style.height = 0;
        item.style.width = 0;
      });
    }
    setTimeout(function () {
      document.getElementById(strPosition).innerHTML = ``;
      for (let i = 0; i < boardStones[position]; i++) {
        let newStone = document.createElement(`DIV`);
        newStone.classList.add(`stone`);
        document.getElementById(strPosition).appendChild(newStone);
        setTimeout(function () {
          newStone.style.height = `var(--stone-size)`;
          newStone.style.width = `var(--stone-size)`;
        }, 200);
      }
    }, 500);
  }
  delete strPosition;
};

// creates the play turn button
const createPlayerBtn = (type) => {
  document.querySelectorAll(`.player-btn`).forEach((item) => {
    item.remove();
  });
  if (type === `toss` && turnCount === -1) {
    coinTossBtn = document.createElement(`BUTTON`);
    coinTossBtn.classList.add(
      `coin-toss-btn`,
      `btn`,
      `btn-success`,
      `player-btn`
    );
    coinTossBtn.setAttribute(`id`, `coin-toss-btn`);
    coinTossBtn.innerHTML = `Coin Toss`;
    gamePlay[turn].playerPane.appendChild(coinTossBtn);
    coinTossBtn.addEventListener(`click`, handleClick);
  } else {
    playTurnBtn = document.createElement(`BUTTON`);
    playTurnBtn.classList.add(`play-turn-btn`, `btn`, `btn-dark`, `player-btn`);
    playTurnBtn.setAttribute(`id`, `play-turn-btn`);
    playTurnBtn.setAttribute(`disabled`, true);
    playTurnBtn.innerHTML = `Play Turn`;
    gamePlay[turn].playerPane.appendChild(playTurnBtn);
    playTurnBtn.addEventListener(`click`, handleClick);
  }
};

const currentPlayerPits = () => {
  document.querySelectorAll(`.${turn}`).forEach((item) => {
    item.style.borderStyle = `dotted`;
  });
};

const handleClick = (e) => {
  let numPosition = Number(e.target.id);
  if (e.target.classList.contains(`board-pit`)) {
    if (winner) return;
    togglePit(numPosition);
    pitSelect(numPosition);
  } else if (e.target.id === `play-turn-btn`) {
    if (winner) return;
    playTurn(Number(e.target.dataset.pit));
  } else if (e.target.id === `play-again`) {
    togglePlayAgain(`remove`);
    init();
  } else if (e.target.id === `new-game-button`) {
    gamePlay.player1.name = document.getElementById(`player1NameInput`).value;
    gamePlay.player2.name = document.getElementById(`player2NameInput`).value;
    difficulty = document.getElementById(`difficulty`).value;
    initialPitStones();
    setPlayerParams();
    toggleStartDialog(`remove`);
    createMessage(`Do a coin toss to choose the first player.`);
  } else if (e.target.id === `coin-toss-btn`) {
    let coinSide = coinToss();
    gamePlay[turn].pitSelected.innerHTML = `Rolled ${coinSide}`;
    gamePlay[turn].coinSideTossed = coinSide;
    if (gamePlay.player1.coinSideTossed && gamePlay.player2.coinSideTossed) {
      if (
        Object.is(
          gamePlay.player1.coinSideTossed,
          gamePlay.player2.coinSideTossed
        )
      ) {
        createMessage(`Rolled the same side. Try again.`);
        delete gamePlay.player1.coinSideTossed;
        delete gamePlay.player2.coinSideTossed;
        turn = `player1`;
        createPlayerBtn(`toss`);
      } else {
        gamePlay.player1.coinSideTossed === `Heads`
          ? (turn = `player1`)
          : (turn = `player2`);
        createMessage(`${gamePlay[turn].name} starts. Play from a dotted pit.`);
        createPlayerBtn();
        currentPlayerPits();
        turnCount = 0;
      }
    } else if (
      !gamePlay.player1.coinSideTossed ||
      !gamePlay.player2.coinSideTossed
    ) {
      turn = turn === `player1` ? `player2` : `player1`;
      createPlayerBtn(`toss`);
      createMessage(`${gamePlay[turn].name}'s coin toss.`);
    }
  }
};

// clear the current pits if any exists
const clearCurrentPits = () => {
  if (document.querySelector(`.pit`)) {
    document.querySelectorAll(`.pit`).forEach((item) => {
      item.remove();
    });
  }
};

const renderPlayerPane = () => {
  createPlayerBtn(`toss`);
};

const createPitStones = () => {
  Object.keys(gamePlay.players).forEach((item) => {
    gamePlay[item].boardPitPositions.forEach((position) => {
      boardStones[position] = 0;
    });
    homePitStones[gamePlay[item].homePitPosition] = 0;
  });
};

const renderBoard = () => {
  boardStones = {
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
    add: function (position) {
      this[position] = this[position] + 1;
      updatePit(position);
      return this[position];
    },
  };
  createPits();
  createPitStones();
  (turnCount = -1),
    (selectedPit = ``),
    (winner = ``),
    (difficulty = 6),
    (turn = `player1`);
  setPlayerParams();
  toggleStartDialog();
};

const toggleStartDialog = (remove) => {
  if (document.getElementById(`start-dialog`) && remove === `remove`) {
    document.getElementById(`start-dialog`).remove();
    document.querySelector(`#player1-pane`).removeAttribute(`style`);
    document.querySelector(`#player2-pane`).removeAttribute(`style`);
  } else {
    let dialogElements = {};
    dialogElements.container = document.createElement(`DIV`);
    dialogElements.container.classList.add(`start-dialog`);
    dialogElements.container.setAttribute(`id`, `start-dialog`);
    Object.keys(gamePlay.players).forEach((player) => {
      dialogElements[`${player}Name`] = document.createElement(`INPUT`);
      dialogElements[`${player}Name`].setAttribute(
        `value`,
        gamePlay[player].name
      );
      dialogElements[`${player}Name`].setAttribute(`id`, `${player}NameInput`);
      dialogElements[`${player}Name`].addEventListener(`click`, handleInput);
      dialogElements[`${player}Name`].addEventListener(`focusout`, handleInput);
    });
    dialogElements.difficultyLabel = document.createElement(`LABEL`);
    dialogElements.difficultyLabel.for = `difficulty`;
    dialogElements.difficultyLabel.id = `difficulty-label`;
    dialogElements.difficultyLabel.innerText = `Difficulty`;
    dialogElements.difficulty = document.createElement(`SELECT`);
    dialogElements.difficulty.id = `difficulty`;
    dialogElements.difficulty.name = `difficulty`;
    dialogElements.difficultyOptions = [3, 4, 5, 6, 7, 8, 9, 10];
    dialogElements.difficultyOptions.forEach((item) => {
      let option = document.createElement(`OPTION`);
      option.setAttribute(`value`, item);
      if (Object.is(item, difficulty)) option.setAttribute(`selected`, ``);
      option.innerHTML = item;
      dialogElements.difficulty.add(option);
    });
    dialogElements.startButton = document.createElement(`BUTTON`);
    dialogElements.startButton.id = `new-game-button`;
    dialogElements.startButton.innerText = `Start A New Game`;
    dialogElements.startButton.classList.add(
      `new-game-button`,
      `btn`,
      `btn-primary`
    );
    dialogElements.container.appendChild(dialogElements.player1Name);
    dialogElements.container.appendChild(dialogElements.player2Name);
    dialogElements.container.appendChild(dialogElements.difficultyLabel);
    dialogElements.container.appendChild(dialogElements.difficulty);
    dialogElements.container.appendChild(dialogElements.startButton);
    document.querySelector(`#player1-pane`).style.display = `none`;
    document.querySelector(`#player2-pane`).style.display = `none`;
    playerPane.appendChild(dialogElements.container);
    newGameBtn = document.querySelector(`#new-game-button`);
    newGameBtn.addEventListener(`click`, handleClick);
    delete dialogElements;
  }
};
const handleInput = (e) => {
  if (
    e.target.tagName === `INPUT` &&
    e.target.parentNode.id === `start-dialog`
  ) {
    e.type === `click` &&
    (e.target.value === `Player 1` || e.target.value === `Player 2`)
      ? (e.target.value = ``)
      : e.target.value;
    e.type === `focusout` && !e.target.value ? (e.target.value =
          e.target.id === `player1NameInput` ? `Player 1` : `Player 2`)
      : e.target.value;
  }
};

const init = () => {
  gamePlay = new GameScene();
  renderBoard();
  renderPlayerPane();
};

init();

gameBoard.addEventListener(`click`, handleClick);
