/****** constants ******/
const boardConfig = {
    // pits per player
    boardPits: 6,
    homePits: 1
}

/****** state variables ******/
let homePitStones, boardStones, turn, turnCount, selectedPit, winner

/****** cached DOM elements ******/
const infoPane = document.querySelector("#info-pane")
const playerPane = document.querySelector("#player-pane")

/****** classes ******/
class GameScene {
    constructor() {

    }
}
