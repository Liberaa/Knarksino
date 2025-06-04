const express = require('express');
const path = require('path');
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));

// Static files
app.use('/css', express.static(path.join(__dirname, 'frontend/css')));
app.use('/img', express.static(path.join(__dirname, 'frontend/img')));

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
