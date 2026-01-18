import React, { useState } from 'react';
import Modal from './Modal';

function PinUnlockModal({ isOpen, onUnlock, onClose }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await onUnlock(pin);
            if (success) {
                setPin('');
            } else {
                setError('Incorrect PIN');
            }
        } catch (err) {
            setError('Failed to unlock');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Unlock Authenticator">
            <form onSubmit={handleSubmit} className="pin-form">
                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="pin">Enter PIN</label>
                    <input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter your PIN"
                        required
                        autoFocus
                        minLength={4}
                        maxLength={8}
                    />
                    <p className="field-hint">
                        📌 Forgot your PIN? Clear browser data will reset it, but you'll need a backup to restore your accounts.
                    </p>
                </div>

                <button
                    type="submit"
                    className="std-btn primary full-width"
                    disabled={loading || pin.length < 4}
                >
                    {loading ? 'Unlocking...' : 'Unlock'}
                </button>
            </form>
        </Modal>
    );
}

export default PinUnlockModal;
