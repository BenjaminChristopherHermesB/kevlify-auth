import React, { useState } from 'react';

function EditAccountForm({ account, categories, onSubmit }) {
    const [formData, setFormData] = useState({
        issuer: account.issuer,
        username: account.username || '',
        category_id: account.category_id || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!formData.issuer.trim()) {
            setError('Service name is required');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(account.id, formData);
        } catch (err) {
            setError(err.message || 'Failed to update account');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="edit-account-form">
            {error && <div className="error-message" role="alert">{error}</div>}

            <div className="form-group">
                <label htmlFor="edit-issuer">Service Name</label>
                <input
                    id="edit-issuer"
                    name="issuer"
                    type="text"
                    value={formData.issuer}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-username">Account / Email (optional)</label>
                <input
                    id="edit-username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                    id="edit-category"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                >
                    <option value="">None</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="std-btn primary full-width"
                disabled={loading}
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}

export default EditAccountForm;
