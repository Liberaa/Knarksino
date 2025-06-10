// game.js — fully corrected with PNG symbols

// grab DOM elements
const reelsContainer    = document.getElementById('reels');
const spinButton        = document.getElementById('spinButton');
const multiplierDisplay = document.getElementById('multiplier');
const message           = document.getElementById('message');

// constants & state
const REEL_COUNT       = 6;
const MIN_ROWS         = 2;
const MAX_ROWS         = 7;
const COLUMN_HEIGHT_PX = 490;  // must match your CSS .reel-column height

const BASE_MULTIPLIERS = [1, 2, 3, 5];
const FREE_MULTIPLIERS = [3, 3, 5, 5, 9, 9, 15, 15, 15, 15];

let isSpinning     = false;
let avalancheCount = 0;
let freeSpinActive = false;
let freeSpinsLeft  = 0;

// symbols (now using PNG filenames)
const WILD_SYMBOL  = 'set9.png';
const BONUS_SYMBOL = 'set10.png';
const weightedSymbols = [
  { symbol: 'set1.png', weight: 20 },
  { symbol: 'set2.png', weight: 15 },
  { symbol: 'set3.png', weight: 15 },
  { symbol: 'set4.png', weight: 10 },
  { symbol: 'set5.png', weight: 10 },
  { symbol: 'set6.png', weight: 10 },
  { symbol: 'set7.png', weight: 10 },
  { symbol: 'set8.png', weight: 5  },
  { symbol: WILD_SYMBOL,  weight: 1  },  // wild
  { symbol: BONUS_SYMBOL, weight: 2  }   // bonus scatter
];

// pick a random symbol by weight and return full image path
function randomSymbol() {
  const total = weightedSymbols.reduce((sum, o) => sum + o.weight, 0);
  let r = Math.random() * total;
  for (let o of weightedSymbols) {
    if (r < o.weight) return `/img/symbols/${o.symbol}`;
    r -= o.weight;
  }
  return `/img/symbols/${weightedSymbols[0].symbol}`;
}

// build & animate reels
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

      // create img element for the symbol
      const imgSrc = randomSymbol();
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = imgSrc.split('/').pop(); // use filename as alt text
      img.className = 'symbol-img';
      sym.appendChild(img);

      sym.style.height = `${h}px`;
      sym.dataset.height = h;
      sym.dataset.symbol = imgSrc; // store symbol path for win comparisons

      // Start above the view (offscreen), staggered for cascade effect
      sym.style.top = `${-h * (r + 1)}px`;
      col.appendChild(sym);

      // Animate into place with staggered timing
      setTimeout(() => {
        sym.style.transition = 'top 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        sym.style.top = `${(rows - 1 - r) * h}px`;
      }, 50 + r * 80); // Adjust timing for cascade effect
    }

    reelsContainer.appendChild(col);
  }

  // Let the "spinning" class remain during the initial fall
  setTimeout(() => {
    document.querySelectorAll('.reel-column')
      .forEach(c => c.classList.remove('spinning'));
  }, 800);
}

// remove old win flags
function clearWins() {
  document.querySelectorAll('.symbol.win')
    .forEach(s => s.classList.remove('win'));
}

// strict left→right match, starting only on non-wild in col 0
function checkWin() {
  clearWins();
  const cols = Array.from(reelsContainer.children);
  let hasWin = false;

  // helper to extend a chain into the next column
  function extendPath(path, colIndex, targetSymbol) {
    const nextCol = cols[colIndex];
    const matches = Array.from(nextCol.children)
      .filter(s => s.dataset.symbol === targetSymbol || s.dataset.symbol === `/img/symbols/${WILD_SYMBOL}`);
    return matches.map(match => [...path, match]);
  }

  // start from every symbol in column 0
  Array.from(cols[0].children).forEach(start => {
    const startSymbol = start.dataset.symbol;

    // possible base symbols to try if the start is wild
    const baseCandidates = startSymbol === `/img/symbols/${WILD_SYMBOL}`
      ? Array.from(cols[1].children)
          .map(s => s.dataset.symbol)
          .filter(s => s !== `/img/symbols/${WILD_SYMBOL}`)
      : [startSymbol];

    baseCandidates.forEach(candidate => {
      let paths = [[start]];

      // walk through each column and expand paths
      for (let i = 1; i < cols.length; i++) {
        const newPaths = [];
        for (const path of paths) {
          const extensions = extendPath(path, i, candidate);
          newPaths.push(...extensions);
        }
        if (newPaths.length === 0) break;
        paths = newPaths;
      }

      // mark wins if path length >= 3
      paths.forEach(path => {
        if (path.length >= 3) {
          hasWin = true;
          path.forEach(s => s.classList.add('win'));
        }
      });
    });
  });

  return hasWin;
}

