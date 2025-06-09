let multiplier = 1.00;
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
let lastPosition = null;
let zoomScale = 1;


function getRandomCrashPoint() {
  return parseFloat((Math.random() * 40 + 1.5).toFixed(2)); // up to ~40x
}

function updateMultiplierDisplay() {
  multiplierDisplay.textContent = `${multiplier.toFixed(2)}x`;
  multiplierDisplay.classList.add("bump");
  setTimeout(() => multiplierDisplay.classList.remove("bump"), 100);
}

function getRocketPosition(multiplier) {
  const x = (multiplier - 1) * 2;
  const y = Math.pow(multiplier, 1.5);
  return { x, y };
}

function updateRocket(multiplier) {
  const { x, y } = getRocketPosition(multiplier);
  const rocketOffsetX = -420;

  const track = document.querySelector(".rocket-track");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Correct X calculation to align with trail/canvas system
  const pxX = (x / 100) * canvasWidth + 250;
  const pxY = (y / 100) * canvasHeight - 5;
  const rocketY = canvasHeight - pxY;

  // Draw trail
  if (lastPosition) {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(pxX, rocketY);
    ctx.stroke();
  }

  lastPosition = { x: pxX, y: rocketY };

  // Zoom out logic
  const margin = 100;
  if (pxX > canvasWidth - margin || rocketY < margin) {
    zoomScale = Math.max(0.3, zoomScale - 0.005);
    track.style.transform = `scale(${zoomScale})`;
    track.style.transformOrigin = "bottom left";
  }

  const rocketHeight = rocket.offsetHeight;

  // Position rocket with LEFT edge aligned to trail
const dx = 2;
const dy = 1.5 * Math.pow(multiplier, 0.5);
const angleRadians = Math.atan(dy / dx);
const angleDegrees = angleRadians * (180 / Math.PI);

// Get angle at multiplier = 1 for baseline
const dy0 = 1.5 * Math.pow(1.0, 0.5);
const baseAngleRadians = Math.atan(dy0 / dx) + 45 * Math.PI / 180; // Adjust to face right with 45°
const baseAngleDegrees = baseAngleRadians * (180 / Math.PI);

const rotationSpeedFactor = -0.4 * multiplier ;
const relativeAngle = (angleDegrees - baseAngleDegrees) * rotationSpeedFactor;


// Rocket image faces right by default, so apply rotation from there
rocket.style.transform = `translate(${pxX + rocketOffsetX}px, ${rocketY - rocketHeight / 2}px) rotate(${-relativeAngle}deg)`;
}


function animateCrash() {
  const speed = getSpeed(multiplier);
  const increment = 0.1;

  multiplier += increment;
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

// On initial page load, render rocket at multiplier 1.00
window.addEventListener("load", () => {
  // Ensure canvas dimensions match rocket track before positioning
  const track = document.querySelector(".rocket-track");
  canvas.width = track.clientWidth;
  canvas.height = track.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateRocket(1.00);
});


startBtn.addEventListener("click", () => {
  multiplier = 1.00;
  crashPoint = getRandomCrashPoint();
  crashed = false;

  // Reset canvas/trail *before* updateRocket()
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lastPosition = null;
  zoomScale = 1;

  const track = document.querySelector(".rocket-track");
  canvas.width = track.clientWidth;
  canvas.height = track.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateMultiplierDisplay();
  updateRocket(multiplier); // Now safe — won't draw a connecting line
  resultDisplay.textContent = "";
  startBtn.disabled = true;
  cashOutBtn.disabled = false;

  animateCrash();
});


cashOutBtn.addEventListener("click", () => {
  if (!crashed) {
    resultDisplay.textContent = `You cashed out at ${multiplier.toFixed(2)}x! 🎉`;
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
