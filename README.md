# Mancala
## A Browser-Based Implementation
Mancala is a game that was created over 3000 years ago in Africa. The intention of gameplay is to have the most number of stones collected by the end of the game. There are two sides, one for each player. The game ends after all the pits on one player's side are empty.

A coin is rolled at the beginning of the game to determine who starts it. The game starts when a player collects all the stones in one pit on their side, and distributes one in each subsequent pit including their home pit, but excluding their opponent's home pit and the pit that they started the turn from. If they land on an empty pit on their side, they take all the stones on the opposite side of the board and add them to their home pit.

### Technologies Used
- HTML
- CSS
- Javascript

### Wireframes
Included with the repository in the wireframes directory.

### Getting Started
Deployed on [Github Pages](https://gokepelemo.github.io/mancala). Simply enter the names of your players and start.

### Screenshots
#### Animated
<img src="/imgs/mancala-screencapture.gif" alt="Screen Capture" width="500" />

#### Start Game Dialog
<img src="/imgs/screenshot-start.png" width="500" alt="Start View" />

#### Coin Toss
<img src="/imgs/screenshot-cointoss.png" alt="Coin Toss View" width="500" />

#### Game Play
<img src="/imgs/screenshot-gameplay.png" alt="Gameplay View" width="500" />


### Pseudocode
1. Define required constants:
    - boardConfig: Set to the number of pits on the board.
2. Define variables used to track state:
    - homePitStones: Set to stones in home pits.
    - boardStones: Set to stones in other board pits.
    - turn: Set to the player whose turn it currently is.
    - turnCount: Set to the number of turns that have been completed.
    - selectedPit: Set to the pit that started the current turn so that it is tainted.
    - winner: Set to the winner of the game.
    - extraTurn: Set to true/false when the current player gets an extra turn.
    - difficulty: Set to the difficulty level of the game.
3. Cache DOM elements:
    - infoPane: Information panel above the game board.
    - playerPane: Information panel below the game board.
    - gameBoard: The entire game board.
    - playTurnBtn: Play turn button.
    - playAgainBtn: Play again button.
    - coinTossBtn: Coin toss button.
    - newGameBtn: Start a new game button.
4. Classes:
    - GameScene: Contains the properties for each player on the scene and utility functions for the players and game board.
      - name: The name of each player.
      - homePit: Number of stones in their home pit.
      - coinSideTossed: The coin side they tossed at the beginning of the game.
      - homePitPosition: The position of their home pit in board configuration. Player 1 at the middle of the board, Player 2 at the end of the board.
      - playerPane: The DOM element containing game play information.
      - pitSelected: The DOM element containing the pit that they have currently selected.
      - stonesSelected: The DOM element containing the number of stones in the pit that they have selected.
      - boardPitPositions: An array of the board pits that the player owns and can play from.
      - boardPosition: A function that accepts a pit position parameter and returns the owner of the pit, or the pit position of the opposite side of the board if a second oppositeSide parameter is set to true.

#### Functions
5. On loading the application:
    - init(): Render game preferences and start new game.
      - renderBoard(): Add board elements to the DOM with the boardConfig object.
        - clearGameBoard(): Board pits are removed.
        - createPits(): New board pits are created.
        - boardStones object properties are set to zero.
        - homePitStones object properties are set to zero.
        - Information panel requests player names and difficulty level.
        - Player panes are created.
      - renderPlayerPane(): Coin toss and play turn buttons are added to the player pane.
6. On selecting a pit:
    - pitSelect(): Handle player selecting a pit.
      - Dataset for the play turn element is updated.
      - Player pane is updated with the stones in that pit.
7. Handle player playing a turn:
    - playTurn():
      - The selected pit is set to zero and stones in the pit are collected for distribution.
      - The selected pit is 'tainted' so that stones cannot be added to it for that turn.
      - The stones are distributed on each subsequent pit until zero.
        - After board pit 6 or 13, a stone is dropped in the current player's home pit before distributing to the rest of the board pits. Opposite player's home pit is skipped during the turn.
    - checkState():
      - If the last pit is a home pit, current player plays again.
      - If the last pit is empty and on the current player's side, all the opponent's stones on the opposite pit are added to the current player's home pit.
      - If all the pits on any of the game board sides are empty, stones are collected and added to the respective player's home pit and the gameOver() function is called.
    - gameOver():
      - If all the pits on both sides are empty, the winner variable is set to the owner of the home pit with the highest number of stones.
      - Player panes are updated with the final information, and the Play Again button is rendered.

#### Gameplay Description
1. The players enter their names and select a difficulty level for the gameplay.
2. Their difficulty level determines the number of stones in each pit.
3. The game starts with the same number of stones in each pit and empty home pits.
4. A coin toss at the beginning determines the player who starts the game. 
5. A pit is selected by the current player from their side and its stones are distributed to each pit sequentially in a counter-clockwise direction excluding the opponent's home pit and the pit that they selected on that turn. This happens on each turn.
6. When the player's last stone is dropped on an empty pit on their side of the board excluding the pit that they selected on that turn, stones are added from the opponent's side to their home pit.
7. When the player's last stone is dropped on their home pit, they get an extra turn.
8. Game play ends when all the pits on either side of the board excluding the home pits are empty.
9. All the stones on the opponent's side are added to their home pit.
10. The player with the highest number of stones in their home pit is declared the winner. 

#### Next Steps
- Refactoring
- Remote opponent
