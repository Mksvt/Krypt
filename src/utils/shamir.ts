// Утиліти для соціального відновлення за Схемою Шаміра
import secrets from 'secrets.js-34r7h';
import { hash } from './crypto';

export interface ShamirShare {
  id: string;
  share: string;
  threshold: number;
  totalShares: number;
  createdAt: number;
  holderName?: string;
}

export interface RecoverySetup {
  shares: ShamirShare[];
  threshold: number;
  secret: string;
}

/**
 * Створює частини за Схемою Шаміра
 * @param secret - Секрет для розділення (майстер-пароль)
 * @param totalShares - Загальна кількість частин (рекомендовано 3-7)
 * @param threshold - Мінімальна кількість частин для відновлення (рекомендовано 2-4)
 * @returns Масив частин
 */
export function createShamirShares(
  secret: string,
  totalShares: number,
  threshold: number
): ShamirShare[] {
  // Валідація
  if (threshold > totalShares) {
    throw new Error('Threshold не може бути більшим за загальну кількість частин');
  }

  if (threshold < 2) {
    throw new Error('Threshold має бути мінімум 2');
  }

  if (totalShares > 10) {
    throw new Error('Максимум 10 частин');
  }

  // Конвертуємо секрет в hex
  const secretHex = secrets.str2hex(secret);

  // Генеруємо частини
  const sharesArray = secrets.share(secretHex, totalShares, threshold);

  // Створюємо структуровані об'єкти
  const shares: ShamirShare[] = sharesArray.map((share, index) => ({
    id: `share-${index + 1}`,
    share,
    threshold,
    totalShares,
    createdAt: Date.now(),
  }));

  return shares;
}

/**
 * Відновлює секрет з частин
 * @param shares - Масив частин (мінімум threshold)
 * @returns Відновлений секрет
 */
export function recoverFromShares(shares: ShamirShare[]): string {
  if (shares.length === 0) {
    throw new Error('Потрібна хоча б одна частина');
  }

  // Перевіряємо чи достатньо частин
  const threshold = shares[0].threshold;
  if (shares.length < threshold) {
    throw new Error(
      `Недостатньо частин. Потрібно ${threshold}, надано ${shares.length}`
    );
  }

  // Витягуємо тільки рядки частин
  const sharesArray = shares.map((s) => s.share);

  try {
    // Відновлюємо hex секрет
    const recoveredHex = secrets.combine(sharesArray);

    // Конвертуємо назад в string
    const recovered = secrets.hex2str(recoveredHex);

    return recovered;
  } catch (error) {
    throw new Error('Помилка відновлення. Перевірте правильність частин');
  }
}

/**
 * Валідує частину
 * @param share - Частина для валідації
 * @returns true якщо валідна
 */
export function validateShare(share: string): boolean {
  try {
    // Перевіряємо формат (має бути hex)
    const hexRegex = /^[0-9a-f]+$/i;
    return hexRegex.test(share);
  } catch {
    return false;
  }
}

/**
 * Генерує QR-код дані для частини
 * @param share - Частина для QR-коду
 * @returns JSON string для QR
 */
export function generateShareQRData(share: ShamirShare): string {
  const qrData = {
    type: 'dauth-recovery-share',
    version: 1,
    share: share.share,
    threshold: share.threshold,
    totalShares: share.totalShares,
    id: share.id,
    createdAt: share.createdAt,
  };

  return JSON.stringify(qrData);
}

/**
 * Парсить QR-код дані частини
 * @param qrData - JSON string з QR
 * @returns Частина
 */
export function parseShareQRData(qrData: string): ShamirShare | null {
  try {
    const data = JSON.parse(qrData);

    if (data.type !== 'dauth-recovery-share') {
      return null;
    }

    return {
      id: data.id,
      share: data.share,
      threshold: data.threshold,
      totalShares: data.totalShares,
      createdAt: data.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Створює контрольну суму для верифікації
 * @param secret - Секрет
 * @returns Hash для верифікації
 */
export async function createVerificationHash(secret: string): Promise<string> {
  return await hash(secret + '-verification');
}

/**
 * Перевіряє чи секрет співпадає з контрольною сумою
 * @param secret - Секрет для перевірки
 * @param verificationHash - Hash для порівняння
 * @returns true якщо співпадає
 */
export async function verifySecret(
  secret: string,
  verificationHash: string
): Promise<boolean> {
  const computedHash = await createVerificationHash(secret);
  return computedHash === verificationHash;
}

/**
 * Експортує частину як текстовий файл
 * @param share - Частина для експорту
 * @param holderName - Ім'я власника
 * @returns Текстовий вміст файлу
 */
export function exportShareAsText(
  share: ShamirShare,
  holderName: string
): string {
  const date = new Date(share.createdAt).toLocaleDateString('uk-UA');

  return `
╔═══════════════════════════════════════════════════════╗
║     DAUTH - ЧАСТИНА ВІДНОВЛЕННЯ                       ║
╚═══════════════════════════════════════════════════════╝

Власник: ${holderName}
Дата створення: ${date}

ВАЖЛИВА ІНФОРМАЦІЯ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ця частина є ${share.id} з ${share.totalShares} частин.
Для відновлення доступу потрібно ${share.threshold} частин.

ЗБЕРІГАЙТЕ ЦЮ ЧАСТИНУ В БЕЗПЕЧНОМУ МІСЦІ!
Не діліться нею з іншими власниками частин.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТИНА (не змінюйте цей рядок):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${share.share}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Інструкції з відновлення:
1. Відкрийте DAuth додаток
2. Виберіть "Відновлення за допомогою частин"
3. Введіть цю частину та ${share.threshold - 1} інших
4. Натисніть "Відновити доступ"

Підтримка: https://github.com/Mksvt/Krypt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}

/**
 * Парсить частину з текстового файлу
 * @param text - Вміст файлу
 * @returns Частина або null
 */
export function parseShareFromText(text: string): string | null {
  try {
    // Шукаємо частину між маркерами
    const match = text.match(
      /ЧАСТИНА \(не змінюйте цей рядок\):\s*━+\s*([0-9a-f]+)/i
    );

    if (match && match[1]) {
      const share = match[1].trim();
      if (validateShare(share)) {
        return share;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Рекомендації по розподілу частин
 */
export const RECOMMENDATIONS = {
  '3-of-5': {
    description: 'Балансований варіант для сім\'ї/друзів',
    totalShares: 5,
    threshold: 3,
    suggestion: [
      'Довірена особа #1',
      'Довірена особа #2',
      'Довірена особа #3',
      'Резервна копія (сейф)',
      'Особисте зберігання',
    ],
  },
  '2-of-3': {
    description: 'Мінімальний варіант для двох довірених осіб',
    totalShares: 3,
    threshold: 2,
    suggestion: [
      'Довірена особа #1',
      'Довірена особа #2',
      'Особисте зберігання',
    ],
  },
  '4-of-7': {
    description: 'Високий рівень безпеки для великої групи',
    totalShares: 7,
    threshold: 4,
    suggestion: [
      'Член сім\'ї #1',
      'Член сім\'ї #2',
      'Близький друг #1',
      'Близький друг #2',
      'Юрист/Нотаріус',
      'Банківська скринька',
      'Особисте зберігання',
    ],
  },
};
