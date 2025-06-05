const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'knarksinoSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Static files
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/img', express.static(path.join(__dirname, '../frontend/img')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Use routes
const mainRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
