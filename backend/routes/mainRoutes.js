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


module.exports = router;
