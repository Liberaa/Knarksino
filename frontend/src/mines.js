(() => {
  const GRID = 5; // 5×5 grid

  const boardEl    = document.getElementById('board');
  const statusEl   = document.getElementById('status');
  const startBtn   = document.getElementById('startBtn');
  const cashoutBtn = document.getElementById('cashoutBtn');
  const betEl      = document.getElementById('bet');
  const bombsEl    = document.getElementById('bombs');

  let bombSet, safePicks, bet, multiplier, playing;

  /* ---------- helpers ---------- */
  const randomBombs = qty => {
    const set = new Set();
    while (set.size < qty) set.add(Math.floor(Math.random() * GRID * GRID));
    return set;
  };

  const calcMultiplier = picks => +(Math.pow(1.1, picks)).toFixed(2); // 1.1^picks

  const updateStatus = msg => (statusEl.textContent = msg);

  /* ---------- game flow ---------- */
  const startGame = () => {
    const bombs = +bombsEl.value;
    bet = +betEl.value;

    if (bombs < 1 || bombs >= GRID * GRID) return alert('Invalid number of bombs (1-24).');
    if (bet <= 0)                          return alert('Bet must be > 0');

    // reset state
    boardEl.innerHTML = '';
    cashoutBtn.disabled = false;
    bombSet = randomBombs(bombs);
    safePicks = 0;
    multiplier = 1;
    playing = true;
    updateStatus(`Good luck! Multiplier ×${multiplier}`);

    // build grid
    for (let i = 0; i < GRID * GRID; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  };

  const onCellClick = e => {
    if (!playing) return;

    const idx = +e.currentTarget.dataset.index;
    const isBomb = bombSet.has(idx);
    revealCell(e.currentTarget, isBomb);

    if (isBomb) {
      playing = false;
      cashoutBtn.disabled = true;
      revealAllBombs();
      updateStatus('💥 Boom! You lost.');
    } else {
      safePicks++;
      multiplier = calcMultiplier(safePicks);
      updateStatus(`Safe! picks: ${safePicks} • Multiplier ×${multiplier}`);
    }
  };

  const revealCell = (cell, isBomb) => {
    cell.classList.add('revealed', isBomb ? 'bomb' : 'safe');
    cell.textContent = isBomb ? '💣' : '💎';
    cell.style.cursor = 'default';
    cell.removeEventListener('click', onCellClick);
  };

  const revealAllBombs = () => {
    [...boardEl.children].forEach((c, i) => {
      if (bombSet.has(i) && !c.classList.contains('revealed')) revealCell(c, true);
    });
  };

  const cashOut = () => {
    if (!playing) return;
    const payout = +(bet * multiplier).toFixed(2);
    updateStatus(`You cashed-out: $${payout} (bet $${bet} × ${multiplier})`);
    playing = false;
    cashoutBtn.disabled = true;
    revealAllBombs();
  };

  /* ---------- wire up ---------- */
  startBtn.addEventListener('click', startGame);
  cashoutBtn.addEventListener('click', cashOut);

  updateStatus('Set your bet and press Start!');
})();
