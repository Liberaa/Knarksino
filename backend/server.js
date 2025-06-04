const express = require('express');
const path = require('path');
const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Static files
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/img', express.static(path.join(__dirname, '../frontend/img')));
app.use('/src', express.static(path.join(__dirname, '../frontend/src')));

// Use routes
const mainRoutes = require('./routes/mainRoutes');
app.use('/', mainRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
