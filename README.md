# Mancala
## A Browser-Based Implementation
Mancala is a game that was created over 3000 years ago in Africa. The intention of gameplay is to have the most number of stones collected by the end of the game. There are two sides, one for each player. The game ends after all the pits on one player's side are empty.

A coin is rolled at the beginning of the game to determine who starts it. The game starts when a player collects all the stones in one pit on their side, and distributes one in each subsequent pit including their home pit, but excluding their opponent's home pit and the pit that they started the turn from. If they land on an empty pit on their side, they take all the stones on the opposite side of the board and add them to their home pit.

### Wireframes
Included with the repository in the wireframes directory.

### Technologies used
- HTML
- CSS
- Javascript
- Bootstrap
- jQuery
- Google Fonts

### Pseudocode
1. Define required constants:
    - boardConfig: Set to the number of pits on the board.
2. Define variables used to track state:
    - homePitStones: Set to stones in home pits.
    - boardStones: Set to stones in other board pits.
    - turn: Set to the player whose turn it currently is.
    - turnCount: Set to the number of turns that have been completed.
    - selectedPit: Set to the pit that started the current turn so that it is tainted.
    - playerNames: Set to the custom names selected by players at the beginning, otherwise set to `Player 1`/`Player 2`.
    - winner: Set to the winner of the game.
3. Cache DOM elements:
    - infoPane: Information panel at the top of the game board.
    - playerPane: Information panel at the bottom of the game board.
    - {player1,player2}Pane: Game play information for each player.
    - playTurnBtn: Play Turn button.
    - playAgainBtn: Play Again link.
    - newGameBtn: Start a New Game button.
4. Classes:
    - GameScene: Contains the properties for each player on the scene.

#### Functions
5. On loading the application:
    - init(): Render game preferences and start new game.
      - renderBoard(): Add board elements to the DOM with the boardConfig object.
        - resetBoard(): Set game preferences.
          - homePitStones object properties are set to zero.
          - boardStones object properties are set to zero.
          - Information panel requests player names and difficulty level.
      - renderScores(): Information panel is populated with player details.
6. On selecting a pit:
    - pitSelect(): Handle player selecting a pit.
      - Dataset for the element is updated.
      - Information panel is updated with the stones in that pit.
6. Handle player playing a turn:
    - playTurn():
      - The selected pit is set to zero, and turn object is set with stones to distribute.
      - The selected pit is 'tainted' so that stones cannot be added to it for that turn.
      - The stones are distributed on each pit until zero.
        - After board pit 6 or 12, a stone is dropped in the current player's home pit before distributing to the rest of the board pits.
    - checkState():
      - If the last pit is a home pit, current player plays again.
      - If the last pit is empty and on the current player's side, all the opponent's stones on the opposite pit are added to the current player's home pit.
      - If all the pits on any of the game board sides are empty, stones are collected and added to the respective player's home pit and the gameOver() function is called.
    - gameOver():
      - If all the pits on both sides are empty, the winner variable is set to the owner of the home pit with the highest number of stones.
      - Player panes are updated with the final information, and the Play Again button is rendered.


#### Game play description
1. The players enter their names and select a difficulty level for the gameplay.
2. Their difficulty level determines the number of stones in each pit.
3. The game starts with the same number of stones in each pit and empty home pits.
4. The application randomly chooses the player who starts the game. 
5. A pit is selected by the current player from their side and its stones are distributed to each pit sequentially in a counter-clockwise direction excluding the opponent's home pit and the pit that they selected on that turn. This happens on each turn.
6. When the player's last stone is dropped on an empty pit on their side of the board excluding the pit that they selected on that turn, stones are added from the opponent's side to their home pit.
7. When the player's last stone is dropped on their home pit, they get an extra turn.
8. Game play ends when all the pits on either side of the board excluding the home pits are empty.
9. All the stones on the opponent's side are added to their home pit.
10. The player with the highest number of stones in their home pit is declared the winner. 
