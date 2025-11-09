// Компонент для додавання нового акаунту
import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { parseOtpauthUri, validateSecret, formatSecret } from '../utils/totp';
import { useApp } from '../context/AppContext';

interface AddAccountModalProps {
  onClose: () => void;
}

export default function AddAccountModal({ onClose }: AddAccountModalProps) {
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [issuer, setIssuer] = useState('');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const { addAccount } = useApp();

  const startScanner = async () => {
    setScanning(true);
    setError('');

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const parsed = parseOtpauthUri(decodedText);
          if (parsed) {
            setIssuer(parsed.issuer || '');
            setUsername(parsed.username || '');
            setSecret(parsed.secret || '');
            setMode('manual');
            html5QrCode.stop();
            setScanning(false);
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

  const stopScanner = () => {
    setScanning(false);
    const html5QrCode = new Html5Qrcode('qr-reader');
    html5QrCode.stop().catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedSecret = formatSecret(secret);

    if (!validateSecret(formattedSecret)) {
      setError('Невірний формат секретного ключа');
      return;
    }

    if (!issuer.trim()) {
      setError('Введіть назву акаунту');
      return;
    }

    setLoading(true);

    try {
      await addAccount({
        issuer: issuer.trim(),
        username: username.trim(),
        secret: formattedSecret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      });
      onClose();
    } catch (err) {
      setError('Помилка при додаванні акаунту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Додати акаунт</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
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

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => {
              setMode('scan');
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'scan'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Сканувати QR-код
          </button>
          <button
            onClick={() => {
              setMode('manual');
              if (scanning) stopScanner();
              setError('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ввести вручну
          </button>
        </div>

        {mode === 'scan' && (
          <div>
            {!scanning ? (
              <div className="text-center py-8">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <p className="text-gray-600 mb-4">
                  Натисніть кнопку для сканування QR-коду
                </p>
                <button onClick={startScanner} className="btn-primary">
                  Запустити камеру
                </button>
              </div>
            ) : (
              <div>
                <div
                  id="qr-reader"
                  className="rounded-lg overflow-hidden mb-4"
                ></div>
                <button onClick={stopScanner} className="w-full btn-secondary">
                  Зупинити сканування
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="issuer"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Назва акаунту (обов'язково)
              </label>
              <input
                type="text"
                id="issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="input-field"
                placeholder="наприклад, Google, GitHub, Facebook"
                required
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ім'я користувача (необов'язково)
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Email або логін"
              />
            </div>

            <div>
              <label
                htmlFor="secret"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Секретний ключ (обов'язково)
              </label>
              <input
                type="text"
                id="secret"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="input-field font-mono"
                placeholder="JBSWY3DPEHPK3PXP"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Base32-кодований ключ з налаштувань 2FA
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Додавання...' : 'Додати'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
