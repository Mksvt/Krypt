// Головний сервіс для управління сховищем
import type { Account, EncryptedVault } from '../types';
import {
  deriveMasterKey,
  encrypt,
  decrypt,
  generateSalt,
  generateIV,
  arrayBufferToBase64,
  base64ToArrayBuffer,
} from '../utils/crypto';
import { saveVault, loadVault } from './storage';

/**
 * Створює нове зашифроване сховище
 */
export async function createVault(
  password: string,
  accounts: Account[] = []
): Promise<EncryptedVault> {
  // Генеруємо сіль та IV
  const salt = generateSalt();
  const iv = generateIV();

  // Створюємо ключ з пароля
  const key = await deriveMasterKey(password, salt);

  // Шифруємо дані
  const dataString = JSON.stringify(accounts);
  const encryptedData = await encrypt(dataString, key, iv);

  // Створюємо vault
  const vault: EncryptedVault = {
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedData),
    version: 1,
  };

  // Зберігаємо в IndexedDB
  await saveVault(vault);

  return vault;
}

/**
 * Розблокує сховище та повертає акаунти
 */
export async function unlockVault(password: string): Promise<Account[]> {
  // Завантажуємо vault
  const vault = await loadVault();
  if (!vault) {
    throw new Error('Vault not found');
  }

  // Відновлюємо сіль та IV
  const salt = new Uint8Array(base64ToArrayBuffer(vault.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(vault.iv));

  // Створюємо ключ з пароля
  const key = await deriveMasterKey(password, salt);

  try {
    // Дешифруємо дані
    const encryptedData = base64ToArrayBuffer(vault.data);
    const decryptedString = await decrypt(encryptedData, key, iv);

    // Парсимо акаунти
    const accounts = JSON.parse(decryptedString) as Account[];
    return accounts;
  } catch (error) {
    throw new Error('Invalid password or corrupted vault');
  }
}

/**
 * Оновлює сховище з новим списком акаунтів
 */
export async function updateVault(
  password: string,
  accounts: Account[]
): Promise<void> {
  // Завантажуємо vault для отримання salt
  const existingVault = await loadVault();
  if (!existingVault) {
    throw new Error('Vault not found');
  }

  // Використовуємо існуючу сіль, але генеруємо новий IV
  const salt = new Uint8Array(base64ToArrayBuffer(existingVault.salt));
  const iv = generateIV();

  // Створюємо ключ з пароля
  const key = await deriveMasterKey(password, salt);

  // Шифруємо нові дані
  const dataString = JSON.stringify(accounts);
  const encryptedData = await encrypt(dataString, key, iv);

  // Оновлюємо vault
  const vault: EncryptedVault = {
    salt: existingVault.salt,
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedData),
    version: existingVault.version,
  };

  // Зберігаємо
  await saveVault(vault);
}

/**
 * Перевіряє правильність пароля
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    await unlockVault(password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Змінює майстер-пароль
 */
export async function changeMasterPassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  // Розблокуємо з старим паролем
  const accounts = await unlockVault(oldPassword);

  // Створюємо нове сховище з новим паролем
  await createVault(newPassword, accounts);
}

/**
 * Експортує зашифроване сховище як JSON
 */
export async function exportVault(password: string): Promise<string> {
  // Перевіряємо пароль
  await unlockVault(password);

  // Завантажуємо vault
  const vault = await loadVault();
  if (!vault) {
    throw new Error('Vault not found');
  }

  const backup = {
    version: vault.version,
    timestamp: Date.now(),
    vault: vault,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Імпортує зашифроване сховище з JSON
 */
export async function importVault(
  jsonData: string,
  password: string
): Promise<void> {
  try {
    const backup = JSON.parse(jsonData);

    if (!backup.vault || !backup.version) {
      throw new Error('Invalid backup format');
    }

    const vault = backup.vault as EncryptedVault;

    // Перевіряємо, чи можна розшифрувати з вказаним паролем
    const salt = new Uint8Array(base64ToArrayBuffer(vault.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(vault.iv));
    const key = await deriveMasterKey(password, salt);

    const encryptedData = base64ToArrayBuffer(vault.data);
    await decrypt(encryptedData, key, iv);

    // Якщо розшифрування успішне, зберігаємо vault
    await saveVault(vault);
  } catch (error) {
    throw new Error('Invalid backup file or password');
  }
}
