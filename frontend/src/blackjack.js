const deck = [];
const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];

let playerHands = [[]];
let activeHandIndex = 0;
let dealerHand = [];

const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');
const splitCards = document.getElementById('split-cards');
const statusText = document.getElementById('status');

function getActiveHand() {
  return playerHands[activeHandIndex];
}

document.getElementById('hit').addEventListener('click', () => {
  getActiveHand().push(drawCard());
  updateHands();
  checkGame();
});

document.getElementById('stand').addEventListener('click', () => {
  if (playerHands.length > 1 && activeHandIndex === 0) {
    activeHandIndex = 1;
    updateHands();
    return;
  }
  dealerPlays();
  updateHands(true);
  checkWinner();
  showRestart();
});

document.getElementById('double').addEventListener('click', () => {
  if (getActiveHand().length === 2) {
    getActiveHand().push(drawCard());
    updateHands(true);
    if (playerHands.length > 1 && activeHandIndex === 0) {
      activeHandIndex = 1;
      updateHands();
    } else {
      dealerPlays();
      updateHands(true);
      checkWinner();
      showRestart();
    }
    disableButtons();
  }
});

document.getElementById('split').addEventListener('click', () => {
  if (canSplit()) {
    const original = playerHands[0];
    playerHands = [
      [original[0], drawCard()],
      [original[1], drawCard()]
    ];
    activeHandIndex = 0;
    document.getElementById('split-cards').style.display = 'flex';
    updateHands();
    document.getElementById('split').style.display = 'none';
  }
});

document.getElementById('restart').addEventListener('click', startGame);

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
  splitCards.innerHTML = '';
  dealerCards.innerHTML = '';

  for (let i = 0; i < playerHands[0].length; i++) {
    const img = document.createElement('img');
    img.src = getCardImage(playerHands[0][i]);
    playerCards.appendChild(img);
  }

  if (playerHands.length > 1) {
    for (let i = 0; i < playerHands[1].length; i++) {
      const img = document.createElement('img');
      img.src = getCardImage(playerHands[1][i]);
      splitCards.appendChild(img);
    }
  }

  for (let i = 0; i < dealerHand.length; i++) {
    const img = document.createElement('img');
    img.src = (i === 0 || showAllDealer) ? getCardImage(dealerHand[i]) : '/img/PNG-cards-1.3/back.png';
    dealerCards.appendChild(img);
  }

  const dealerScore = showAllDealer ? handValue(dealerHand) : handValue([dealerHand[0]]);
  document.getElementById('dealer-score').textContent = `Dealer Shows: ${dealerScore}`;
  document.getElementById('player-score').textContent = `Your Score: ${handValue(getActiveHand())}`;
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
  const value = handValue(getActiveHand());
  if (value > 21) {
    statusText.textContent = `Hand ${activeHandIndex + 1} busted!`;
    if (playerHands.length > 1 && activeHandIndex === 0) {
      activeHandIndex = 1;
      updateHands();
    } else {
      disableButtons();
      dealerPlays();
      updateHands(true);
      checkWinner();
      showRestart();
    }
  }
}

function dealerPlays() {
  while (handValue(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
}

function checkWinner() {
  const dealerVal = handValue(dealerHand);
  let result = '';

  playerHands.forEach((hand, index) => {
    const playerVal = handValue(hand);
    const winStatus =
      playerVal > 21 ? 'Busted' :
      dealerVal > 21 || playerVal > dealerVal ? 'Win' :
      playerVal < dealerVal ? 'Lose' : 'Push';
    result += `Hand ${index + 1}: ${winStatus}. `;
  });

  statusText.textContent = result.trim();
  showRestart();
}

function disableButtons() {
  document.getElementById('hit').disabled = true;
  document.getElementById('stand').disabled = true;
  document.getElementById('double').disabled = true;
  document.getElementById('split').disabled = true;
}

function showRestart() {
  document.getElementById('restart').style.display = 'inline-block';
}

function canSplit() {
  const hand = playerHands[0];
  return hand.length === 2 && hand[0].value === hand[1].value;
}

function startGame() {
  initDeck();
  playerHands = [[drawCard(), drawCard()]];
  dealerHand = [drawCard()];
  activeHandIndex = 0;
  updateHands();
  statusText.textContent = '';

  document.getElementById('hit').disabled = false;
  document.getElementById('stand').disabled = false;
  document.getElementById('double').disabled = false;
  document.getElementById('restart').style.display = 'none';
  document.getElementById('split-cards').style.display = 'none';

  if (canSplit()) {
    document.getElementById('split').style.display = 'inline-block';
    document.getElementById('split').disabled = false;
  } else {
    document.getElementById('split').style.display = 'none';
  }
}

startGame();
