// Криптографічні утиліти для шифрування/дешифрування
// Використовує Web Crypto API

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_HASH = 'SHA-256';
const AES_ALGORITHM = 'AES-GCM';
const AES_KEY_LENGTH = 256;

/**
 * Генерує криптографічну сіль
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Генерує вектор ініціалізації (IV) для AES-GCM
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Створює криптографічний ключ з майстер-пароля
 * @param password - Майстер-пароль користувача
 * @param salt - Криптографічна сіль
 * @returns CryptoKey для шифрування/дешифрування
 */
export async function deriveMasterKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Перетворюємо пароль в ArrayBuffer
  const passwordBuffer = new TextEncoder().encode(password);

  // Імпортуємо пароль як ключ
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Генеруємо ключ з використанням PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    keyMaterial,
    { name: AES_ALGORITHM, length: AES_KEY_LENGTH },
    false, // Ключ не можна експортувати
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Шифрує дані з використанням AES-GCM
 * @param data - Дані для шифрування
 * @param key - Криптографічний ключ
 * @param iv - Вектор ініціалізації
 * @returns Зашифровані дані
 */
export async function encrypt(
  data: string,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: AES_ALGORITHM,
      iv: iv as BufferSource,
    },
    key,
    dataBuffer
  );

  return encryptedData;
}

/**
 * Дешифрує дані з використанням AES-GCM
 * @param encryptedData - Зашифровані дані
 * @param key - Криптографічний ключ
 * @param iv - Вектор ініціалізації
 * @returns Розшифровані дані
 */
export async function decrypt(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: AES_ALGORITHM,
      iv: iv as BufferSource,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

/**
 * Конвертує ArrayBuffer або Uint8Array в Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Конвертує Base64 string в ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Хешує дані з використанням SHA-256
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return arrayBufferToBase64(hashBuffer);
}

/**
 * Перевіряє силу пароля
 * @param password - Пароль для перевірки
 * @returns Оцінка від 0 до 4
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string;
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length < 8) {
    return { score: 0, feedback: 'Пароль має містити мінімум 8 символів' };
  }

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  else feedback.push('Використовуйте великі та малі літери');

  if (/\d/.test(password)) score++;
  else feedback.push('Додайте цифри');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Додайте спеціальні символи');

  const feedbackText =
    score >= 4
      ? 'Надійний пароль'
      : score >= 3
      ? 'Середній пароль'
      : feedback.join('. ');

  return { score, feedback: feedbackText };
}
