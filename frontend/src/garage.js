// Gonzo's Quest Megaways - Full JavaScript Game Logic with Accurate Gravity Collapse

const reelsContainer = document.getElementById('reels');
const spinButton = document.getElementById('spinButton');
const multiplierDisplay = document.getElementById('multiplier');
const message = document.getElementById('message');

const symbolsList = ['🧱', '🟣', '🟤', '🟡', '🟢', '🔵', '💀', '❓', '🎯'];
const REEL_COUNT = 6;
const MAX_ROWS = 7;
const MIN_ROWS = 3;

let isSpinning = false;
let avalancheCount = 0;
const baseMultipliers = [1, 2, 3, 5];

document.getElementById("spinButton").addEventListener("click", spin);

function randomSymbol() {
  return symbolsList[Math.floor(Math.random() * symbolsList.length)];
}

function createReels() {
  reelsContainer.innerHTML = '';
  for (let i = 0; i < REEL_COUNT; i++) {
    const col = document.createElement('div');
    col.className = 'reel-column';
    const rowCount = Math.floor(Math.random() * (MAX_ROWS - MIN_ROWS + 1)) + MIN_ROWS;
    for (let j = 0; j < rowCount; j++) {
      const symbol = document.createElement('div');
      symbol.className = 'symbol';
      symbol.textContent = randomSymbol();
      symbol.style.top = `${j * 70}px`;
      col.appendChild(symbol);
    }
    reelsContainer.appendChild(col);
  }
}

function checkWin() {
  const cols = Array.from(reelsContainer.children);
  let winFound = false;
  const firstCol = cols[0];
  Array.from(firstCol.children).forEach(symbol => {
    const matchChar = symbol.textContent;
    const path = [symbol];
    for (let i = 1; i < cols.length; i++) {
      const match = Array.from(cols[i].children).find(s => s.textContent === matchChar || s.textContent === '❓');
      if (match) path.push(match);
      else break;
    }
    if (path.length >= 3) {
      winFound = true;
      path.forEach(s => s.classList.add('win'));
    }
  });
  return winFound;
}

function performAvalanche() {
  const columns = Array.from(document.querySelectorAll('.reel-column'));

  columns.forEach(col => {
    let slots = new Array(MAX_ROWS).fill(null);
    Array.from(col.children).forEach(el => {
      const row = parseInt(el.style.top) / 70;
      slots[row] = el;
    });

    // Remove winning symbols
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] && slots[i].classList.contains('win')) {
        col.removeChild(slots[i]);
        slots[i] = null;
      }
    }

    // Gravity collapse
    let pointer = MAX_ROWS - 1;
    for (let i = MAX_ROWS - 1; i >= 0; i--) {
      if (slots[i]) {
        if (i !== pointer) {
          slots[i].style.top = `${pointer * 70}px`;
        }
        slots[pointer] = slots[i];
        pointer--;
      }
    }

    // Fill remaining with new symbols
    for (let i = 0; i <= pointer; i++) {
      const newSym = document.createElement('div');
      newSym.className = 'symbol';
      newSym.textContent = randomSymbol();
      newSym.style.top = `${-70 * (pointer - i + 1)}px`;
      col.appendChild(newSym);
      setTimeout(() => {
        newSym.style.transition = 'top 0.3s ease';
        newSym.style.top = `${i * 70}px`;
      }, 20);
    }
  });
}

function spin() {
  if (isSpinning) return;
  isSpinning = true;
  avalancheCount = 0;
  multiplierDisplay.textContent = 'Multiplier: x1';
  message.textContent = '';
  spinButton.disabled = true;

  createReels();

  setTimeout(() => {
    if (checkWin()) {
      avalancheCount++;
      multiplierDisplay.textContent = `Multiplier: x${baseMultipliers[Math.min(avalancheCount, baseMultipliers.length - 1)]}`;
      message.textContent = '🎉 Win! Starting Avalanche...';
      setTimeout(triggerAvalanche, 800);
    } else {
      message.textContent = '🙈 No win. Try again!';
      isSpinning = false;
      spinButton.disabled = false;
    }
  }, 600);
}

function triggerAvalanche() {
  performAvalanche();
  setTimeout(() => {
    if (checkWin()) {
      avalancheCount++;
      multiplierDisplay.textContent = `Multiplier: x${baseMultipliers[Math.min(avalancheCount, baseMultipliers.length - 1)]}`;
      message.textContent = `💥 Avalanche x${multiplierDisplay.textContent}`;
      setTimeout(triggerAvalanche, 800);
    } else {
      isSpinning = false;
      spinButton.disabled = false;
      message.textContent = '✅ Avalanche complete';
    }
  }, 900);
}