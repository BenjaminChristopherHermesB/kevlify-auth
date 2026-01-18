import React, { createContext, useContext, useState, useEffect } from 'react';
import { hasPin, verifyPin, hashPin, storePinHash, clearPin as clearPinStorage } from '../utils/pinStorage';

const PinLockContext = createContext(null);

export function PinLockProvider({ children }) {
    const [locked, setLocked] = useState(true);
    const [pinExists, setPinExists] = useState(false);

    useEffect(() => {
        const checkPin = () => {
            const exists = hasPin();
            setPinExists(exists);
            if (!exists) {
                setLocked(false);
            }
        };
        checkPin();
    }, []);

    async function unlock(pin) {
        const isValid = await verifyPin(pin);
        if (isValid) {
            setLocked(false);
            return true;
        }
        return false;
    }

    function lock() {
        if (pinExists) {
            setLocked(true);
        }
    }

    async function setPin(pin) {
        const pinHash = await hashPin(pin);
        storePinHash(pinHash);
        setPinExists(true);
        setLocked(false);
    }

    function clearPin() {
        clearPinStorage();
        setPinExists(false);
        setLocked(false);
    }

    return (
        <PinLockContext.Provider value={{
            locked,
            pinExists,
            unlock,
            lock,
            setPin,
            clearPin
        }}>
            {children}
        </PinLockContext.Provider>
    );
}

export function usePinLock() {
    const context = useContext(PinLockContext);
    if (!context) throw new Error('usePinLock must be used within PinLockProvider');
    return context;
}
