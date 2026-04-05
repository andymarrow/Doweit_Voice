// lib/utils/crypto.js

import crypto from 'crypto';

// Get the encryption key from environment variables.
// This MUST be a 32-character (256-bit) string.
// NOTE: We do NOT throw at module init — Next.js build imports this file.
// Errors are thrown lazily inside encrypt/decrypt so builds succeed without the key.
const IV_LENGTH = 16; // For AES, this is always 16

function getKey() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 32) {
        throw new Error('ENCRYPTION_KEY environment variable is not set or is not 32 characters long.');
    }
    return key;
}

export function encrypt(text) {
    const ENCRYPTION_KEY = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
    const ENCRYPTION_KEY = getKey();
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}