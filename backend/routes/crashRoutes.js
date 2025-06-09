const express = require('express');
const db = require('../db');
const router = express.Router();

function generateCrashPoint() {
  const r = Math.random();
  let crash;
  if (r < 0.25) crash = 0.1 + Math.random() * (1 - 0.1);
  else if (r < 0.50) crash = 1 + Math.random();
  else if (r < 0.62) crash = 2 + Math.random() * 2;
  else if (r < 0.82) crash = 4 + Math.random() * 2;
  else if (r < 0.92) crash = 6 + Math.random() * 6;
  else if (r < 0.97) crash = 12 + Math.random() * 8;
  else if (r < 0.99) crash = 20 + Math.random() * 10;
  else crash = 30 * Math.pow(10000 / 30, Math.random());
  return parseFloat(crash.toFixed(2));
}

// ✅ Place a bet
router.post('/api/crash/bet', (req, res) => {
  const user = req.session.user;
  const amount = parseFloat(req.body.amount);

  if (!user || isNaN(amount) || amount <= 0) {
    return res.status(400).send('Invalid');
  }

  db.get(`SELECT balance FROM users WHERE id = ?`, [user.id], (err, row) => {
    if (err || !row || row.balance < amount) return res.status(400).send('Insufficient funds');

    const newBalance = row.balance - amount;
    const crashPoint = generateCrashPoint();

    db.run(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, user.id], (err) => {
      if (err) return res.status(500).send('Error');
      req.session.user.balance = newBalance;

      // ✅ Save game state in session
      req.session.crashGame = {
        crashPoint,
        betAmount: amount,
        startTime: Date.now()
      };

      res.json({ success: true, newBalance, crashPoint });
    });
  });
});

// ✅ Cash out
router.post('/api/crash/cashout', (req, res) => {
  const user = req.session.user;
  const { amount, multiplier } = req.body;

  if (!user || isNaN(amount) || isNaN(multiplier)) {
    return res.status(400).send('Invalid input');
  }

  const crashGame = req.session.crashGame;
  if (!crashGame) return res.status(400).send('No active game');

  // ✅ Optional: prevent cashing out after crash
  if (multiplier >= crashGame.crashPoint) {
    return res.status(400).send('Too late! Crash happened.');
  }

  const winAmount = amount * multiplier;

  db.get(`SELECT balance FROM users WHERE id = ?`, [user.id], (err, row) => {
    if (err || !row) return res.status(400).send('User not found');

    const newBalance = row.balance + winAmount;

    db.run(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, user.id], (err) => {
      if (err) return res.status(500).send('Error');
      req.session.user.balance = newBalance;
      delete req.session.crashGame; // 🧹 Clean up game session
      res.json({ success: true, newBalance });
    });
  });
});

module.exports = router;
