const express = require('express');
const crypto = require('crypto');
const { body, param, validationResult } = require('express-validator');
const { prepare } = require('../db/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function generateCategoryId(name) {
    return crypto.createHash('sha1').update(name).digest('hex').substring(0, 8);
}

router.get('/', async (req, res) => {
    try {
        const categories = await prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY ranking ASC').all(req.session.userId);
        res.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.post('/', [
    body('name').notEmpty().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const id = generateCategoryId(name + Date.now());

    try {
        const existing = await prepare('SELECT id FROM categories WHERE user_id = ? AND name = ?').get(req.session.userId, name);
        if (existing) {
            return res.status(400).json({ error: 'Category already exists' });
        }

        const maxRanking = await prepare('SELECT MAX(ranking) as max FROM categories WHERE user_id = ?').get(req.session.userId);
        const ranking = (maxRanking?.max || 0) + 1;

        await prepare('INSERT INTO categories (id, user_id, name, ranking) VALUES (?, ?, ?, ?)').run(id, req.session.userId, name, ranking);

        const category = await prepare('SELECT * FROM categories WHERE id = ?').get(id);
        res.status(201).json({ category });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.put('/:id', [
    param('id').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, ranking } = req.body;

    try {
        const category = await prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(id, req.session.userId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (name) {
            await prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, id);
        }
        if (ranking !== undefined) {
            await prepare('UPDATE categories SET ranking = ? WHERE id = ?').run(ranking, id);
        }

        const updated = await prepare('SELECT * FROM categories WHERE id = ?').get(id);
        res.json({ category: updated });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

router.delete('/:id', [
    param('id').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    try {
        await prepare('UPDATE accounts SET category_id = NULL WHERE category_id = ? AND user_id = ?').run(id, req.session.userId);
        const result = await prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').run(id, req.session.userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
