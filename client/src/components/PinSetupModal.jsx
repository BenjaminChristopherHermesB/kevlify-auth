import React, { useState } from 'react';
import Modal from './Modal';

function PinSetupModal({ isOpen, onSetup, onClose }) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        setLoading(true);
        try {
            await onSetup(pin);
            setPin('');
            setConfirmPin('');
            onClose();
        } catch (err) {
            setError('Failed to set PIN');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Set Up PIN Lock">
            <form onSubmit={handleSubmit} className="pin-form">
                <p className="modal-description">
                    Set a PIN to lock access to your OTP codes. This is a <strong>UI-only lock</strong> and does not encrypt your data.
                </p>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="pin">PIN (4-8 digits)</label>
                    <input
                        id="pin"
                        type="password"
                        inputMode="numeric"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter PIN"
                        required
                        autoFocus
                        minLength={4}
                        maxLength={8}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPin">Confirm PIN</label>
                    <input
                        id="confirmPin"
                        type="password"
                        inputMode="numeric"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Confirm PIN"
                        required
                        minLength={4}
                        maxLength={8}
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="std-btn outline"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="std-btn primary"
                        disabled={loading || pin.length < 4 || confirmPin.length < 4}
                    >
                        {loading ? 'Setting...' : 'Set PIN'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default PinSetupModal;
