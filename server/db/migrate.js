const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/kevlify.db');

async function migrate() {
    console.log('Starting database migration...');

    if (!fs.existsSync(dbPath)) {
        console.log('No existing database found. Migration not needed.');
        return;
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);

    try {
        // Check if columns already exist
        const tableInfo = db.exec("PRAGMA table_info(users)");
        const columns = tableInfo[0]?.values.map(row => row[1]) || [];

        console.log('Existing columns:', columns);

        // Add oauth_provider column if it doesn't exist
        if (!columns.includes('oauth_provider')) {
            console.log('Adding oauth_provider column...');
            db.run(`ALTER TABLE users ADD COLUMN oauth_provider TEXT DEFAULT 'local' CHECK(oauth_provider IN ('local', 'google'))`);
            console.log('✅ Added oauth_provider column');
        } else {
            console.log('✅ oauth_provider column already exists');
        }

        // Add google_id column if it doesn't exist
        if (!columns.includes('google_id')) {
            console.log('Adding google_id column...');
            db.run(`ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE`);
            console.log('✅ Added google_id column');
        } else {
            console.log('✅ google_id column already exists');
        }

        // Make password_hash nullable by creating a new table and copying data
        if (columns.includes('password_hash')) {
            console.log('Checking if password_hash is nullable...');

            // Create new table with correct schema
            db.run(`
                CREATE TABLE IF NOT EXISTS users_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT,
                    oauth_provider TEXT DEFAULT 'local' CHECK(oauth_provider IN ('local', 'google')),
                    google_id TEXT UNIQUE,
                    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Copy data from old table to new table
            db.run(`
                INSERT INTO users_new (id, email, password_hash, oauth_provider, google_id, role, created_at)
                SELECT id, email, password_hash, 
                       COALESCE(oauth_provider, 'local'), 
                       google_id, 
                       role, 
                       created_at
                FROM users
            `);

            // Drop old table and rename new table
            db.run(`DROP TABLE users`);
            db.run(`ALTER TABLE users_new RENAME TO users`);

            console.log('✅ Updated users table schema (password_hash is now nullable)');
        }

        // Save the updated database
        const data = db.export();
        const newBuffer = Buffer.from(data);
        fs.writeFileSync(dbPath, newBuffer);

        db.close();
        console.log('\n✅ Migration completed successfully!');
        console.log('You can now restart your server.\n');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        db.close();
        process.exit(1);
    }
}

migrate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
