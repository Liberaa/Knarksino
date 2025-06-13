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




router.get('/mines', (req, res) => {
  res.render('mines', {
    defaultBet:    1,   // <— supply whatever defaults you want
    defaultBombs:  3
  });
});


module.exports = router;
