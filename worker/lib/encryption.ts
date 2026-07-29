const PREFIX = 'enc:';
const SALT = new TextEncoder().encode('flexurl-encryption-salt');
const ITERATIONS = 100_000;

async function deriveKey(secret: string): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false, ['encrypt', 'decrypt']
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

export async function encrypt(text: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return PREFIX + bufToHex(combined.buffer);
}

export async function decrypt(encryptedStr: string, secret: string): Promise<string> {
  if (!encryptedStr.startsWith(PREFIX)) return encryptedStr;
  const payload = encryptedStr.slice(PREFIX.length);
  const parts = payload.split(':');

  let iv: Uint8Array;
  let ciphertext: Uint8Array;

  if (parts.length === 3) {
    iv = hexToBuf(parts[0]);
    const authTag = hexToBuf(parts[1]);
    const ct = hexToBuf(parts[2]);
    ciphertext = new Uint8Array(ct.length + authTag.length);
    ciphertext.set(ct);
    ciphertext.set(authTag, ct.length);
  } else {
    const data = hexToBuf(payload);
    iv = data.slice(0, 12);
    ciphertext = data.slice(12);
  }

  const key = await deriveKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv }, key, ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
