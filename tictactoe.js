const readline = require('readline-sync');
const PLAYERS = ["player", "computer"];
const MIDDLE_SPACE = 5;
const UNMARKED_SPACE = ' ';
const HUMAN_MARKER = 'X';
const COMPUTER_MARKER = 'O';
const WINNING_SCORE = 5;
const WINNING_LINES = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9], //rows
  [1, 4, 7], [2, 5, 8], [3, 6, 9], //columns
  [1, 5, 9], [3, 5, 7]             //diagonals
];
let SPOT = Math.floor(Math.random() * PLAYERS.length);

function displayScore(playerPoints, compPoints) {
  console.log("---------------------------");
  console.log(`You are ${HUMAN_MARKER}. Computer is ${COMPUTER_MARKER}.`);

  console.log(`Player points: ${playerPoints}`);
  console.log(`Computer points: ${compPoints}`);

  console.log("---------------------------");
}

function displayBoard(board, playerPoints, compPoints) {
  console.clear();

  displayScore(playerPoints, compPoints);

  console.log("");
  console.log('     |     |');
  console.log(`  ${board['1']}  |  ${board['2']}  |  ${board['3']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['4']}  |  ${board['5']}  |  ${board['6']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['7']}  |  ${board['8']}  |  ${board['9']}`);
  console.log('     |     |');

  console.log('');
}


function createNewBoard() { //Initializing board to be all blank spaces
  let board = {};

  for (let square = 1; square <= 9; square += 1) {
    board[String(square)] = UNMARKED_SPACE;
  }

  return board;

}

function prompt(msg) {
  console.log(`=> ${msg}`);
}

function joinOr(array, punc = ", ", beforeLastNum = " or ") {
  if (array.length === 0) return '';
  if (array.length === 1) return array;

  return array.slice(0, array.length - 1).join(punc) +
                                       beforeLastNum +
                                       array[array.length - 1];

}

function emptySquares(board) {
  return Object.keys(board).filter(key => board[key] === UNMARKED_SPACE);
}

function playerChoosesSquare(board) {
  let square;

  while (true) {
    prompt(`Choose a square: ${joinOr(emptySquares(board))}`);
    square = readline.question().trim();

    if (emptySquares(board).includes(square)) break;

    prompt('Invalid choice');

  }
  board[square] = HUMAN_MARKER; //return not needed due to pass by reference distructive change
}

function computerChoosesSquare(board) {
  let square;

  // offensive
  for (let index = 0; index < WINNING_LINES.length; index += 1) {
    let line = WINNING_LINES[index];
    square = findAtRiskSquare(line, board, COMPUTER_MARKER);
    if (square) break;
  }

  // defensive
  if (!square) {
    for (let index = 0; index < WINNING_LINES.length; index += 1) {
      let line = WINNING_LINES[index];
      square = findAtRiskSquare(line, board, HUMAN_MARKER);
      if (square) break;
    }
  }

  if (board[MIDDLE_SPACE] === UNMARKED_SPACE) square = MIDDLE_SPACE;

  //random
  if (!square) {
    let randomIndex = Math.floor(Math.random() * emptySquares(board).length);
    square = emptySquares(board)[randomIndex];
  }

  board[square] = COMPUTER_MARKER;
}

function findAtRiskSquare(line, board, marker) {
  let markersInLine = line.map(square => board[square]);

  if (markersInLine.filter(value => value === marker).length === 2) {
    let unusedSquare = line.find(square => board[square] === UNMARKED_SPACE);
    if (unusedSquare !== undefined) {
      return unusedSquare;
    }
  }

  return null;
}

function boardFull(board) { //if array from emptySquares has no elements
  return emptySquares(board).length === 0;
}

function detectWinner(board) {

  for (let line = 0; line < WINNING_LINES.length; line++) {
    let [ sq1, sq2, sq3 ] = WINNING_LINES[line];

    if (
      board[sq1] === HUMAN_MARKER &&
      board[sq2] === HUMAN_MARKER &&
      board[sq3] === HUMAN_MARKER
    ) {
      return 'Player';
    } else if (
      board[sq1] === COMPUTER_MARKER &&
      board[sq2] === COMPUTER_MARKER &&
      board[sq3] === COMPUTER_MARKER
    ) {
      return 'Computer';
    }
  }

  return null;
}

function someoneWon(board) {
  return !!detectWinner(board);
}

function matchWinner(player, comp, playerPoints, compPoints) {
  if (playerPoints > compPoints) {
    prompt(`${player} wins the Match!`);
  } else {
    prompt(`${comp} wins the Match!`);
  }
}

function currentPlayerChooses(board, currentPlayer) {
  if (currentPlayer === 'player') {
    playerChoosesSquare(board);
  } else {
    computerChoosesSquare(board);
  }
}

///////////
//Game code below
//////////
while (true) {
  let scoreBoard = {
    Player: 0,
    Computer: 0
  };

  while (!Object.values(scoreBoard).includes(WINNING_SCORE)) {
    prompt("Would you like to choose who goes first? (y/n)");
    let chooseFirst = readline.question().toLowerCase().trim();

    while (!['y', 'n', 'yes', 'no'].includes(chooseFirst)) {
      prompt('Invalid choice, please select yes or no (y/n)');
      chooseFirst = readline.question().toLowerCase().trim();
    }

    if (['y', 'yes'].includes(chooseFirst)) {
      prompt('Would you like to go first? (y/n)');
      let chooseFirstTurnPlayer = readline.question().toLowerCase().trim();

      while (!['y', 'n', 'yes', 'no'].includes(chooseFirstTurnPlayer)) {
        prompt('Invalid choice, please select yes or no (y/n)');
        chooseFirstTurnPlayer = readline.question().toLowerCase().trim();
      }

      if (['y', 'yes'].includes(chooseFirstTurnPlayer)) {
        SPOT = 0;
      } else if (['n', 'no'].includes(chooseFirstTurnPlayer)) {
        SPOT = 1;
      }
    }

    while (!Object.values(scoreBoard).includes(WINNING_SCORE)) { //turn loop
      let board = createNewBoard();

      while (true) {
        displayBoard(board, scoreBoard['Player'], scoreBoard['Computer']);
        currentPlayerChooses(board, PLAYERS[SPOT]);
        if (someoneWon(board) || boardFull(board)) break;
        if (SPOT === 1) {
          SPOT = 0;
        } else {
          SPOT = 1;
        }
      }

      if (someoneWon(board)) {
        prompt(`${detectWinner(board)} won!`);
        if (detectWinner(board) === 'Player') {
          scoreBoard['Player'] += 1;
          SPOT = 1;
        } else if (detectWinner(board) === 'Computer') {
          scoreBoard['Computer'] += 1;
          SPOT = 0;
        }
      }

      displayBoard(board, scoreBoard['Player'], scoreBoard['Computer']);
    }
  }

  matchWinner(HUMAN_MARKER, COMPUTER_MARKER, scoreBoard['Player'], scoreBoard['Computer'] );

  prompt('Would you like to play again? (y/n)');
  let again = readline.question().trim().toLowerCase();

  while (!['y', 'n', 'yes', 'no'].includes(again)) {
    prompt('Invalid choice, please select y or n');
    again = readline.question().toLowerCase().trim();
  }

  if (!['y', 'yes'].includes(again)) break;

}

prompt('Thanks for playing Tic-Tac-Toe!');
