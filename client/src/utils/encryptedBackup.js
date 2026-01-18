const PBKDF2_ITERATIONS = 100000;
const AES_KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        passwordKey,
        { name: 'AES-GCM', length: AES_KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encryptBackup(data, password) {
    try {
        const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        const key = await deriveKey(password, salt);

        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            dataBuffer
        );

        return {
            version: 1,
            encrypted: arrayBufferToBase64(encryptedData),
            iv: arrayBufferToBase64(iv),
            salt: arrayBufferToBase64(salt),
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt backup');
    }
}

export async function decryptBackup(encryptedBackup, password) {
    try {
        if (!encryptedBackup.version || encryptedBackup.version !== 1) {
            throw new Error('Unsupported backup version');
        }

        const salt = new Uint8Array(base64ToArrayBuffer(encryptedBackup.salt));
        const iv = new Uint8Array(base64ToArrayBuffer(encryptedBackup.iv));
        const encryptedData = base64ToArrayBuffer(encryptedBackup.encrypted);

        const key = await deriveKey(password, salt);

        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedData);
        return JSON.parse(jsonString);
    } catch (error) {
        if (error.name === 'OperationError' || error.message.includes('decrypt')) {
            throw new Error('Incorrect password or corrupted backup file');
        }
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt backup');
    }
}

export function downloadAuthProBackup(encryptedBackup, filename = `kevlify-backup-${Date.now()}.authpro`) {
    const blob = new Blob([JSON.stringify(encryptedBackup, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export async function readAuthProFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid .authpro file format'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
