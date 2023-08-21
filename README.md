# Mancala
## A Browser-Based Implementation
Mancala is a game that was created over 3000 years ago in Africa. The intention of gameplay is to have the most number of stones collected by the end of the game. There are two sides, one for each player. The game ends after all the pits on one player's side are empty.

A coin is rolled at the beginning of the game to determine who starts it. The game starts when a player collects all the stones in one pit on their side, and distributes one in each subsequent pit including their home pit, but excluding their opponent's home pit and the pit that they started the turn from. If they land on an empty pit on their side, they take all the stones on the opposite side of the board and add it to their home pit.

### Wireframes
Included with the repository in the wireframes directory.

### Frameworks and libraries used
- Bootstrap
- jQuery
- Google Fonts

### Pseudocode for game play
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
