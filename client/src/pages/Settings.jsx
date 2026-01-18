import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import BackupPasswordModal from '../components/BackupPasswordModal';
import { encryptBackup, decryptBackup, downloadAuthProBackup, readAuthProFile } from '../utils/encryptedBackup';

function Settings() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [pendingImportFile, setPendingImportFile] = useState(null);

    async function handleExportEncrypted(password) {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/backup/export');

            const encryptedBackup = await encryptBackup(response, password);

            downloadAuthProBackup(encryptedBackup);

            setMessage('Encrypted backup (.authpro) exported successfully!');
            setShowExportModal(false);
        } catch (err) {
            setError(err.message || 'Export failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleExportLegacy() {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/backup/export');
            const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kevlify-backup-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setMessage('Legacy backup (.json) exported successfully!');
        } catch (err) {
            setError(err.message || 'Export failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleImportFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const isAuthPro = file.name.endsWith('.authpro');

        if (isAuthPro) {
            setPendingImportFile(file);
            setShowImportModal(true);
        } else {
            await importLegacyBackup(file);
        }

        e.target.value = '';
    }

    async function handleImportEncrypted(password) {
        if (!pendingImportFile) return;

        setLoading(true);
        setError('');
        try {
            const encryptedData = await readAuthProFile(pendingImportFile);

            const decryptedBackup = await decryptBackup(encryptedData, password);

            const replaceExisting = confirm('Replace existing accounts? Click Cancel to merge instead.');
            await api.post('/backup/import', { backup: decryptedBackup, replaceExisting });

            setMessage('Encrypted backup imported successfully! Refresh to see your accounts.');
            setShowImportModal(false);
            setPendingImportFile(null);
        } catch (err) {
            setError(err.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    }

    async function importLegacyBackup(file) {
        setLoading(true);
        setError('');
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            const replaceExisting = confirm('Replace existing accounts? Click Cancel to merge instead.');
            await api.post('/backup/import', { backup, replaceExisting });
            setMessage('Backup imported successfully! Refresh to see your accounts.');
        } catch (err) {
            setError(err.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <article className="page settings-page">
            <h1>Settings</h1>

            {loading && <Spinner message="Processing..." />}

            {message && <div className="success-message" role="status">{message}</div>}
            {error && <div className="error-message" role="alert">{error}</div>}

            <section className="settings-section" aria-labelledby="account-heading">
                <h2 id="account-heading">Account</h2>
                <div className="settings-card">
                    <div className="setting-row">
                        <label>Email</label>
                        <span>{user?.email}</span>
                    </div>
                    <div className="setting-row">
                        <label>Role</label>
                        <span className="badge">{user?.role}</span>
                    </div>
                </div>
            </section>

            <section className="settings-section" aria-labelledby="appearance-heading">
                <h2 id="appearance-heading">Appearance</h2>
                <div className="settings-card">
                    <div className="setting-row">
                        <div>
                            <strong>Theme</strong>
                            <p>Choose your preferred color scheme</p>
                        </div>
                        <div className="theme-selector">
                            <button
                                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                                aria-pressed={theme === 'light'}
                            >
                                Light
                            </button>
                            <button
                                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                                aria-pressed={theme === 'dark'}
                            >
                                Dark
                            </button>
                            <button
                                className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                                onClick={() => setTheme('system')}
                                aria-pressed={theme === 'system'}
                            >
                                System
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="settings-section" aria-labelledby="backup-heading">
                <h2 id="backup-heading">Backup & Restore</h2>
                <div className="settings-card">
                    <div className="backup-warning">
                        <strong>⚠️ Always keep a backup!</strong>
                        <p>
                            Your encryption keys are stored locally. If you clear browser data
                            without a backup, you'll lose access to your OTP secrets.
                        </p>
                    </div>

                    <div className="backup-section">
                        <h3>Export Backup</h3>
                        <p>Choose your backup format:</p>
                        <div className="settings-actions">
                            <button
                                className="std-btn primary"
                                onClick={() => setShowExportModal(true)}
                                disabled={loading}
                                aria-label="Export encrypted backup"
                            >
                                🔒 Export Encrypted (.authpro)
                            </button>
                            <button
                                className="std-btn outline"
                                onClick={handleExportLegacy}
                                disabled={loading}
                                aria-label="Export legacy backup"
                                title="Plain JSON backup (not recommended)"
                            >
                                📄 Export Legacy (.json)
                            </button>
                        </div>
                        <p className="field-hint">
                            <strong>Recommended:</strong> Use encrypted .authpro format for maximum security.
                        </p>
                    </div>

                    <div className="backup-section">
                        <h3>Import Backup</h3>
                        <p>Restore from a previous backup file (.authpro or .json):</p>
                        <div className="settings-actions">
                            <button
                                className="std-btn outline"
                                onClick={() => document.getElementById('import-file').click()}
                                disabled={loading}
                                aria-label="Import backup"
                            >
                                📥 Import Backup
                            </button>
                            <input
                                id="import-file"
                                type="file"
                                accept=".authpro,.json"
                                onChange={handleImportFile}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="settings-section" aria-labelledby="security-heading">
                <h2 id="security-heading">Security</h2>
                <div className="settings-card">
                    <div className="setting-row">
                        <div>
                            <strong>Client-Side Encryption</strong>
                            <p>Your secrets are encrypted in your browser using AES-GCM.</p>
                        </div>
                        <span className="badge success">Enabled</span>
                    </div>
                </div>
            </section>

            {user?.role === 'admin' && (
                <section className="settings-section" aria-labelledby="admin-heading">
                    <h2 id="admin-heading">Admin</h2>
                    <div className="settings-card">
                        <p>Admin features coming soon: user management, system logs.</p>
                    </div>
                </section>
            )}

            <BackupPasswordModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onConfirm={handleExportEncrypted}
                mode="export"
            />

            <BackupPasswordModal
                isOpen={showImportModal}
                onClose={() => {
                    setShowImportModal(false);
                    setPendingImportFile(null);
                }}
                onConfirm={handleImportEncrypted}
                mode="import"
            />
        </article>
    );
}

export default Settings;
