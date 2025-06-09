let multiplier = 0.00;
let crashPoint;
let crashed = false;
let animationFrame;

const multiplierDisplay = document.getElementById("multiplier");
const startBtn = document.getElementById("startBtn");
const cashOutBtn = document.getElementById("cashOutBtn");
const resultDisplay = document.getElementById("result");
const rocket = document.getElementById("rocket");
const canvas = document.getElementById("trailCanvas");
const ctx = canvas.getContext("2d");

let trailPoints = [];

function getRandomCrashPoint() {
  const r = Math.random();
  let crash;

  if (r < 0.25) {
    crash = 0.1 + Math.random() * (1 - 0.1); // 0.1–1
  } else if (r < 0.50) {
    crash = 1 + Math.random(); // 1–2
  } else if (r < 0.62) {
    crash = 2 + Math.random() * 2; // 2–4
  } else if (r < 0.82) {
    crash = 4 + Math.random() * 2; // 4–6
  } else if (r < 0.92) {
    crash = 6 + Math.random() * 6; // 6–12
  } else if (r < 0.97) {
    crash = 12 + Math.random() * 8; // 12–20
  } else if (r < 0.99) {
    crash = 20 + Math.random() * 10; // 20–30
  } else {
    crash = 30 * Math.pow(10000 / 30, Math.random());// 30–10000
  }

  return parseFloat(crash.toFixed(2));
}


function updateMultiplierDisplay() {
  const visualMultiplier = (Math.floor(multiplier * 100) + Math.floor(Math.random() * 10)) / 100;
  multiplierDisplay.textContent = `${visualMultiplier.toFixed(2)}x`;
  multiplierDisplay.classList.add("bump");
  setTimeout(() => multiplierDisplay.classList.remove("bump"), 100);
}

function rotateAroundCenter(point, angle, cx, cy) {
  const x = point.x - cx;
  const y = point.y - cy;
  const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
  const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
  return {
    x: rotatedX + cx,
    y: rotatedY + cy
  };
}

