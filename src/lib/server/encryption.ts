import crypto from 'crypto';

// Use a 32-byte key for AES-256. 
// In production, this MUST come from process.env.ENCRYPTION_KEY
const ENCRYPTION_KEY_RAW = process.env.ENCRYPTION_KEY || 'kelly-trading-os-secret-secure-k';
// Hash the env string to guarantee exactly 32 bytes limit for AES-256 regardless of user input format/length
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(ENCRYPTION_KEY_RAW)).digest();

const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a text string using AES-256-CBC.
 */
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a text string using AES-256-CBC.
 */
export function decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
