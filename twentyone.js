const readline = require('readline-sync');
const PLAYERS = ['player', 'dealer'];
const WINNING_SCORE = 5;
const UNKNOWN = ['?', '?'];
const CARD = 1;
const SUITS = ['H', 'D', 'C', 'S']; //hearts, diamonds, clubs, spades
const CARD_VALUES = [2, 3, 4, 5, 6, 7,
  8, 9, 10, 'J', 'Q', 'K', 'A'];
let deck;
let hands;
let playerScore;
let dealerScore;
let max;
let dealerCuttoff;

function prompt(msg) {
  console.log(`=> ${msg}`);
}

function singleCard(card) {
  if (card === 10) {
    return `+-----+\n|     |\n|  ${card} |\n|     |\n+-----+`;
  } else {
    return `+-----+\n|     |\n|  ${card}  |\n|     |\n+-----+`;
  }
}

function displayAllCards(hand) { //takes array of sub arrays

  for (let card = 0; card < hand.length; card++) {
    console.log(singleCard(hand[card][CARD]));
  }
}

function shuffleDeck(deck) {
  for (let index = deck.length - 1; index > 0; index -= 1) {
    let otherIndex = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[otherIndex]] = [deck[otherIndex], deck[index]];
  }
}

function initializeDeck() { // [[suit, value], [suit, value], ....];
  let deck = [];
  let cardValue = [];

  for (let suit = 0; suit < SUITS.length; suit += 1) {
    for (let value = 0; value < CARD_VALUES.length; value += 1) {
      cardValue[0] = SUITS[suit];
      cardValue[1] = CARD_VALUES[value];
      deck.push([cardValue[0], cardValue[1]]);
    }
  }

  return deck;
}

function drawFromDeck(deck) {
  return deck.pop();
}

function hit(deck, hands, currentPlayer) {
  hands[currentPlayer].push(drawFromDeck(deck));
}

function startingDeal(deck, hands) {
  while (deck.length > 48) {
    for (let index = 0; index < PLAYERS.length; index += 1) {
      hit(deck, hands, PLAYERS[index]);
    }
  }
}

function hideDealersCard(hand) { //takes dealers hand
  let cardHidden = hand.slice();
  cardHidden[1] = UNKNOWN;

  return cardHidden; //copy of actual hand
}

function addCards(hand) {
  let currentSum = 0;
  hand = sortAces(hand);

  for (let card = 0; card < hand.length; card += 1) {
    let value = hand[card][CARD];

    if (!['J', 'Q', 'K', 'A'].includes(value)) currentSum += value;
    if (['J', 'Q', 'K'].includes(value)) currentSum += 10;
    if (value === 'A' && currentSum + 11 <= max) {
      currentSum += 11;
    } else if (value === 'A' && currentSum + 11 > max) {
      currentSum += 1;
    }
  }

  return currentSum;
}

function sortAces(hand) {
  let subsWithAces = [];
  let noAces = hand.filter(subArray => subArray[1] !== 'A');

  for (let card = 0; card < hand.length; card += 1) {
    if (hand[card][CARD] === 'A') subsWithAces.push(hand[card]);
  }

  return noAces.concat(subsWithAces);
}

function hitOrStay(deck, hand, currentPlayer) {
  prompt('Would you like to hit or stay? (h/s) ');
  let move = readline.question().toLowerCase().trim();

  while (!['h', 's'].includes(move)) {
    prompt('That is not a valid move. Hit or Stay? (h/s)');
    move = readline.question().toLowerCase().trim();
  }

  if (move === 'h') hit(deck, hand, currentPlayer);
  if (move === 's') return 's';
}

function dealerHits(deck, hand, currentPlayer) {
  if (addCards(hand[currentPlayer]) < dealerCuttoff) {
    hit(deck, hand, currentPlayer);
    return true;
  }

  prompt("Dealer is going to stay.");
  return false;

}