function updateRocket(multiplier) {
  const centerX = canvas.width / 2 + 50;
  const centerY = canvas.height / 2 + 40;

  // === Rotation: from 0° (right) to -45° (up-right)
  const distance = Math.pow(multiplier - 0.3, 1) * 50;
  const progress = Math.min(1, (multiplier - 1) / 20);
  const angleProgress = Math.min(1, (multiplier - 1) / 20);
  const angle = angleProgress * Math.PI / 6;
  const offsetX = multiplier * 2; // moves right gradually
  const offsetY = -multiplier * 1.05; // moves up gradually
  rocket.style.left = `${centerX - rocket.offsetWidth / 2 + offsetX}px`;
  rocket.style.top = `${centerY - rocket.offsetHeight / 2 + offsetY}px`;
  const angleDeg = angle * 180 / Math.PI;
  rocket.style.transform = `rotate(${-angleDeg + 90}deg)`;

  // === Trail: simulates left/downward curve (exponential up motion)
  const dx = Math.cos(-angle) * distance;
  const dy = Math.sin(-angle) * distance;
  const trailX = centerX - dx;
  const trailY = centerY + dy - 2;
  const initialTrailAngleOffset = 3 * Math.PI / 180;
  trailPoints.push({ x: trailX + offsetX, y: trailY + offsetY });

  if (trailPoints.length > 600) trailPoints.shift();

  // === Draw trail
ctx.clearRect(0, 0, canvas.width, canvas.height);

const trailAngle = angle * 0.65; // slow down trail rotation
const rotateAngle = -trailAngle - initialTrailAngleOffset;
const adjustedCenterX = centerX + offsetX;
const adjustedCenterY = centerY + offsetY;
const maxTrailDistance = 200;
const globalTrailYOffset = multiplier * 1;
const globalTrailXOffset = multiplier * 0.5;

for (let i = 0; i < trailPoints.length - 1; i++) {
  const dx1 = trailPoints[i].x - adjustedCenterX ;
  const dy1 = trailPoints[i].y - adjustedCenterY ;
  const dx2 = trailPoints[i + 1].x - adjustedCenterX ;
  const dy2 = trailPoints[i + 1].y - adjustedCenterY ;

  const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  const intensity = Math.min(1, (multiplier - 1) / 20);

  if (dist1 < maxTrailDistance && dist2 < maxTrailDistance) {
    const p1 = rotateAroundCenter(trailPoints[i], rotateAngle, adjustedCenterX , adjustedCenterY );
    const p2 = rotateAroundCenter(trailPoints[i + 1], rotateAngle, adjustedCenterX , adjustedCenterY );
    p1.y -= globalTrailYOffset;
    p2.y -= globalTrailYOffset;
    if (intensity > 0.2) {
      const jitter = intensity * 3;
      p2.x += (Math.random() - 0.5) * jitter;
      p2.y += (Math.random() - 0.5) * jitter;
    }

    // Fade effect
    const alpha = 1 - i / trailPoints.length;
    // Trail violence factor based on multiplier

    // Line width gets thicker
    ctx.lineWidth = 2 + intensity * 4;

    // Trail color flickers with more orange/yellow
    const r = 255;
    const g = Math.floor(100 + 155 * intensity);
    const b = Math.floor(100 * (1 - intensity));
    ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;

    ctx.beginPath();
    p1.x += globalTrailXOffset;
    p2.x += globalTrailXOffset;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}
const visibleStartIndex = trailPoints.findIndex(p => {
  const dx = p.x - adjustedCenterX;
  const dy = p.y - adjustedCenterY;
  return Math.sqrt(dx * dx + dy * dy) < maxTrailDistance;
});

if (visibleStartIndex > 4) {
  for (let j = 4; j >= 1; j--) {
    const a = 0.1 * (j / 4); // fade out
    const p1 = rotateAroundCenter(trailPoints[visibleStartIndex - j], rotateAngle, adjustedCenterX, adjustedCenterY);
    const p2 = rotateAroundCenter(trailPoints[visibleStartIndex - j + 1], rotateAngle, adjustedCenterX, adjustedCenterY);
    p1.y -= globalTrailYOffset;
    p2.y -= globalTrailYOffset;


    ctx.lineWidth = j * 0.5; // gradually thinner
    ctx.strokeStyle = `rgba(255, 255, 255, ${a})`;
    ctx.beginPath();
    p1.x += globalTrailXOffset;
    p2.x += globalTrailXOffset;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}
}



function animateCrash() {
  const speed = getSpeed(multiplier);
  multiplier += 0.05;

  updateMultiplierDisplay();
  updateRocket(multiplier);

  if (multiplier >= crashPoint) {
    crash();
    return;
  }

  animationFrame = setTimeout(() => {
    requestAnimationFrame(animateCrash);
  }, speed);
}

function getSpeed(multiplier) {
  if (multiplier < 2.5) return 100;
  if (multiplier < 5) return 60;
  return 20;
}

window.addEventListener("load", () => {
  const track = document.querySelector(".rocket-track");
  canvas.width = track.clientWidth;
  canvas.height = track.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateRocket(multiplier);
});

startBtn.addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("bet-amount").value);
  const res = await fetch('/api/crash/bet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  if (!res.ok) {
    const msg = await res.text();
    alert("Bet failed: " + msg);
    return;
  }

  const data = await res.json();
  document.getElementById("balance").textContent = data.newBalance.toFixed(2);

  // Start the game
  multiplier = 0.00;
  crashPoint = data.crashPoint;
  crashed = false;
  trailPoints = [];

  const track = document.querySelector(".rocket-track");
  canvas.width = track.clientWidth;
  canvas.height = track.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateMultiplierDisplay();
  updateRocket(multiplier);
  resultDisplay.textContent = "";
  startBtn.disabled = true;
  cashOutBtn.disabled = false;

  animateCrash();
});


cashOutBtn.addEventListener("click", async () => {
  if (!crashed) {
    const amount = parseFloat(document.getElementById("bet-amount").value);
    const res = await fetch('/api/crash/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, multiplier })
    });

    if (res.ok) {
      const data = await res.json();
      document.getElementById("balance").textContent = data.newBalance.toFixed(2);
      resultDisplay.textContent = `You cashed out at ${multiplier.toFixed(2)}x! 🎉`;
      resultDisplay.style.color = '#00ff88';
      resultDisplay.style.textShadow = '0 0 6px #00ff8833';
    } else {
      resultDisplay.textContent = "Error cashing out";
    }

    stopGame();
  }
});


function crash() {
  crashed = true;
  multiplierDisplay.textContent = `💥 ${multiplier.toFixed(2)}x CRASHED 💥`;
  resultDisplay.textContent = "You lost! Try again.";
  stopGame();
}

function stopGame() {
  clearTimeout(animationFrame);
  startBtn.disabled = false;
  cashOutBtn.disabled = true;
}
