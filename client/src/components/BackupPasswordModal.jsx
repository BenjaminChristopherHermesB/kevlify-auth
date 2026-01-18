import React, { useState } from 'react';
import Modal from './Modal';

function BackupPasswordModal({ isOpen, onClose, onConfirm, mode = 'export' }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isExport = mode === 'export';

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Password is required');
            return;
        }

        if (isExport && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (isExport && password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            await onConfirm(password);
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    }

    function handleClose() {
        setPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isExport ? 'Encrypt Backup' : 'Decrypt Backup'}
        >
            <form onSubmit={handleSubmit} className="backup-password-form">
                {isExport ? (
                    <div className="modal-warning">
                        <strong>⚠️ Important:</strong>
                        <p>
                            This password encrypts your backup file. If you forget it,
                            your backup <strong>cannot be recovered</strong>. Write it down
                            and store it securely.
                        </p>
                    </div>
                ) : (
                    <p className="modal-description">
                        Enter the password you used when creating this backup.
                    </p>
                )}

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="backup-password">
                        {isExport ? 'Backup Password' : 'Password'}
                    </label>
                    <input
                        id="backup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter a strong password"
                        required
                        autoFocus
                        minLength={isExport ? 8 : 1}
                    />
                </div>

                {isExport && (
                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            required
                            minLength={8}
                        />
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        className="std-btn outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="std-btn primary"
                        disabled={loading || !password || (isExport && password.length < 8)}
                    >
                        {loading
                            ? (isExport ? 'Encrypting...' : 'Decrypting...')
                            : (isExport ? 'Export' : 'Import')
                        }
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default BackupPasswordModal;
