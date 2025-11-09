// Компонент налаштувань та резервного копіювання
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportVault, importVault } from '../services/vault';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'backup' | 'about'>('backup');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentPassword, accounts } = useApp();

  const handleExport = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Необхідна автентифікація');
      return;
    }

    setLoading(true);

    try {
      const backupData = await exportVault(currentPassword);
      const blob = new Blob([backupData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dauth-backup-${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('Резервну копію успішно експортовано');
    } catch (err) {
      setError('Помилка при експорті');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');

    const file = e.target.files?.[0];
    if (!file) return;

    if (!password) {
      setError('Введіть пароль від резервної копії');
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      await importVault(text, password);
      setSuccess('Резервну копію успішно відновлено. Перезавантажте сторінку.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError('Невірний файл або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Налаштування</h2>
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

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'backup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Резервне копіювання
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Про застосунок
          </button>
        </div>

        {/* Content */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            {/* Export */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Експорт резервної копії
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Збережіть зашифровану резервну копію всіх ваших акаунтів (
                    {accounts.length} шт.) в безпечному місці. Файл залишається
                    зашифрованим вашим майстер-паролем.
                  </p>
                  <button
                    onClick={handleExport}
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Експорт...' : 'Експортувати'}
                  </button>
                </div>
              </div>
            </div>

            {/* Import */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L9 8m4-4v12"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Імпорт резервної копії
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Відновіть ваші акаунти з раніше створеної резервної копії.
                    Поточні дані будуть замінені.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="Пароль від резервної копії"
                    />
                    <label className="block">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        disabled={loading || !password}
                        className="hidden"
                        id="import-file"
                      />
                      <span className="btn-secondary inline-block cursor-pointer disabled:opacity-50">
                        {loading ? 'Імпорт...' : 'Вибрати файл'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Важливо:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Зберігайте резервні копії в безпечному місці</li>
                    <li>
                      Регулярно створюйте нові копії після додавання акаунтів
                    </li>
                    <li>Ніколи не діліться файлом резервної копії з іншими</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Децентралізований Автентифікатор
              </h3>
              <p className="text-gray-600 mb-1">Версія 1.0.0 MVP</p>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Особливості
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Повне шифрування на стороні клієнта (AES-GCM)
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Працює повністю офлайн (PWA)
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Без відстеження та збору даних
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Підтримка QR-кодів та ручного введення
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Безпечне резервне копіювання
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Технології</h4>
                <p className="text-sm text-gray-600">
                  React, TypeScript, Vite, Tailwind CSS, Web Crypto API,
                  IndexedDB, PWA
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Безпека</h4>
                <p className="text-sm text-gray-600">
                  Всі дані зашифровані з використанням AES-GCM-256. Ключ
                  шифрування генерується з вашого майстер-пароля через PBKDF2
                  (100,000 ітерацій). Ваші секрети ніколи не покидають пристрій
                  у незашифрованому вигляді.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