// bonus trigger if at least one bonus symbol in each of reels 0,1,2
function checkBonusTrigger() {
  const cols = Array.from(reelsContainer.children);
  return [0, 1, 2].every(i =>
    Array.from(cols[i].children).some(s => s.dataset.symbol === `/img/symbols/${BONUS_SYMBOL}`)
  );
}

// kick off free spins
function startFreeSpins() {
  freeSpinActive = true;
  freeSpinsLeft  = 10;
  message.textContent = '🎁 Bonus! 10 Free Spins!';
}

// free-spin multiplier progression
function freeMultiplier() {
  const idx = 10 - freeSpinsLeft;
  return FREE_MULTIPLIERS[Math.min(idx, FREE_MULTIPLIERS.length - 1)];
}

// remove wins, drop survivors, refill top — using each column’s own row-count
function performAvalanche() {
  document.querySelectorAll('.reel-column').forEach(col => {
    const rows = parseInt(col.dataset.rows, 10);
    let h = 0;
    const slots = [];

    // gather slots by their row index
    Array.from(col.children).forEach(el => {
      h = parseFloat(el.dataset.height);
      const rowIdx = Math.round(parseFloat(el.style.top) / h);
      slots[rowIdx] = el;
    });

    // remove wins
    slots.forEach((el, i) => {
      if (el && el.classList.contains('win')) {
        col.removeChild(el);
        slots[i] = null;
      }
    });

    // drop survivors
    let write = rows - 1;
    for (let read = rows - 1; read >= 0; read--) {
      if (slots[read]) {
        slots[read].style.top = `${write * h}px`;
        slots[write] = slots[read];
        write--;
      }
    }

    // refill empty spots at top
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
      // start just above view
      sym.style.top = `${-h * (write - r + 1)}px`;
      col.appendChild(sym);

      // animate into place
      setTimeout(() => {
        sym.style.transition = 'top 0.3s ease';
        sym.style.top = `${r * h}px`;
      }, 20);
    }
  });
}

// chain avalanches until no new win
function triggerAvalanche() {
  performAvalanche();

  setTimeout(() => {
    const again = checkWin();
    const mult = freeSpinActive
      ? freeMultiplier()
      : BASE_MULTIPLIERS[Math.min(avalancheCount, BASE_MULTIPLIERS.length - 1)];

    multiplierDisplay.textContent = `Multiplier: x${mult}`;

    if (again) {
      avalancheCount++;
      message.textContent = `💥 Avalanche x${mult}`;
      setTimeout(triggerAvalanche, 800);
    } else {
      // end of chain
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

// main spin entry point
function spin() {
  if (isSpinning) return;
  isSpinning     = true;
  avalancheCount = 0;
  message.textContent = '';
  spinButton.disabled = true;

  createReels();

  // after the spin-in animation…
  setTimeout(() => {
    if (checkBonusTrigger() && !freeSpinActive) startFreeSpins();

    const win  = checkWin();
    const mult = freeSpinActive ? freeMultiplier() : BASE_MULTIPLIERS[0];
    multiplierDisplay.textContent = `Multiplier: x${mult}`;

    if (win) {
      avalancheCount++;
      message.textContent = '🎉 Win! Starting Avalanche…';
      setTimeout(triggerAvalanche, 800);
    } else {
      // no win
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
