const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { prepare } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
    try {
        const accounts = prepare(`
      SELECT * FROM accounts WHERE user_id = ? ORDER BY ranking ASC, created_at DESC
    `).all(req.session.userId);
        res.json({ accounts });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

router.post('/', [
    body('issuer').notEmpty().trim(),
    body('secret_encrypted').notEmpty(),
    body('type').optional().isInt({ min: 1, max: 5 }),
    body('algorithm').optional().isInt({ min: 0, max: 2 }),
    body('digits').optional().isInt({ min: 6, max: 10 }),
    body('period').optional().isInt({ min: 1 }),
    body('counter').optional().isInt({ min: 0 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        issuer,
        username = null,
        secret_encrypted,
        type = 2,
        algorithm = 0,
        digits = 6,
        period = 30,
        counter = 0,
        icon = null,
        category_id = null
    } = req.body;

    try {
        const maxRanking = prepare('SELECT MAX(ranking) as max FROM accounts WHERE user_id = ?').get(req.session.userId);
        const ranking = (maxRanking?.max || 0) + 1;

        const result = prepare(`
      INSERT INTO accounts (user_id, issuer, username, secret_encrypted, type, algorithm, digits, period, counter, icon, category_id, ranking)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            req.session.userId,
            issuer,
            username || null,
            secret_encrypted,
            type,
            algorithm,
            digits,
            period,
            counter,
            icon || null,
            category_id || null,
            ranking
        );

        let account = prepare('SELECT * FROM accounts WHERE id = ?').get(result.lastInsertRowid);

        if (!account) {
            // Fallback: fetch the most recently created account for this user
            // This handles cases where lastInsertRowid might not be reliable
            account = prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY id DESC LIMIT 1').get(req.session.userId);
        }

        if (!account) {
            throw new Error('Account created but could not be retrieved.');
        }

        res.status(201).json({ account });
    } catch (error) {
        console.error('Create account error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

router.put('/:id', [
    param('id').isInt()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    try {
        const account = prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ?').get(id, req.session.userId);
        if (!account) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const allowedFields = ['issuer', 'username', 'icon', 'category_id', 'ranking'];
        const setClauses = [];
        const values = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                setClauses.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        values.push(id, req.session.userId);
        prepare(`UPDATE accounts SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

        const updatedAccount = prepare('SELECT * FROM accounts WHERE id = ?').get(id);
        res.json({ account: updatedAccount });
    } catch (error) {
        console.error('Update account error:', error);
        res.status(500).json({ error: 'Failed to update account' });
    }
});

router.delete('/:id', [
    param('id').isInt()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
        const result = prepare('DELETE FROM accounts WHERE id = ? AND user_id = ?').run(id, req.session.userId);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.json({ message: 'Account deleted' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
