require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path');

const { initDatabase } = require('./db/database');

const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/google-auth');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
const backupRoutes = require('./routes/backup');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
// Allow localhost (any port) and any Render.com subdomain
const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,
    /^https:\/\/.*\.onrender\.com$/
];

// If specific origins are provided in env, add them too (for custom domains)
if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(',').forEach(origin => {
        allowedOrigins.push(origin.trim());
    });
}

console.log('CORS Configured with Regex Patterns for *.onrender.com and localhost');

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false
}));

app.use(morgan(isProduction ? 'combined' : 'dev'));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/admin', adminRoutes);

// if (isProduction) {
//     app.use(express.static(path.join(__dirname, '../client/dist')));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, '../client/dist/index.html'));
//     });
// }

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

async function startServer() {
    try {
        await initDatabase();
        console.log('Database initialized');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