function fullBoardDisplay(dealerHand = hideDealersCard(hands['dealer'])) {
  console.clear();
  prompt('Dealers hand:');
  displayAllCards(dealerHand);
  prompt('Your hand:');
  displayAllCards(hands['player']);
  console.log(`Your Current value: ${addCards(hands['player'])}`);
}

function checkBust(hand, currentPlayer) {
  if (addCards(hand[currentPlayer]) > max) return true;

  return false;
}

function sayWinner() {
  finalHands();

  if (bustWin() === 'player') {
    return 'You bust! Dealer Wins!';
  } else if (bustWin() === 'dealer') {
    return 'Dealer Busted! You Win!';
  }

  if (addCards(hands['player']) > addCards(hands['dealer'])) {
    return 'Congratulations, you Win!';
  } else if (addCards(hands['player']) < addCards(hands['dealer'])) {
    return 'Dealer Wins!';
  } else {
    return 'TIE GAME!';
  }
}

function bustWin() {
  if (checkBust(hands, 'player') === true) return 'player';
  if (checkBust(hands, 'dealer') === true) return 'dealer';

  return false;
}

function finalHands() {
  prompt('Final hands:');
  console.log(`Dealer: ${addCards(hands['dealer'])}`);
  console.log(`You: ${addCards(hands['player'])}`);
}

function addPoints() {
  switch (bustWin()) {
    case 'player': return 'dealer';
    case 'dealer': return 'player';
    default: break;
  }

  if (addCards(hands['player']) > addCards(hands['dealer'])) {
    return 'player';
  } else if (addCards(hands['player']) < addCards(hands['dealer'])) {
    return 'dealer';
  }

  return null;
}

while (true) {
  playerScore = 0;
  dealerScore = 0;

  console.clear();
  console.log('*Best played on full screen');

  while (true) {
    deck = initializeDeck();
    hands = {
      dealer: [],
      player: []
    };

    prompt('Choose a number between 2 - 10. Example: 2 = 21, 7 = 71');
    max = Number(readline.question());

    while (![2, 3, 4, 5, 6, 7, 8, 9, 10].includes(max)) {
      prompt('Invalid number. Try again.');
      max = Number(readline.question());
    }

    max = (max * 10) + 1;
    dealerCuttoff = max - 4;

    shuffleDeck(deck);
    startingDeal(deck, hands);

    prompt(`Lets play ${String(max)[0]}1!`);

    let proceed = readline.question("Enter anything to continue...");

    while (true) {
      fullBoardDisplay();
      addCards(hands['player']);

      while (hitOrStay(deck, hands, 'player') !== 's') {
        if (checkBust(hands, 'player') || (addCards(hands['player']) === max)) break;

        fullBoardDisplay();
      }

      fullBoardDisplay();
      if (checkBust(hands, 'player')) break;

      prompt('Dealers turn');
      proceed = readline.question('Enter anything to continue...');

      while (dealerHits(deck, hands, 'dealer') === true) {
        fullBoardDisplay();
        prompt("Dealer is choosing to hit!");
        proceed = readline.question("Enter anything to continue...");

        if (checkBust(hands, 'dealer') || (addCards(hands['dealer']) === max)) break;
      }

      fullBoardDisplay(hands['dealer']);

      break;
    }

    prompt(sayWinner());
    if (addPoints() === 'player') playerScore += 1;
    if (addPoints() === 'dealer') dealerScore += 1;

    prompt('Current Score:');
    console.log(`You: ${playerScore} | Dealer: ${dealerScore}`);

    if (playerScore === WINNING_SCORE || dealerScore === WINNING_SCORE) break;
  }

  if (playerScore > dealerScore) {
    prompt('You Won the Match!');
  } else {
    prompt('Dealer Won the Match!');
  }

  prompt('Would you like to play again? (y/n)');
  let playAgain = readline.question().toLowerCase().trim();

  while (!['y', 'n'].includes(playAgain)) {
    prompt('That is not a valid answer. Please type y or n: ');
    playAgain = readline.question();
  }

  if (playAgain === 'n') break;
}

prompt('Thank you for playing Twenty-One!');
