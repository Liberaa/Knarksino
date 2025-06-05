const deck = [];
const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const values = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  'jack', 'queen', 'king', 'ace'
];

let playerHand = [];
let dealerHand = [];

const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart');

document.getElementById('hit').addEventListener('click', () => {
  playerHand.push(drawCard());
  updateHands();
  checkGame();
});

document.getElementById('stand').addEventListener('click', () => {
  dealerPlays();
  updateHands(true);
  checkWinner();
});

restartBtn.addEventListener('click', () => {
  startGame();
});

function initDeck() {
  deck.length = 0;
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  deck.sort(() => Math.random() - 0.5);
}

function drawCard() {
  return deck.pop();
}

function getCardImage(card) {
  return `/img/PNG-cards-1.3/${card.value}_of_${card.suit}.png`;
}

function updateHands(showAllDealer = false) {
  playerCards.innerHTML = '';
  dealerCards.innerHTML = '';

  for (let card of playerHand) {
    const img = document.createElement('img');
    img.src = getCardImage(card);
    playerCards.appendChild(img);
  }

  for (let i = 0; i < dealerHand.length; i++) {
    const img = document.createElement('img');
    if (i === 0 || showAllDealer) {
      img.src = getCardImage(dealerHand[i]);
    } else {
      img.src = '/img/PNG-cards-1.3/back.png'; // optional card back
    }
    dealerCards.appendChild(img);
  }

  document.getElementById('player-score').textContent = `Your Score: ${handValue(playerHand)}`;
  document.getElementById('dealer-score').textContent = showAllDealer
    ? `Dealer Score: ${handValue(dealerHand)}`
    : `Dealer Score: ??`;
}

function handValue(hand) {
  let value = 0;
  let aces = 0;

  for (let card of hand) {
    if (['jack', 'queen', 'king'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'ace') {
      value += 11;
      aces++;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function checkGame() {
  const value = handValue(playerHand);
  if (value > 21) {
    statusText.textContent = "You busted!";
    disableButtons();
    updateHands(true);
    showRestart();
  }
}

function dealerPlays() {
  while (handValue(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
}

function checkWinner() {
  const playerVal = handValue(playerHand);
  const dealerVal = handValue(dealerHand);

  if (dealerVal > 21 || playerVal > dealerVal) {
    statusText.textContent = "You win!";
  } else if (playerVal < dealerVal) {
    statusText.textContent = "Dealer wins.";
  } else {
    statusText.textContent = "Push.";
  }

  disableButtons();
  showRestart();
}

function disableButtons() {
  document.getElementById('hit').disabled = true;
  document.getElementById('stand').disabled = true;
}

function showRestart() {
  restartBtn.style.display = 'inline-block';
}

function startGame() {
  initDeck();
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard()];
  updateHands();
  statusText.textContent = '';
  document.getElementById('hit').disabled = false;
  document.getElementById('stand').disabled = false;
  restartBtn.style.display = 'none';
}

startGame();
