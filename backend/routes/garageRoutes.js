const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /spin
router.post('/garage/spin', async (req, res) => {
  const user = req.session.user;
  const bet = parseFloat(req.body.bet);

  if (!user) return res.status(401).send('Not logged in');
  if (!bet || bet <= 0) return res.status(400).send('Invalid bet');

  db.get(`SELECT balance FROM users WHERE id = ?`, [user.id], (err, row) => {
    if (err) return res.status(500).send('DB error');
    if (!row || row.balance < bet) return res.status(400).send('Insufficient balance');

    // Example: random win or not
    const win = Math.random() < 0.4;
    const multiplier = win ? 2 : 0;
    const winnings = bet * multiplier;
    const newBalance = row.balance - bet + winnings;

    db.run(`UPDATE users SET balance = ? WHERE id = ?`, [newBalance, user.id], err => {
      if (err) return res.status(500).send('Update error');

      req.session.user.balance = newBalance;
      req.session.save();
      res.json({ win, multiplier, winnings, balance: newBalance });
    });
  });
});

module.exports = router;
