const readline = require('readline-sync');
const PLAYERS = ['player', 'dealer'];
const START_HAND = 2;
const MAX = 21;
const UNKNOWN = ['?', '?'];
const SUIT = 0;
const CARD = 1;
const SUITS = ['H', 'D', 'C', 'S']; //hearts, diamonds, clubs, spades
const CARD_VALUES = [2, 3, 4, 5, 6, 7,
                     8, 9, 10, 'J', 'Q', 'K', 'A'];

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
  let card_value = [];

  for (let suit = 0; suit < SUITS.length; suit += 1) {
    for (let value = 0; value < CARD_VALUES.length; value += 1) {
      card_value[0] = SUITS[suit];
      card_value[1] = CARD_VALUES[value];
      deck.push([card_value[0], card_value[1]]);
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
  let count = 0;
  hand = sortAces(hand);

  for (let card = 0; card < hand.length; card += 1) {
    let value = hand[card][CARD];

    if (!['J', 'Q', 'K', 'A'].includes(value)) currentSum += value;
    if (['J', 'Q', 'K'].includes(value)) currentSum += 10;
    if (value === 'A' && currentSum + 11 > MAX) {
      currentSum += 1;
    } else if (value === 'A' && currentSum + 11 <= MAX) {
      currentSum += 11;
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
  if (move === 's') {
    prompt(`${currentPlayer} chooses to stay.`);
    return move;
  }
}

function dealerHits(deck, hand, currentPlayer) {
  if (addCards(hand[currentPlayer]) < 17) {
    hit(deck, hand, currentPlayer);
    prompt('Dealer Hits!');
    return true;
  }

  prompt('Dealer Stays.');
  return false;

}

function fullBoardDisplay() {
  prompt('Dealers hand:');
  displayAllCards(hideDealersCard(hands['dealer']));
  prompt('Your hand:');
  displayAllCards(hands['player']);
}

function checkBust(hand, currentPlayer) {
  if (addCards(hand[currentPlayer]) >= MAX) return true;

  return false;
}


let deck = initializeDeck();
let hands = {
  dealer: [],
  player: []
};

while (true) {
  prompt('Lets play 21!');
  console.log('');
  shuffleDeck(deck);
  startingDeal(deck, hands);

  while (true) {
    fullBoardDisplay();
    addCards(hands['player']); ///////////////////

    while (hitOrStay(deck, hands, 'player') !== 's') {
      if (checkBust(hands, 'player')) break;
      console.clear();
      fullBoardDisplay();
    }

    if (checkBust(hands, 'player')) break;

    while (dealerHits(deck, hands, 'dealer')) {
      if (checkBust(hands, 'dealer')) break;
      let proceed = readline.question("Enter anything to continue...");
    }



    fullBoardDisplay();



    break;
  }
  break;
}

console.log(hands);
