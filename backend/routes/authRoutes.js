const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hashed], function(err) {
    if (err) return res.status(400).send('User already exists');

    // Automatically log the user in after successful registration
    req.session.user = { id: this.lastID, username };
    res.redirect('/');
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (!user) return res.json({ success: false, message: 'No such user' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Wrong password' });

    req.session.user = {
      id: user.id,
      username: user.username,
      balance: user.balance
    };
    req.session.save(() => {
      res.json({ success: true });
    });
  });
});


router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
