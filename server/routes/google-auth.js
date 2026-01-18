const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { prepare } = require('../db/database');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    const { credential } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        if (!email) {
            return res.status(400).json({ error: 'Email not provided by Google' });
        }

        let user = await prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);

        if (!user) {
            user = await prepare('SELECT * FROM users WHERE email = ? AND oauth_provider = ?').get(email, 'local');

            if (user) {
                return res.status(400).json({
                    error: 'Email already registered with password. Please log in with password first.'
                });
            }

            const result = await prepare(`
                INSERT INTO users (email, oauth_provider, google_id, role) 
                VALUES (?, 'google', ?, 'user')
            `).run(email, googleId);

            user = {
                id: result.lastInsertRowid,
                email,
                oauth_provider: 'google',
                google_id: googleId,
                role: 'user'
            };
        }

        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.role = user.role;

        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ error: 'Invalid Google token' });
    }
});

module.exports = router;
