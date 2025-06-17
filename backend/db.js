const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

// Create user table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    balance INTEGER DEFAULT 10000,
    heroin INTEGER DEFAULT 0,
    lsd INTEGER DEFAULT 0,
    weed INTEGER DEFAULT 0,
    cocaine INTEGER DEFAULT 0,
    meth INTEGER DEFAULT 0,
    mushrooms INTEGER DEFAULT 0,
    luck INTEGER DEFAULT 1,
    last_daily_claim INTEGER DEFAULT 0,
    last_wheel_spin INTEGER DEFAULT 0,
    auto_claim_until INTEGER DEFAULT 0
  )
`);

module.exports = db;
