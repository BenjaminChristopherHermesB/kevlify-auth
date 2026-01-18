import React, { useState } from 'react';

function AddCategoryForm({ onSubmit }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Category name is required');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({ name });
            setName('');
        } catch (err) {
            setError(err.message || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="add-category-form">
            {error && <div className="error-message" role="alert">{error}</div>}

            <div className="form-group">
                <label htmlFor="category-name">Category Name</label>
                <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Work, Social"
                    required
                    autoFocus
                />
            </div>

            <button
                type="submit"
                className="std-btn primary full-width"
                disabled={loading}
            >
                {loading ? 'Adding...' : 'Add Category'}
            </button>
        </form>
    );
}

export default AddCategoryForm;
