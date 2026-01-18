const express = require('express');
const { prepare } = require('../db/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/users', async (req, res) => {
    try {
        const users = await prepare(`
      SELECT id, email, role, created_at FROM users ORDER BY created_at DESC
    `).all();

        const usersWithCounts = await Promise.all(users.map(async user => {
            const countResult = await prepare('SELECT COUNT(*) as count FROM accounts WHERE user_id = ?').get(user.id);
            return { ...user, account_count: countResult?.count || 0 };
        }));

        res.json({ users: usersWithCounts });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.put('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (parseInt(id) === req.session.userId) {
        return res.status(400).json({ error: 'Cannot change your own role' });
    }

    try {
        const result = await prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Role updated' });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    if (parseInt(id) === req.session.userId) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    try {
        const result = await prepare('DELETE FROM users WHERE id = ?').run(id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
