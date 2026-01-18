import React, { useState, useEffect, lazy, Suspense } from 'react';
import api from '../services/api';
import AccountBox from '../components/AccountBox';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ErrorBoundary from '../components/ErrorBoundary';
import AddAccountForm from '../components/AddAccountForm';
import EditAccountForm from '../components/EditAccountForm';
import AddCategoryForm from '../components/AddCategoryForm';

const QRScanner = lazy(() => import('../components/QRScanner'));

function Authenticator() {
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [accountsRes, categoriesRes] = await Promise.all([
                api.get('/accounts'),
                api.get('/categories')
            ]);
            setAccounts(accountsRes.accounts);
            setCategories(categoriesRes.categories);
        } catch (err) {
            setError(err.message || 'Failed to load accounts');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddAccount(accountData) {
        try {
            const response = await api.post('/accounts', accountData);
            setAccounts([...accounts, response.account]);
            setIsAddModalOpen(false);
            return true;
        } catch (err) {
            throw new Error(err.message || 'Failed to add account');
        }
    }

    async function handleUpdateAccount(id, updates) {
        try {
            const response = await api.put(`/accounts/${id}`, updates);
            setAccounts(accounts.map(a => a.id === id ? response.account : a));
        } catch (err) {
            setError(err.message || 'Failed to update account');
            throw err;
        }
    }

    async function handleEditAccountSubmit(id, updates) {
        await handleUpdateAccount(id, updates);
        setEditingAccount(null);
    }

    async function handleDeleteAccount(id) {
        try {
            await api.delete(`/accounts/${id}`);
            setAccounts(accounts.filter(a => a.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to delete account');
        }
    }

    async function handleAddCategory(categoryData) {
        try {
            const response = await api.post('/categories', categoryData);
            setCategories([...categories, response.category].sort((a, b) => a.ranking - b.ranking));
            setIsAddCategoryModalOpen(false);
        } catch (err) {
            throw err;
        }
    }

    function handleQRScan(data) {
        setIsQRModalOpen(false);
        const parsed = parseOTPUri(data);
        if (parsed) {
            handleAddAccount(parsed);
        }
    }

    function parseOTPUri(uri) {
        try {
            const url = new URL(uri);
            if (url.protocol !== 'otpauth:') return null;

            const type = url.host === 'totp' ? 2 : url.host === 'hotp' ? 1 : 2;
            const path = decodeURIComponent(url.pathname.slice(1));
            const [issuer, username] = path.includes(':') ? path.split(':') : [path, ''];

            return {
                type,
                issuer: url.searchParams.get('issuer') || issuer,
                username: username || '',
                secret_encrypted: url.searchParams.get('secret'),
                algorithm: { SHA1: 0, SHA256: 1, SHA512: 2 }[url.searchParams.get('algorithm')] || 0,
                digits: parseInt(url.searchParams.get('digits')) || 6,
                period: parseInt(url.searchParams.get('period')) || 30,
                counter: parseInt(url.searchParams.get('counter')) || 0
            };
        } catch {
            return null;
        }
    }

    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = !searchQuery ||
            account.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (account.username && account.username.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = !selectedCategory || account.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return <Spinner message="Loading your accounts..." />;
    }

    return (
        <article className="page authenticator-page">
            <header className="authenticator-header">
                <h1>Your Accounts</h1>
                <div className="authenticator-actions">
                    <input
                        type="search"
                        placeholder="Search accounts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        aria-label="Search accounts"
                    />
                    <button
                        className="std-btn primary"
                        onClick={() => setIsAddModalOpen(true)}
                        aria-label="Add new account"
                    >
                        + Add Account
                    </button>
                    <button
                        className="std-btn outline"
                        onClick={() => setIsQRModalOpen(true)}
                        aria-label="Scan QR code"
                    >
                        📷 Scan QR
                    </button>
                </div>
            </header>

            {error && (
                <div className="error-message" role="alert">{error}</div>
            )}

            <div className="authenticator-layout">
                <aside className="category-sidebar" aria-label="Categories">
                    <h2>
                        Categories
                        <button
                            className="btn-icon-small"
                            onClick={() => setIsAddCategoryModalOpen(true)}
                            aria-label="Add Category"
                            title="Add Category"
                        >
                            +
                        </button>
                    </h2>
                    <ul>
                        <li>
                            <button
                                className={!selectedCategory ? 'active' : ''}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All ({accounts.length})
                            </button>
                        </li>
                        {categories.map(cat => (
                            <li key={cat.id}>
                                <button
                                    className={selectedCategory === cat.id ? 'active' : ''}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name} ({accounts.filter(a => a.category_id === cat.id).length})
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="accounts-grid">
                    {filteredAccounts.length === 0 ? (
                        <div className="empty-state">
                            <p>No accounts found</p>
                            <button
                                className="std-btn primary"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                Add your first account
                            </button>
                        </div>
                    ) : (
                        filteredAccounts.map(account => (
                            <AccountBox
                                key={account.id}
                                account={account}
                                onDelete={handleDeleteAccount}
                                onEdit={setEditingAccount}
                            />
                        ))
                    )}
                </main>
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Account"
            >
                <AddAccountForm
                    onSubmit={handleAddAccount}
                    categories={categories}
                />
            </Modal>

            <Modal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                title="Add Category"
            >
                <AddCategoryForm onSubmit={handleAddCategory} />
            </Modal>

            {editingAccount && (
                <Modal
                    isOpen={!!editingAccount}
                    onClose={() => setEditingAccount(null)}
                    title="Edit Account"
                >
                    <EditAccountForm
                        account={editingAccount}
                        categories={categories}
                        onSubmit={handleEditAccountSubmit}
                    />
                </Modal>
            )}

            {isQRModalOpen && (
                <Modal
                    isOpen={isQRModalOpen}
                    onClose={() => setIsQRModalOpen(false)}
                    title="Scan QR Code"
                >
                    <ErrorBoundary>
                        <Suspense fallback={<Spinner message="Loading scanner..." />}>
                            <QRScanner
                                key="qr-scanner"
                                onScan={handleQRScan}
                                onClose={() => setIsQRModalOpen(false)}
                            />
                        </Suspense>
                    </ErrorBoundary>
                </Modal>
            )}
        </article>
    );
}

export default Authenticator;
