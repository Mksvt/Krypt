// Компонент налаштувань та резервного копіювання
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { exportVault, importVault } from '../services/vault';
import SocialRecoverySetup from './SocialRecoverySetup';
import {
  isBiometricSupported,
  isBiometricAvailable,
  registerBiometric,
  getBiometricTypeName,
} from '../utils/biometric';
import {
  saveBiometricCredential,
  deleteBiometricCredential,
  isBiometricConfigured,
} from '../services/storage';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'backup' | 'social' | 'biometric' | 'about'
  >('backup');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSocialSetup, setShowSocialSetup] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('');
  const { currentPassword, accounts } = useApp();

  useEffect(() => {
    // Перевірка підтримки біометрії
    const checkBiometric = async () => {
      const supported = isBiometricSupported();
      setBiometricSupported(supported);

      if (supported) {
        const available = await isBiometricAvailable();
        setBiometricAvailable(available);

        if (available) {
          const enabled = await isBiometricConfigured();
          setBiometricEnabled(enabled);
          setBiometricTypeName(getBiometricTypeName());
        }
      }
    };

    checkBiometric();
  }, []);

  const handleEnableBiometric = async () => {
    if (!currentPassword) {
      setError('Необхідна автентифікація');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Реєстрація біометричної автентифікації
      const credential = await registerBiometric('dauth-user');

      // Зберігаємо credential та зашифрований пароль
      await saveBiometricCredential(credential);

      setBiometricEnabled(true);
      setSuccess('Біометричну автентифікацію успішно налаштовано!');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Помилка при налаштуванні біометрії');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisableBiometric = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await deleteBiometricCredential();
      setBiometricEnabled(false);
      setSuccess('Біометричну автентифікацію вимкнено');
    } catch (err) {
      setError('Помилка при вимкненні біометрії');
    } finally {
      setLoading(false);
    }
  };

  if (showSocialSetup) {
    return (
      <SocialRecoverySetup
        onClose={() => setShowSocialSetup(false)}
        onComplete={() => {
          setShowSocialSetup(false);
          setSuccess('Соціальне відновлення налаштовано!');
        }}
      />
    );
  }

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
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'social'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Соціальне
          </button>
          <button
            onClick={() => setActiveTab('biometric')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'biometric'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Біометрія
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
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

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                🔐 Що таке соціальне відновлення?
              </h3>
              <p className="text-sm text-blue-800">
                Схема Шаміра дозволяє розділити ваш майстер-пароль на кілька
                частин та довірити їх різним людям. Для відновлення доступу
                потрібна тільки частина цих частин (наприклад, 3 з 5).
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Переваги:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
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
                  <span>Відновлення доступу навіть якщо ви забули пароль</span>
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
                  <span>Розподілена довіра між кількома особами</span>
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
                  <span>Жодна особа не може відновити доступ самостійно</span>
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
                  <span>Захист від втрати доступу при форс-мажорі</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Як це працює:</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                    1
                  </span>
                  <span>Ви обираєте схему (наприклад, 3 з 5 частин)</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                    2
                  </span>
                  <span>Система генерує 5 частин вашого пароля</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                    3
                  </span>
                  <span>Ви роздаєте частини 5 довіреним особам</span>
                </li>
                <li className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                    4
                  </span>
                  <span>
                    Для відновлення потрібно зібрати будь-які 3 частини
                  </span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => setShowSocialSetup(true)}
              className="w-full btn-primary"
            >
              🛡️ Налаштувати соціальне відновлення
            </button>

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
                  <p className="font-semibold mb-1">Порада:</p>
                  <p>
                    Обирайте довірених осіб ретельно. Це мають бути люди, яким
                    ви довіряєте, але які не знають один одного.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'biometric' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                🔐 Біометрична автентифікація
              </h3>
              <p className="text-sm text-blue-800">
                Розблокуйте застосунок швидко та безпечно використовуючи{' '}
                {biometricTypeName || 'біометричну автентифікацію'}. Ваш
                майстер-пароль залишається зашифрованим на пристрої.
              </p>
            </div>

            {!biometricSupported && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Не підтримується:</strong> Ваш браузер не підтримує
                  WebAuthn API. Спробуйте оновити браузер або використовуйте
                  Chrome, Safari або Edge.
                </p>
              </div>
            )}

            {biometricSupported && !biometricAvailable && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Недоступно:</strong> На цьому пристрої немає
                  біометричних датчиків або вони не налаштовані. Перевірте
                  налаштування системи.
                </p>
              </div>
            )}

            {biometricSupported && biometricAvailable && (
              <>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Статус біометрії
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {biometricEnabled
                          ? `✅ Біометричну автентифікацію увімкнено. Ви можете розблокувати застосунок за допомогою ${biometricTypeName}.`
                          : `Налаштуйте ${biometricTypeName} для швидкого розблокування застосунку.`}
                      </p>
                      {!biometricEnabled ? (
                        <button
                          onClick={handleEnableBiometric}
                          disabled={loading}
                          className="btn-primary disabled:opacity-50"
                        >
                          {loading
                            ? 'Налаштування...'
                            : '🔒 Увімкнути біометрію'}
                        </button>
                      ) : (
                        <button
                          onClick={handleDisableBiometric}
                          disabled={loading}
                          className="btn-secondary disabled:opacity-50"
                        >
                          {loading ? 'Вимкнення...' : 'Вимкнути біометрію'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Як це працює:</h3>
                  <ol className="space-y-3 text-sm text-gray-700">
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                        1
                      </span>
                      <span>Натисніть "Увімкнути біометрію" вище</span>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                        2
                      </span>
                      <span>
                        Підтвердьте використовуючи {biometricTypeName}
                      </span>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                        3
                      </span>
                      <span>
                        Тепер ви можете розблокувати застосунок біометрією
                      </span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Переваги:</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
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
                      <span>Швидке розблокування без введення пароля</span>
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
                      <span>Додатковий рівень безпеки</span>
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
                      <span>Захист від підглядання (shoulder surfing)</span>
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
                      <span>Пароль залишається зашифрованим на пристрої</span>
                    </li>
                  </ul>
                </div>

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
                        <li>
                          Ви все ще можете розблокувати за допомогою
                          майстер-пароля
                        </li>
                        <li>Біометрія працює тільки на цьому пристрої</li>
                        <li>
                          При видаленні даних браузера потрібно налаштувати
                          заново
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
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
              <p className="text-gray-600 mb-1">Версія 1.1.0</p>
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
                    Соціальне відновлення (Схема Шаміра)
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
