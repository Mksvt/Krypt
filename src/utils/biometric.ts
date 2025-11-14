// Утиліти для біометричної автентифікації (WebAuthn)

/**
 * Перевірка підтримки WebAuthn в браузері
 */
export const isBiometricSupported = (): boolean => {
  return (
    window.PublicKeyCredential !== undefined &&
    navigator.credentials !== undefined
  );
};

/**
 * Перевірка доступності біометричних датчиків на пристрої
 */
export const isBiometricAvailable = async (): Promise<boolean> => {
  if (!isBiometricSupported()) {
    return false;
  }

  try {
    // Перевірка наявності платформного автентифікатора (Touch ID, Face ID, Windows Hello)
    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
};

/**
 * Генерація випадкового challenge для WebAuthn
 */
const generateChallenge = (): Uint8Array => {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
};

/**
 * Конвертація ArrayBuffer в Base64
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Конвертація Base64 в ArrayBuffer
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Інтерфейс для збережених біометричних credentials
 */
export interface BiometricCredential {
  credentialId: string; // Base64 encoded
  publicKey: string; // Base64 encoded
  counter: number;
  createdAt: number;
}

/**
 * Реєстрація біометричної автентифікації
 * Створює нові credentials для пристрою
 */
export const registerBiometric = async (
  username: string
): Promise<BiometricCredential> => {
  if (!isBiometricSupported()) {
    throw new Error('WebAuthn не підтримується вашим браузером');
  }

  const available = await isBiometricAvailable();
  if (!available) {
    throw new Error('Біометричні датчики недоступні на цьому пристрої');
  }

  try {
    const challenge = generateChallenge();

    // Параметри створення credential
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
      {
        challenge: challenge as BufferSource,
        rp: {
          name: 'Decentralized Authenticator',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(username),
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Використовувати вбудовані датчики
          userVerification: 'required', // Вимагати біометрію
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      };

    // Створення credential
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Не вдалося створити credential');
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    // Збереження credential
    const biometricCredential: BiometricCredential = {
      credentialId: arrayBufferToBase64(credential.rawId),
      publicKey: arrayBufferToBase64(response.getPublicKey()!),
      counter: 0,
      createdAt: Date.now(),
    };

    return biometricCredential;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Користувач скасував реєстрацію');
      } else if (error.name === 'InvalidStateError') {
        throw new Error('Біометричні дані вже зареєстровані');
      }
      throw new Error(`Помилка реєстрації: ${error.message}`);
    }
    throw new Error('Невідома помилка при реєстрації');
  }
};

/**
 * Аутентифікація через біометрію
 * Повертає true при успішній автентифікації
 */
export const authenticateWithBiometric = async (
  credentialId: string
): Promise<boolean> => {
  if (!isBiometricSupported()) {
    throw new Error('WebAuthn не підтримується вашим браузером');
  }

  try {
    const challenge = generateChallenge();

    // Параметри для автентифікації
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions =
      {
        challenge: challenge as BufferSource,
        allowCredentials: [
          {
            id: base64ToArrayBuffer(credentialId),
            type: 'public-key',
            transports: ['internal'],
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      };

    // Запит автентифікації
    const credential = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Не вдалося отримати credential');
    }

    // В реальному застосунку тут би була верифікація підпису на сервері
    // Але оскільки це повністю клієнтський застосунок,
    // ми вважаємо успішний виклик WebAuthn достатньою автентифікацією
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Користувач скасував автентифікацію');
      } else if (error.name === 'InvalidStateError') {
        throw new Error('Біометричні дані не знайдені');
      }
      throw new Error(`Помилка автентифікації: ${error.message}`);
    }
    throw new Error('Невідома помилка при автентифікації');
  }
};

/**
 * Видалення біометричних credentials
 * Примітка: WebAuthn не має API для видалення credentials,
 * тому ми просто видаляємо їх з нашого сховища
 */
export const removeBiometric = async (): Promise<void> => {
  // Credentials видаляються з IndexedDB через storage service
  // Це просто placeholder для можливих майбутніх дій
  return Promise.resolve();
};

/**
 * Отримання назви типу біометрії для UI
 */
export const getBiometricTypeName = (): string => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'Touch ID / Face ID';
  } else if (platform.includes('win')) {
    return 'Windows Hello';
  } else if (platform.includes('android') || userAgent.includes('android')) {
    return 'Fingerprint / Face Unlock';
  } else if (platform.includes('iphone') || platform.includes('ipad')) {
    return 'Touch ID / Face ID';
  }

  return 'Biometric Authentication';
};
