// Компонент для відновлення доступу через частини Шаміра
import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  recoverFromShares,
  parseShareQRData,
  parseShareFromText,
  verifySecret,
  type ShamirShare,
} from '../utils/shamir';
import { verifyPassword } from '../services/vault';

interface SocialRecoveryProps {
  onSuccess: (password: string) => void;
  onCancel: () => void;
}

export default function SocialRecovery({
  onSuccess,
  onCancel,
}: SocialRecoveryProps) {
  const [shares, setShares] = useState<ShamirShare[]>([]);
  const [manualShare, setManualShare] = useState('');
  const [verificationHash, setVerificationHash] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'qr' | 'manual' | 'file'>('manual');

  const threshold = shares.length > 0 ? shares[0].threshold : 0;
  const canRecover = shares.length >= threshold && threshold > 0;

  const addShareManually = () => {
    setError('');
    const trimmed = manualShare.trim();

    if (!trimmed) {
      setError('Введіть частину');
      return;
    }

    try {
      // Створюємо тимчасову частину для перевірки
      const tempShare: ShamirShare = {
        id: `manual-${Date.now()}`,
        share: trimmed,
        threshold: shares.length > 0 ? shares[0].threshold : 2,
        totalShares: shares.length > 0 ? shares[0].totalShares : 3,
        createdAt: Date.now(),
      };

      setShares([...shares, tempShare]);
      setManualShare('');
    } catch (err) {
      setError('Невірний формат частини');
    }
  };

  const startQRScanner = async () => {
    setScanning(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode('recovery-qr-reader');

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const parsed = parseShareQRData(decodedText);
          if (parsed) {
            setShares([...shares, parsed]);
            html5QrCode.stop();
            setScanning(false);
            setMode('manual');
          } else {
            setError('Невірний QR-код');
          }
        },
        () => {
          // Ігноруємо помилки сканування
        }
      );
    } catch (err) {
      setError('Не вдалося запустити камеру');
      setScanning(false);
    }
  };

  const stopQRScanner = () => {
    setScanning(false);
    const html5QrCode = new Html5Qrcode('recovery-qr-reader');
    html5QrCode.stop().catch(() => {});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const text = await file.text();
      const share = parseShareFromText(text);

      if (share) {
        const newShare: ShamirShare = {
          id: `file-${Date.now()}`,
          share,
          threshold: shares.length > 0 ? shares[0].threshold : 2,
          totalShares: shares.length > 0 ? shares[0].totalShares : 3,
          createdAt: Date.now(),
        };
        setShares([...shares, newShare]);
      } else {
        setError('Не вдалося знайти частину в файлі');
      }
    } catch (err) {
      setError('Помилка читання файлу');
    }
  };

  const handleRecover = async () => {
    setError('');
    setLoading(true);

    try {
      // Відновлюємо секрет
      const recoveredPassword = recoverFromShares(shares);

      // Перевіряємо з контрольною сумою (якщо надано)
      if (verificationHash) {
        const isValid = await verifySecret(recoveredPassword, verificationHash);
        if (!isValid) {
          setError('Контрольна сума не співпадає. Перевірте частини.');
          setLoading(false);
          return;
        }
      }

      // Перевіряємо чи пароль правильний
      const isCorrect = await verifyPassword(recoveredPassword);
      if (!isCorrect) {
        setError('Відновлений пароль невірний. Перевірте частини.');
        setLoading(false);
        return;
      }

      // Успіх!
      onSuccess(recoveredPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка відновлення');
    } finally {
      setLoading(false);
    }
  };

  const removeShare = (index: number) => {
    setShares(shares.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="card max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Соціальне Відновлення
          </h1>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Зберіть необхідну кількість частин від довірених осіб для
            відновлення доступу.
          </p>
        </div>

        {/* Прогрес */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Зібрано частин: {shares.length}
              {threshold > 0 && ` / ${threshold} (мінімум)`}
            </span>
            {canRecover && (
              <span className="text-green-600 font-medium text-sm">
                ✓ Достатньо для відновлення
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                canRecover ? 'bg-green-500' : 'bg-primary-500'
              }`}
              style={{
                width: `${
                  threshold > 0 ? (shares.length / threshold) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Методи додавання */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Текст
            </button>
            <button
              onClick={() => {
                setMode('qr');
                if (!scanning) startQRScanner();
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'qr'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              QR-код
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === 'file'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Файл
            </button>
          </div>

          {mode === 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Введіть частину:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualShare}
                  onChange={(e) => setManualShare(e.target.value)}
                  className="input-field font-mono text-sm"
                  placeholder="Вставте hex-частину..."
                />
                <button
                  onClick={addShareManually}
                  className="btn-primary whitespace-nowrap"
                >
                  Додати
                </button>
              </div>
            </div>
          )}

          {mode === 'qr' && (
            <div>
              {!scanning ? (
                <button onClick={startQRScanner} className="w-full btn-primary">
                  Запустити камеру
                </button>
              ) : (
                <div>
                  <div
                    id="recovery-qr-reader"
                    className="rounded-lg overflow-hidden mb-2"
                  ></div>
                  <button
                    onClick={stopQRScanner}
                    className="w-full btn-secondary"
                  >
                    Зупинити
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Завантажте файл з частиною:
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
            </div>
          )}
        </div>

        {/* Контрольна сума */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Контрольна сума (опційно):
          </label>
          <input
            type="text"
            value={verificationHash}
            onChange={(e) => setVerificationHash(e.target.value)}
            className="input-field font-mono text-sm"
            placeholder="Для додаткової перевірки..."
          />
        </div>

        {/* Список частин */}
        {shares.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Додані частини:</h3>
            <div className="space-y-2">
              {shares.map((share, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Частина {index + 1}
                    </p>
                    <p className="text-xs text-gray-500 truncate font-mono">
                      {share.share.substring(0, 40)}...
                    </p>
                  </div>
                  <button
                    onClick={() => removeShare(index)}
                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex space-x-3">
          <button onClick={onCancel} className="flex-1 btn-secondary">
            Скасувати
          </button>
          <button
            onClick={handleRecover}
            disabled={!canRecover || loading}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Відновлення...' : 'Відновити доступ'}
          </button>
        </div>
      </div>
    </div>
  );
}
