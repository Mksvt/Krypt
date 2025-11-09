# Приклади Використання API

## Криптографія

### Створення зашифрованого сховища

```typescript
import { createVault } from './services/vault';

const password = 'my-secure-password';
const accounts = [];

const vault = await createVault(password, accounts);
// Автоматично зберігається в IndexedDB
```

### Розблокування сховища

```typescript
import { unlockVault } from './services/vault';

try {
  const accounts = await unlockVault('my-secure-password');
  console.log('Успішно розблоковано', accounts.length, 'акаунтів');
} catch (error) {
  console.error('Невірний пароль');
}
```

### Оновлення сховища

```typescript
import { updateVault } from './services/vault';

const newAccounts = [...accounts, newAccount];
await updateVault(password, newAccounts);
```

## TOTP

### Генерація TOTP коду

```typescript
import { generateTOTP } from './utils/totp';

const account = {
  id: '123',
  issuer: 'Google',
  username: 'user@example.com',
  secret: 'JBSWY3DPEHPK3PXP',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  createdAt: Date.now(),
};

const code = generateTOTP(account);
console.log('Current code:', code); // "123456"
```

### Парсинг QR коду

```typescript
import { parseOtpauthUri } from './utils/totp';

const uri =
  'otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google';
const parsed = parseOtpauthUri(uri);

if (parsed) {
  console.log('Issuer:', parsed.issuer);
  console.log('Username:', parsed.username);
  console.log('Secret:', parsed.secret);
}
```

### Валідація секретного ключа

```typescript
import { validateSecret, formatSecret } from './utils/totp';

const secret = 'JBSW Y3DP EHPK 3PXP'; // з пробілами

if (validateSecret(secret)) {
  const formatted = formatSecret(secret);
  console.log('Formatted:', formatted); // "JBSWY3DPEHPK3PXP"
}
```

## Storage

### Перевірка існування сховища

```typescript
import { vaultExists } from './services/storage';

const exists = await vaultExists();
if (!exists) {
  // Показати onboarding
}
```

### Завантаження vault

```typescript
import { loadVault } from './services/storage';

const vault = await loadVault();
if (vault) {
  console.log('Vault version:', vault.version);
  console.log('Salt:', vault.salt);
}
```

### Видалення vault

```typescript
import { deleteVault } from './services/storage';

await deleteVault();
// Всі дані видалено з IndexedDB
```

## Context

### Використання AppContext

```typescript
import { useApp } from './context/AppContext';

function MyComponent() {
  const { isLocked, accounts, addAccount, removeAccount, lock, unlock } =
    useApp();

  const handleAddAccount = async () => {
    await addAccount({
      issuer: 'GitHub',
      username: 'myuser',
      secret: 'SECRET',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    });
  };

  return (
    <div>
      {isLocked ? (
        <p>Locked</p>
      ) : (
        <>
          <p>Accounts: {accounts.length}</p>
          <button onClick={handleAddAccount}>Add</button>
          <button onClick={lock}>Lock</button>
        </>
      )}
    </div>
  );
}
```

## Backup/Restore

### Експорт

```typescript
import { exportVault } from './services/vault';

const jsonData = await exportVault(password);

// Створення файлу
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'backup.json';
a.click();
URL.revokeObjectURL(url);
```

### Імпорт

```typescript
import { importVault } from './services/vault';

const handleFileUpload = async (file: File) => {
  const text = await file.text();

  try {
    await importVault(text, password);
    console.log('Успішно відновлено');
    window.location.reload();
  } catch (error) {
    console.error('Невірний файл або пароль');
  }
};
```

## Утиліти

### Перевірка надійності пароля

```typescript
import { checkPasswordStrength } from './utils/crypto';

const password = 'MyP@ssw0rd123';
const result = checkPasswordStrength(password);

console.log('Score:', result.score); // 0-4
console.log('Feedback:', result.feedback);

// Score 0: Дуже слабкий
// Score 1-2: Слабкий
// Score 3: Середній
// Score 4: Надійний
```

### Конвертація Base64

```typescript
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils/crypto';

// Array → Base64
const data = new Uint8Array([1, 2, 3, 4, 5]);
const base64 = arrayBufferToBase64(data);

// Base64 → Array
const restored = new Uint8Array(base64ToArrayBuffer(base64));
```

## React Hooks

### useEffect для TOTP оновлення

```typescript
import { useState, useEffect } from 'react';
import { generateTOTP, getTimeRemaining } from './utils/totp';

function useTOTP(account: Account) {
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);

  useEffect(() => {
    const update = () => {
      setCode(generateTOTP(account));
      setTimeRemaining(getTimeRemaining(account.period));
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [account]);

  return { code, timeRemaining };
}
```

### Auto-lock після неактивності

```typescript
import { useEffect, useState } from 'react';

const TIMEOUT = 5 * 60 * 1000; // 5 хвилин

function useAutoLock(onLock: () => void) {
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart'];
    const updateActivity = () => setLastActivity(Date.now());

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  useEffect(() => {
    const check = setInterval(() => {
      if (Date.now() - lastActivity > TIMEOUT) {
        onLock();
      }
    }, 10000);

    return () => clearInterval(check);
  }, [lastActivity, onLock]);
}
```

## Тестові дані

### Створення тестового акаунту

```typescript
// Для розробки та тестування
const testAccount: Account = {
  id: crypto.randomUUID(),
  issuer: 'Test Service',
  username: 'test@example.com',
  secret: 'JBSWY3DPEHPK3PXP', // Валідний Base32
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
  createdAt: Date.now(),
};

// Цей секрет згенерує коди, які можна перевірити
// онлайн TOTP калькулятором
```

### QR код для тестування

```
otpauth://totp/TestService:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TestService
```

Згенеруйте QR з цього URI для тестування сканера.

## Production Tips

### Обробка помилок

```typescript
try {
  await addAccount(newAccount);
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
    // Показати користувачу
    alert(`Помилка: ${error.message}`);
  }
}
```

### Логування (без секретів!)

```typescript
// ❌ НЕ РОБІТЬ ТАК
console.log('Account:', account); // Містить secret!

// ✅ ПРАВИЛЬНО
console.log('Account added:', {
  issuer: account.issuer,
  username: account.username,
  // Без secret!
});
```

### Memory cleanup

```typescript
// При logout/lock
const cleanup = () => {
  // Очистити стан
  setState({
    accounts: [],
    masterKey: null,
  });

  // Очистити пароль
  setPassword('');
};
```
