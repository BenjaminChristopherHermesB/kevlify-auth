const express = require('express');
const { prepare, exec, saveDatabase } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/export', (req, res) => {
    try {
        const accounts = prepare('SELECT * FROM accounts WHERE user_id = ? ORDER BY ranking ASC').all(req.session.userId);
        const categories = prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY ranking ASC').all(req.session.userId);

        const backup = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            authenticators: accounts.map(a => ({
                type: a.type,
                icon: a.icon,
                issuer: a.issuer,
                username: a.username,
                secretEncrypted: a.secret_encrypted,
                algorithm: a.algorithm,
                digits: a.digits,
                period: a.period,
                counter: a.counter,
                ranking: a.ranking,
                categoryId: a.category_id
            })),
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                ranking: c.ranking
            }))
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=kevlify-backup-${Date.now()}.json`);
        res.json(backup);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export backup' });
    }
});

router.post('/import', (req, res) => {
    const { backup, replaceExisting } = req.body;

    if (!backup || !backup.authenticators) {
        return res.status(400).json({ error: 'Invalid backup format' });
    }

    try {
        if (replaceExisting) {
            prepare('DELETE FROM accounts WHERE user_id = ?').run(req.session.userId);
            prepare('DELETE FROM categories WHERE user_id = ?').run(req.session.userId);
        }

        if (backup.categories) {
            for (const cat of backup.categories) {
                try {
                    prepare(`INSERT OR IGNORE INTO categories (id, user_id, name, ranking) VALUES (?, ?, ?, ?)`).run(cat.id, req.session.userId, cat.name, cat.ranking || 0);
                } catch (e) {
                    console.log('Category insert skipped:', e.message);
                }
            }
        }

        let importedCount = 0;
        for (const auth of backup.authenticators) {
            prepare(`
        INSERT INTO accounts (user_id, type, issuer, username, secret_encrypted, algorithm, digits, period, counter, icon, category_id, ranking)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
                req.session.userId,
                auth.type || 2,
                auth.issuer,
                auth.username || null,
                auth.secretEncrypted || auth.secret_encrypted,
                auth.algorithm || 0,
                auth.digits || 6,
                auth.period || 30,
                auth.counter || 0,
                auth.icon || null,
                auth.categoryId || auth.category_id || null,
                auth.ranking || 0
            );
            importedCount++;
        }

        saveDatabase();

        res.json({
            message: 'Import successful',
            imported: importedCount,
            categories: backup.categories?.length || 0
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Failed to import backup' });
    }
});

module.exports = router;
