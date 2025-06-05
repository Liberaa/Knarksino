const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index');
});

// Inside page
router.get('/inside', (req, res) => {
  res.render('inside');
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

module.exports = router;
