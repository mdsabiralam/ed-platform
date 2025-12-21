import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-gcm';

export class EncryptionUtil {
  // প্রোডাকশনে এই কি (Key) অবশ্যই .env ফাইল থেকে লোড করবেন
  private static readonly SECRET = process.env.ENCRYPTION_KEY || 'default-super-secret-key-change-it';

  // পাসওয়ার্ড থেকে ৩২ বাইটের কি জেনারেট করা
  private static async getKey(): Promise<Buffer> {
    return (await promisify(scrypt)(this.SECRET, 'salt', 32)) as Buffer;
  }

  /**
   * টেক্সট এনক্রিপ্ট করে (Format: iv:authTag:encryptedData)
   */
  static async encrypt(text: string): Promise<string> {
    if (!text) return text;
    
    const key = await this.getKey();
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // IV এবং AuthTag সাথে সেভ করা জরুরি ডিক্রিপশনের জন্য
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * এনক্রিপ্টেড টেক্সট ডিক্রিপ্ট করে
   */
  static async decrypt(text: string): Promise<string> {
    if (!text || !text.includes(':')) return text; // যদি এনক্রিপ্টেড না হয়
    
    const [ivHex, authTagHex, encryptedHex] = text.split(':');
    
    const key = await this.getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}