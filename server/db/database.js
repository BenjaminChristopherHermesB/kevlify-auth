const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/kevlify.db');
const dbDir = path.dirname(dbPath);

let db = null;

async function initDatabase() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      oauth_provider TEXT DEFAULT 'local' CHECK(oauth_provider IN ('local', 'google')),
      google_id TEXT UNIQUE,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type INTEGER NOT NULL DEFAULT 2,
      issuer TEXT NOT NULL,
      username TEXT,
      secret_encrypted TEXT NOT NULL,
      algorithm INTEGER DEFAULT 0,
      digits INTEGER DEFAULT 6,
      period INTEGER DEFAULT 30,
      counter INTEGER DEFAULT 0,
      icon TEXT,
      category_id TEXT,
      ranking INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      ranking INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)');

  saveDatabase();

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

function getDb() {
  return db;
}

function prepare(sql) {
  return {
    run: (...params) => {
      db.run(sql, params);
      const result = db.exec('SELECT last_insert_rowid() as id, changes() as changes');
      saveDatabase();
      return {
        lastInsertRowid: result[0]?.values[0]?.[0] || 0,
        changes: result[0]?.values[0]?.[1] || 0
      };
    },
    get: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
  };
}

function exec(sql) {
  db.run(sql);
  saveDatabase();
}

module.exports = {
  initDatabase,
  getDb,
  prepare,
  exec,
  saveDatabase
};
