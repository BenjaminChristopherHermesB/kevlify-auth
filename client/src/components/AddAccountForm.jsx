import React, { useState } from 'react';

function AddAccountForm({ onSubmit, categories }) {
    const [formData, setFormData] = useState({
        issuer: '',
        username: '',
        secret_encrypted: '',
        type: 2,
        algorithm: 0,
        digits: 6,
        period: 30,
        category_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'type' || name === 'algorithm' || name === 'digits' || name === 'period'
                ? parseInt(value)
                : value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!formData.issuer.trim()) {
            setError('Issuer/Service name is required');
            return;
        }
        if (!formData.secret_encrypted.trim()) {
            setError('Secret key is required');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err.message || 'Failed to add account');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="add-account-form">
            {error && <div className="error-message" role="alert">{error}</div>}

            <div className="form-group">
                <label htmlFor="issuer">Service Name *</label>
                <input
                    id="issuer"
                    name="issuer"
                    type="text"
                    value={formData.issuer}
                    onChange={handleChange}
                    placeholder="e.g., Google, GitHub"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="username">Account (optional)</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g., user@email.com"
                />
            </div>

            <div className="form-group">
                <label htmlFor="secret_encrypted">Secret Key *</label>
                <input
                    id="secret_encrypted"
                    name="secret_encrypted"
                    type="text"
                    value={formData.secret_encrypted}
                    onChange={handleChange}
                    placeholder="Base32 encoded secret"
                    required
                    autoComplete="off"
                />
            </div>

            <div className="form-group">
                <label htmlFor="category_id">Category</label>
                <select
                    id="category_id"
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
                type="button"
                className="toggle-advanced"
                onClick={() => setShowAdvanced(!showAdvanced)}
                aria-expanded={showAdvanced}
            >
                {showAdvanced ? '▼ Hide Advanced' : '▶ Show Advanced'}
            </button>

            {showAdvanced && (
                <div className="advanced-options">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="type">Type</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange}>
                                <option value={2}>TOTP</option>
                                <option value={1}>HOTP</option>
                                <option value={4}>Steam</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="algorithm">Algorithm</label>
                            <select id="algorithm" name="algorithm" value={formData.algorithm} onChange={handleChange}>
                                <option value={0}>SHA-1</option>
                                <option value={1}>SHA-256</option>
                                <option value={2}>SHA-512</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="digits">Digits</label>
                            <select id="digits" name="digits" value={formData.digits} onChange={handleChange}>
                                <option value={6}>6</option>
                                <option value={7}>7</option>
                                <option value={8}>8</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="period">Period (seconds)</label>
                            <input
                                id="period"
                                name="period"
                                type="number"
                                min={10}
                                max={120}
                                value={formData.period}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                className="std-btn primary full-width"
                disabled={loading}
                aria-busy={loading}
            >
                {loading ? 'Adding...' : 'Add Account'}
            </button>
        </form>
    );
}

export default AddAccountForm;
