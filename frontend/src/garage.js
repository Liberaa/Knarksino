""// game.js — Megaway with Balance Integration and Explosions + Accurate Winnings

// DOM Elements
const reelsContainer = document.getElementById('reels');
const spinButton = document.getElementById('spinButton');
const multiplierDisplay = document.getElementById('multiplier');
const message = document.getElementById('message');
const balanceDisplay = document.getElementById('balance');
const betInput = document.getElementById('bet-amount');

// Constants
const REEL_COUNT = 6;
const MIN_ROWS = 2;
const MAX_ROWS = 7;
const COLUMN_HEIGHT_PX = 490;
const BASE_MULTIPLIERS = [1, 2, 3, 5];
const FREE_MULTIPLIERS = [3, 3, 5, 5, 9, 9, 15, 15, 15, 15];

// State
let isSpinning = false;
let avalancheCount = 0;
let freeSpinActive = false;
let freeSpinsLeft = 0;
let balance = 1000;
let currentBet = 0;
let totalWinSymbols = 0;

// Symbols
const WILD_SYMBOL = 'set9.png';
const BONUS_SYMBOL = 'set10.png';
const weightedSymbols = [
  { symbol: 'set1.png', weight: 20 },
  { symbol: 'set2.png', weight: 15 },
  { symbol: 'set3.png', weight: 15 },
  { symbol: 'set4.png', weight: 10 },
  { symbol: 'set5.png', weight: 10 },
  { symbol: 'set6.png', weight: 10 },
  { symbol: 'set7.png', weight: 10 },
  { symbol: 'set8.png', weight: 5 },
  { symbol: WILD_SYMBOL, weight: 1 },
  { symbol: BONUS_SYMBOL, weight: 2 }
];

function updateBalanceDisplay() {
  balanceDisplay.textContent = `$${balance.toFixed(2)}`;
}

function randomSymbol() {
  const total = weightedSymbols.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (let o of weightedSymbols) {
    if (r < o.weight) return `/img/symbols/${o.symbol}`;
    r -= o.weight;
  }
  return `/img/symbols/${weightedSymbols[0].symbol}`;
}

function createReels() {
  reelsContainer.innerHTML = '';
  for (let c = 0; c < REEL_COUNT; c++) {
    const col = document.createElement('div');
    col.className = 'reel-column spinning';
    const rows = MIN_ROWS + Math.floor(Math.random() * (MAX_ROWS - MIN_ROWS + 1));
    col.dataset.rows = rows;
    const h = COLUMN_HEIGHT_PX / rows;
    for (let r = 0; r < rows; r++) {
      const sym = document.createElement('div');
      sym.className = 'symbol';
      const imgSrc = randomSymbol();
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = imgSrc.split('/').pop();
      img.className = 'symbol-img';
      sym.appendChild(img);
      sym.style.height = `${h}px`;
      sym.dataset.height = h;
      sym.dataset.symbol = imgSrc;
      sym.style.top = `${-h * (r + 1)}px`;
      col.appendChild(sym);
      setTimeout(() => {
        sym.style.transition = 'top 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        sym.style.top = `${(rows - 1 - r) * h}px`;
        sym.classList.add('land', 'bounce');
        spawnRubbleParticles(sym);
        setTimeout(() => sym.classList.remove('bounce', 'land'), 600);
      }, 50 + r * 80);
    }
    reelsContainer.appendChild(col);
  }
  setTimeout(() => {
    document.querySelectorAll('.reel-column').forEach(c => c.classList.remove('spinning'));
  }, 800);
}

function clearWins() {
  document.querySelectorAll('.symbol.win').forEach(s => s.classList.remove('win'));
}

