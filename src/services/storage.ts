// Сервіс для роботи з IndexedDB
import type { EncryptedVault, StorageData } from '../types';
import type { BiometricCredential } from '../utils/biometric';

const DB_NAME = 'DecentralizedAuthDB';
const DB_VERSION = 1;
const STORE_NAME = 'vault';
const STORAGE_KEY = 'vault_data';
const BIOMETRIC_KEY = 'biometric_credential';

/**
 * Ініціалізує базу даних IndexedDB
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Зберігає зашифроване сховище в IndexedDB
 */
export async function saveVault(vault: EncryptedVault): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const data: StorageData = {
      vault,
      lastAccess: Date.now(),
    };

    const request = store.put(data, STORAGE_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save vault'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Завантажує зашифроване сховище з IndexedDB
 */
export async function loadVault(): Promise<EncryptedVault | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STORAGE_KEY);

    request.onsuccess = () => {
      const data = request.result as StorageData | undefined;
      resolve(data?.vault || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to load vault'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Перевіряє, чи існує сховище
 */
export async function vaultExists(): Promise<boolean> {
  try {
    const vault = await loadVault();
    return vault !== null;
  } catch {
    return false;
  }
}

/**
 * Видаляє сховище з IndexedDB
 */
export async function deleteVault(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(STORAGE_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete vault'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Оновлює час останнього доступу
 */
export async function updateLastAccess(): Promise<void> {
  const vault = await loadVault();
  if (vault) {
    await saveVault(vault);
  }
}

/**
 * Отримує час останнього доступу
 */
export async function getLastAccess(): Promise<number | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STORAGE_KEY);

    request.onsuccess = () => {
      const data = request.result as StorageData | undefined;
      resolve(data?.lastAccess || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to get last access time'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Зберігає біометричні credentials
 */
export async function saveBiometricCredential(
  credential: BiometricCredential
): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(credential, BIOMETRIC_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to save biometric credential'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Завантажує біометричні credentials
 */
export async function loadBiometricCredential(): Promise<BiometricCredential | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(BIOMETRIC_KEY);

    request.onsuccess = () => {
      const credential = request.result as BiometricCredential | undefined;
      resolve(credential || null);
    };

    request.onerror = () => {
      reject(new Error('Failed to load biometric credential'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Видаляє біометричні credentials
 */
export async function deleteBiometricCredential(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(BIOMETRIC_KEY);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete biometric credential'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Перевіряє, чи налаштована біометрична автентифікація
 */
export async function isBiometricConfigured(): Promise<boolean> {
  try {
    const credential = await loadBiometricCredential();
    return credential !== null;
  } catch {
    return false;
  }
}
