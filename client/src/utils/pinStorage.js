const PIN_STORAGE_KEY = 'kevlify_pin_hash';

export async function hashPin(pin) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function storePinHash(pinHash) {
    localStorage.setItem(PIN_STORAGE_KEY, pinHash);
}

export async function verifyPin(pin) {
    const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
    if (!storedHash) return false;

    const enteredHash = await hashPin(pin);
    return enteredHash === storedHash;
}

export function hasPin() {
    return !!localStorage.getItem(PIN_STORAGE_KEY);
}

export function clearPin() {
    localStorage.removeItem(PIN_STORAGE_KEY);
}
