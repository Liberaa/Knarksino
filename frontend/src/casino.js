document.addEventListener('DOMContentLoaded', () => {
  const wheel = document.querySelector('.roulette-wheel');
  const segmentsGroup = document.getElementById('wheel-segments');
  const ball = document.getElementById('ball');
  const grid = document.getElementById('number-grid');

  const balanceEl = document.getElementById('balance');
  const betEl = document.getElementById('bet');
  const winEl = document.getElementById('win');

  const placeBetBtn = document.getElementById('place-bet');
  const spinBtn = document.getElementById('spin');

  const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6,
    27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
    16, 33, 1, 20, 14, 31, 9, 22, 18, 29,
    7, 28, 12, 35, 3, 26
  ];

  const RED = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18,
    19, 21, 23, 25, 27, 30, 32, 34, 36
  ]);

  let balance = 1000;
  let betAmount = 0;
  let lastWin = 0;
  let selectedNumber = null;
  let isSpinning = false;

  // Helper functions
  function updateStats() {
    balanceEl.textContent = balance;
    betEl.textContent = betAmount;
    winEl.textContent = lastWin;
  }

  function showAlert(msg) {
    alert(msg); // replace with modal or toast in future
  }

  function drawWheel() {
    NUMBERS.forEach((num, i) => {
      const angle = (360 / NUMBERS.length) * i;
      const color = num === 0 ? 'green' : RED.has(num) ? 'red' : 'black';

      const slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const startAngle = angle * (Math.PI / 180);
      const endAngle = (angle + (360 / NUMBERS.length)) * (Math.PI / 180);
      const r = 190;

      const x1 = 200 + r * Math.cos(startAngle);
      const y1 = 200 + r * Math.sin(startAngle);
      const x2 = 200 + r * Math.cos(endAngle);
      const y2 = 200 + r * Math.sin(endAngle);

      const d = `
        M200,200 
        L${x1},${y1} 
        A${r},${r} 0 0,1 ${x2},${y2} 
        Z`;

      slice.setAttribute("d", d);
      slice.setAttribute("fill", color);
      slice.setAttribute("stroke", "#111");
      segmentsGroup.appendChild(slice);
    });
  }

  function drawGrid() {
    for (let i = 36; i >= 1; i--) {
      const cell = document.createElement('div');
      cell.textContent = i;
      cell.classList.add(RED.has(i) ? 'red' : 'black');
      cell.onclick = () => {
        if (isSpinning) return;
        selectedNumber = i;
        document.querySelectorAll('#number-grid div').forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');
      };
      grid.appendChild(cell);
    }
  }

  function placeBet(amount = 50) {
    if (isSpinning) return showAlert("Wait for the wheel to stop.");
    if (!selectedNumber) return showAlert("Select a number to bet on.");
    if (balance < amount) return showAlert("Insufficient balance.");
    betAmount += amount;
    balance -= amount;
    updateStats();
  }

  function spinWheel() {
    if (isSpinning) return;
    if (betAmount === 0 || !selectedNumber) return showAlert("Place a bet before spinning.");

    isSpinning = true;
    spinBtn.disabled = true;
    placeBetBtn.disabled = true;

    const winNumber = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    const winIndex = NUMBERS.indexOf(winNumber);
    const rotateDeg = 360 * 10 + (360 / NUMBERS.length) * winIndex;

    wheel.style.transform = `rotate(${rotateDeg}deg)`;

    // Animate the ball around
    const angle = (360 / NUMBERS.length) * winIndex - 5;
    const radians = (angle * Math.PI) / 180;
    const radius = 160;
    const ballX = 200 + radius * Math.cos(radians);
    const ballY = 200 + radius * Math.sin(radians);

    setTimeout(() => {
      ball.setAttribute('cx', ballX);
      ball.setAttribute('cy', ballY);

      // Payout logic
      if (winNumber === selectedNumber) {
        const payout = betAmount * 36;
        balance += payout;
        lastWin = payout;
      } else {
        lastWin = 0;
      }

      betAmount = 0;
      updateStats();

      showAlert(`Result: ${winNumber} (${getColorLabel(winNumber)})`);

      // Reset controls
      isSpinning = false;
      spinBtn.disabled = false;
      placeBetBtn.disabled = false;
    }, 4000);
  }

  function getColorLabel(num) {
    if (num === 0) return "Green";
    return RED.has(num) ? "Red" : "Black";
  }

  // Event listeners
  placeBetBtn.addEventListener('click', () => placeBet(50));
  spinBtn.addEventListener('click', spinWheel);

  // Init
  drawWheel();
  drawGrid();
  updateStats();
});