function checkWin() {
  clearWins();
  const cols = Array.from(reelsContainer.children);
  let hasWin = false;
  function extendPath(path, colIndex, targetSymbol) {
    const nextCol = cols[colIndex];
    const matches = Array.from(nextCol.children)
      .filter(s => s.dataset.symbol === targetSymbol || s.dataset.symbol === `/img/symbols/${WILD_SYMBOL}`);
    return matches.map(match => [...path, match]);
  }
  totalWinSymbols = 0;
  Array.from(cols[0].children).forEach(start => {
    const startSymbol = start.dataset.symbol;
    const baseCandidates = startSymbol === `/img/symbols/${WILD_SYMBOL}`
      ? Array.from(cols[1].children).map(s => s.dataset.symbol).filter(s => s !== `/img/symbols/${WILD_SYMBOL}`)
      : [startSymbol];
    baseCandidates.forEach(candidate => {
      let paths = [[start]];
      for (let i = 1; i < cols.length; i++) {
        const newPaths = [];
        for (const path of paths) {
          const extensions = extendPath(path, i, candidate);
          newPaths.push(...extensions);
        }
        if (newPaths.length === 0) break;
        paths = newPaths;
      }
      paths.forEach(path => {
        if (path.length >= 3) {
          hasWin = true;
          path.forEach(s => s.classList.add('win'));
          totalWinSymbols += path.length;
        }
      });
    });
  });
  return hasWin;
}

function checkBonusTrigger() {
  const cols = Array.from(reelsContainer.children);
  return [0, 1, 2].every(i =>
    Array.from(cols[i].children).some(s => s.dataset.symbol === `/img/symbols/${BONUS_SYMBOL}`)
  );
}

function startFreeSpins() {
  freeSpinActive = true;
  freeSpinsLeft = 10;
  message.textContent = '🎁 Bonus! 10 Free Spins!';
}

function showWinAmount(amount) {
  const winEl = document.createElement('div');
  winEl.className = 'win-display';
  winEl.textContent = `+ $${amount.toFixed(2)} WIN!`;
  message.appendChild(winEl);
  setTimeout(() => winEl.remove(), 2500);
}


function freeMultiplier() {
  const idx = 10 - freeSpinsLeft;
  return FREE_MULTIPLIERS[Math.min(idx, FREE_MULTIPLIERS.length - 1)];
}

function explodeSymbol(symbol) {
  const img = symbol.querySelector('img');
  if (img) img.style.display = 'none';
  const count = 18;
  const parent = symbol.parentElement;
  for (let i = 0; i < count; i++) {
    const frag = document.createElement('div');
    frag.className = 'symbol-fragment';
    frag.style.background = ['#bbb', '#999', '#777'][Math.floor(Math.random() * 3)];
    const dx = (Math.random() - 0.5) * 120;
    const dy = (Math.random() - 0.5) * 80;
    frag.style.left = `${symbol.offsetLeft + symbol.offsetWidth / 2}px`;
    frag.style.top = `${symbol.offsetTop + symbol.offsetHeight / 2}px`;
    frag.style.setProperty('--dx', `${dx}px`);
    frag.style.setProperty('--dy', `${dy}px`);
    parent.appendChild(frag);
    setTimeout(() => frag.remove(), 800);
  }
  parent.classList.add('shake');
  setTimeout(() => parent.classList.remove('shake'), 300);
}

function performAvalanche() {
  document.querySelectorAll('.reel-column').forEach(col => {
    const rows = parseInt(col.dataset.rows, 10);
    let h = 0;
    const slots = [];
    Array.from(col.children).forEach(el => {
      h = parseFloat(el.dataset.height);
      const rowIdx = Math.round(parseFloat(el.style.top) / h);
      slots[rowIdx] = el;
    });
    slots.forEach((el, i) => {
      if (el && el.classList.contains('win')) {
        explodeSymbol(el);
        col.removeChild(el);
        slots[i] = null;
      }
    });
    let write = rows - 1;
    for (let read = rows - 1; read >= 0; read--) {
      if (slots[read]) {
        slots[read].style.top = `${write * h}px`;
        slots[write] = slots[read];
        write--;
      }
    }
    for (let r = write; r >= 0; r--) {
      const sym = document.createElement('div');
      sym.className = 'symbol';
      const imgSrc = randomSymbol();
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = imgSrc.split('/').pop();
      img.className = 'symbol-img';
      sym.appendChild(img);
      sym.style.height = `${h}px`;
      sym.dataset.height = h;
      sym.dataset.symbol = imgSrc;
      sym.style.top = `${-h * (write - r + 1)}px`;
      col.appendChild(sym);
      setTimeout(() => {
        sym.style.transition = 'top 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        sym.style.top = `${r * h}px`;
        sym.classList.add('land', 'bounce');
        spawnRubbleParticles(sym);
        setTimeout(() => sym.classList.remove('bounce', 'land'), 600);
      }, 20);
    }
  });
}

