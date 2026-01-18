const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/kevlify.db');
const dbDir = path.dirname(dbPath);

// Detect mode
const isPostgres = !!process.env.DATABASE_URL;

let db = null;
let pgPool = null;

async function initDatabase() {
  if (isPostgres) {
    if (!pgPool) {
      console.log('Initializing PostgreSQL connection...');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for most cloud providers
      });
    }

    // Create Tables for Postgres
    await createPostgresTables();
    return pgPool;
  } else {
    // SQLite implementation (Local dev)
    if (db) return db;

    console.log('Initializing SQLite (local)...');
    const SQL = await initSqlJs();
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    if (fs.existsSync(dbPath)) {
      db = new SQL.Database(fs.readFileSync(dbPath));
    } else {
      db = new SQL.Database();
    }
    createSqliteTables();
    return db;
  }
}

async function createPostgresTables() {
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        oauth_provider TEXT DEFAULT 'local' CHECK(oauth_provider IN ('local', 'google')),
        google_id TEXT UNIQUE,
        role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        ranking INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)');
  } catch (err) {
    console.error('Error creating Postgres tables:', err);
  } finally {
    client.release();
  }
}

function createSqliteTables() {
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
}

function saveDatabase() {
  if (!isPostgres && db) {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  }
}

// Convert SQLite query to Postgres
function transformQuery(sql) {
  let paramCount = 1;
  // Replace ? with $1, $2, etc.
  let converted = sql.replace(/\?/g, () => `$${paramCount++}`);

  // Handle INSERT OR IGNORE -> INSERT ... ON CONFLICT DO NOTHING
  if (converted.includes('INSERT OR IGNORE')) {
    converted = converted.replace('INSERT OR IGNORE', 'INSERT');
    converted += ' ON CONFLICT DO NOTHING';
  }

  // Handle last_insert_rowid() logic via RETURNING id
  // Note: Only add RETURNING id if it's an insert and not already present
  if (/^INSERT\s+INTO/i.test(converted) && !converted.includes('RETURNING')) {
    converted += ' RETURNING id';
  }

  return converted;
}

function prepare(sql) {
  if (isPostgres) {
    const pgSql = transformQuery(sql);
    return {
      run: async (...params) => {
        const result = await pgPool.query(pgSql, params);
        if (/^INSERT/i.test(pgSql)) {
          return {
            lastInsertRowid: result.rows[0]?.id || 0,
            changes: result.rowCount
          };
        }
        return {
          lastInsertRowid: 0,
          changes: result.rowCount
        };
      },
      get: async (...params) => {
        const result = await pgPool.query(pgSql, params);
        return result.rows[0];
      },
      all: async (...params) => {
        const result = await pgPool.query(pgSql, params);
        return result.rows;
      }
    };
  } else {
    // SQLite implementation (Sync wrapped in Async)
    return {
      run: async (...params) => {
        // Handle INSERT OR IGNORE specifically for SQLite if needed (it supports it natively)
        db.run(sql, params);
        const result = db.exec('SELECT last_insert_rowid() as id, changes() as changes');
        saveDatabase();
        return {
          lastInsertRowid: result[0]?.values[0]?.[0] || 0,
          changes: result[0]?.values[0]?.[1] || 0
        };
      },
      get: async (...params) => {
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
      all: async (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) results.push(stmt.getAsObject());
        stmt.free();
        return results;
      }
    };
  }
}

function exec(sql) {
  // exec is usually for schema setup, usually can be sync or async
  // But for simple consistency, we'll make it async
  if (isPostgres) {
    return pgPool.query(sql); // Returns promise
  } else {
    db.run(sql);
    saveDatabase();
    return Promise.resolve();
  }
}

// NOTE: consumers must now use await
module.exports = {
  initDatabase,
  prepare,
  exec,
  saveDatabase
};
