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
  res.render('garage');
});


router.get('/mines', (req, res) => {
  res.render('mines', {
    defaultBet:    1,   // <— supply whatever defaults you want
    defaultBombs:  3
  });
});


module.exports = router;