function spawnRubbleParticles(target, count = 6) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'rubble-particle';
    const dx = (Math.random() - 0.5) * 80 + 'px';
    const dy = (Math.random() - 0.2) * 40 + 'px';
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    p.style.left = '50%';
    p.style.bottom = '0';
    p.style.transform = 'translate(-50%, 0)';
    target.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

function triggerAvalanche() {
  performAvalanche();
  setTimeout(() => {
    const again = checkWin();
    const mult = freeSpinActive ? freeMultiplier() : BASE_MULTIPLIERS[Math.min(avalancheCount, BASE_MULTIPLIERS.length - 1)];
    multiplierDisplay.textContent = `Multiplier: x${mult}`;
    if (again) {
      avalancheCount++;
      message.textContent = `💥 Avalanche x${mult}`;
      const payout = currentBet * mult * (totalWinSymbols / 3);
      balance += payout;
      showWinAmount(payout);
      updateBalanceDisplay();
      setTimeout(triggerAvalanche, 800);
    } else {
      if (freeSpinActive) {
        freeSpinsLeft--;
        if (freeSpinsLeft > 0) {
          message.textContent = `🎰 Free Spins Left: ${freeSpinsLeft}`;
          setTimeout(spin, 1200);
        } else {
          message.textContent = '🏁 Free Spins Over!';
          freeSpinActive = false;
          spinButton.disabled = false;
          isSpinning = false;
        }
      } else {
        message.textContent = '✅ Avalanche complete';
        spinButton.disabled = false;
        isSpinning = false;
      }
    }
  }, 900);
}

function spin() {
  const betAmount = parseFloat(betInput.value || '0');
  if (isSpinning || betAmount <= 0 || balance < betAmount) {
    alert("Invalid bet or insufficient balance.");
    return;
  }
  isSpinning = true;
  avalancheCount = 0;
  message.textContent = '';
  spinButton.disabled = true;
  balance -= betAmount;
  currentBet = betAmount;
  updateBalanceDisplay();
  createReels();
  setTimeout(() => {
    if (checkBonusTrigger() && !freeSpinActive) startFreeSpins();
    const win = checkWin();
    const mult = freeSpinActive ? freeMultiplier() : BASE_MULTIPLIERS[0];
    multiplierDisplay.textContent = `Multiplier: x${mult}`;
    if (win) {
      avalancheCount++;
      message.textContent = '🎉 Win! Starting Avalanche…';
      setTimeout(triggerAvalanche, 800);
    } else {
      if (freeSpinActive) {
        freeSpinsLeft--;
        if (freeSpinsLeft > 0) {
          message.textContent = `🎰 Free Spins Left: ${freeSpinsLeft}`;
          setTimeout(spin, 1200);
        } else {
          message.textContent = '🏁 Free Spins Over!';
          freeSpinActive = false;
          spinButton.disabled = false;
          isSpinning = false;
        }
      } else {
        message.textContent = '🙈 No win. Try again!';
        spinButton.disabled = false;
        isSpinning = false;
      }
    }
  }, 1650);
}

spinButton.addEventListener('click', spin);
updateBalanceDisplay();
