const express = require('express');
const router = express.Router();
const db = require('../db');

// Home page
router.get('/', (req, res) => {
  res.render('index');
});

// Inside page
router.get('/inside', (req, res) => {
  res.render('inside');
});

router.get('/outside', (req, res) => {
  res.render('outside');
});

// Casino page inside
// Casino page
router.get('/inside/casino', (req, res) => {
  res.render('casino');
});
//Slot inside
router.get('/inside/slot', (req, res) => {
  res.render('slot');
});
//blackjack inside
router.get('/inside/blackjack', (req, res) => {
  res.render('blackjack');
});
// leaderboard inside
router.get('/inside/leaderboard', (req, res) => {
  res.render('leaderboard');
});

router.get('/inside/crash', (req, res) => {
  res.render('crash');
}); 

router.get('/garage', (req, res) => {
  const guestUser = {
    id: null,
    username: 'user42069',
    balance: 0
  };

  if (!req.session.user) {
    return res.render('garage', { user: guestUser });
  }

  db.get('SELECT username, balance FROM users WHERE id = ?', [req.session.user.id], (err, row) => {
    if (err || !row) {
      return res.render('garage', { user: guestUser });
    }

    req.session.user.balance = row.balance;
    res.render('garage', {
      user: {
        id: req.session.user.id,
        username: row.username,
        balance: row.balance
      }
    });
  });
});


// Add in your Express backend
router.post('/api/roulette/spin', (req, res) => {
  const { bets } = req.body;
  const userId = req.session?.user?.id;

  if (!userId || !Array.isArray(bets)) return res.status(400).send("Invalid");

  const winningNumber = Math.floor(Math.random() * 37);
  let payout = 0;
  let totalBet = 0;

  for (const bet of bets) {
    const nums = bet.numbers.split(',').map(n => parseInt(n.trim()));
    const hit = nums.includes(winningNumber);
    totalBet += bet.amt;
    if (hit) payout += bet.amt * bet.odds + bet.amt;
  }

  // Check balance and update in DB
  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
    if (err || !row || row.balance < totalBet)
      return res.status(400).send("Insufficient funds");

    const newBalance = row.balance - totalBet + payout;
    db.run('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], () => {
      res.json({ 
        winningNumber,
        payout,
        totalBet,
        newBalance
      });
    });
  });
});

router.get('/api/user/balance', (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).send('Not logged in');

  db.get('SELECT balance FROM users WHERE id = ?', [userId], (err, row) => {
    if (err || !row) return res.status(500).send('Error');
    res.json({ balance: row.balance });
  });
});



router.get('/mines', (req, res) => {
  res.render('mines', {
    defaultBet:    1,   // <— supply whatever defaults you want
    defaultBombas:  3
  });
});


module.exports = router;
