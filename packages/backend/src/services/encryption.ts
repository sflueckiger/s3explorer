import { createCipheriv, createDecipheriv, randomBytes, scrypt, ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify<
  string | Buffer,
  string | Buffer,
  number,
  ScryptOptions,
  Buffer
>(scrypt as any);

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;

// scrypt parameters (N=2^17, r=8, p=1) - ~128MB memory, secure against GPU attacks
const SCRYPT_PARAMS: ScryptOptions = {
  N: 131072, // 2^17
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024, // 256MB max
};

export interface EncryptedData {
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
  tag: string; // base64 auth tag
}

async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
}

export async function encrypt(plaintext: string, password: string): Promise<EncryptedData> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    ciphertext: encrypted.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export async function decrypt(data: EncryptedData, password: string): Promise<string> {
  const salt = Buffer.from(data.salt, "base64");
  const iv = Buffer.from(data.iv, "base64");
  const ciphertext = Buffer.from(data.ciphertext, "base64");
  const tag = Buffer.from(data.tag, "base64");

  const key = await deriveKey(password, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}

export function isEncryptedData(data: unknown): data is EncryptedData {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.salt === "string" &&
    typeof obj.iv === "string" &&
    typeof obj.ciphertext === "string" &&
    typeof obj.tag === "string"
  );
}
