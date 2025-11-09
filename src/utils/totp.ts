// Утиліти для роботи з TOTP (Time-based One-Time Password)
import { TOTP } from 'otpauth';
import type { Account } from '../types';

/**
 * Генерує TOTP-код для акаунту
 * @param account - Акаунт з секретним ключем
 * @returns 6-значний TOTP-код
 */
export function generateTOTP(account: Account): string {
  const totp = new TOTP({
    issuer: account.issuer,
    label: account.username,
    algorithm: account.algorithm || 'SHA1',
    digits: account.digits || 6,
    period: account.period || 30,
    secret: account.secret,
  });

  return totp.generate();
}

/**
 * Повертає час до наступного оновлення коду (в секундах)
 * @param period - Період оновлення (за замовчуванням 30 секунд)
 */
export function getTimeRemaining(period: number = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

/**
 * Обчислює прогрес таймера (від 0 до 1)
 * @param period - Період оновлення
 */
export function getTimerProgress(period: number = 30): number {
  const remaining = getTimeRemaining(period);
  return remaining / period;
}

/**
 * Парсить otpauth:// URI
 * @param uri - URI формату otpauth://totp/...
 * @returns Об'єкт з параметрами акаунту
 */
export function parseOtpauthUri(uri: string): Partial<Account> | null {
  try {
    const url = new URL(uri);

    if (url.protocol !== 'otpauth:') {
      throw new Error('Invalid protocol');
    }

    if (url.host !== 'totp') {
      throw new Error('Only TOTP is supported');
    }

    const label = decodeURIComponent(url.pathname.substring(1));
    const [issuer, username] = label.includes(':')
      ? label.split(':')
      : [label, ''];

    const params = url.searchParams;
    const secret = params.get('secret');

    if (!secret) {
      throw new Error('Secret is required');
    }

    return {
      issuer: params.get('issuer') || issuer,
      username: username || params.get('account') || '',
      secret: secret,
      algorithm: (params.get('algorithm') as Account['algorithm']) || 'SHA1',
      digits: parseInt(params.get('digits') || '6'),
      period: parseInt(params.get('period') || '30'),
    };
  } catch (error) {
    console.error('Failed to parse otpauth URI:', error);
    return null;
  }
}

/**
 * Валідує secret key
 * @param secret - Secret key в base32
 */
export function validateSecret(secret: string): boolean {
  // Base32 alphabet
  const base32Regex = /^[A-Z2-7]+=*$/;
  return base32Regex.test(secret.toUpperCase().replace(/\s/g, ''));
}

/**
 * Форматує secret key (видаляє пробіли, переводить у верхній регістр)
 */
export function formatSecret(secret: string): string {
  return secret.toUpperCase().replace(/\s/g, '');
}
