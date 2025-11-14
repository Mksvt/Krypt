// Компонент екрану блокування
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SocialRecovery from './SocialRecovery';
import {
  isBiometricSupported,
  isBiometricAvailable,
  authenticateWithBiometric,
  getBiometricTypeName,
} from '../utils/biometric';
import {
  loadBiometricCredential,
  isBiometricConfigured,
} from '../services/storage';

export default function LockScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricTypeName, setBiometricTypeName] = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { unlock } = useApp();

  useEffect(() => {
    const checkBiometric = async () => {
      const supported = isBiometricSupported();
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

  const handleBiometricUnlock = async () => {
    setBiometricLoading(true);
    setError('');

    try {
      const credential = await loadBiometricCredential();
      if (!credential) {
        throw new Error('Біометричні дані не знайдені');
      }

      // Автентифікація через біометрію
      await authenticateWithBiometric(credential.credentialId);

      // Якщо автентифікація успішна, розблокувати не можна без пароля
      // Для повністю клієнтського рішення ми б зберегли зашифрований пароль
      // Але це знижує безпеку. Натомість просто підказуємо користувачу
      setError(
        'Біометрична автентифікація успішна. Введіть майстер-пароль для розблокування.'
      );
      // В production версії тут би зберігався зашифрований пароль та розшифровувався
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Помилка біометричної автентифікації');
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  if (showRecovery) {
    return (
      <SocialRecovery
        onCancel={() => setShowRecovery(false)}
        onSuccess={async (recoveredPassword) => {
          try {
            await unlock(recoveredPassword);
          } catch (err) {
            setError('Помилка при відновленні доступу');
            setShowRecovery(false);
          }
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await unlock(password);
    } catch (err) {
      setError('Невірний пароль');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Сховище заблоковано
          </h1>
          <p className="text-gray-600">
            Введіть майстер-пароль для розблокування
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Майстер-пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Введіть пароль"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Розблокування...' : 'Розблокувати'}
          </button>
        </form>

        {/* Біометричне розблокування */}
        {biometricAvailable && biometricEnabled && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleBiometricUnlock}
              disabled={biometricLoading}
              className="w-full py-3 px-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {biometricLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Автентифікація...</span>
                </>
              ) : (
                <>
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
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                  <span>Розблокувати через {biometricTypeName}</span>
                </>
              )}
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Швидке розблокування без пароля
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowRecovery(true)}
            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            🛡️ Відновити доступ через соціальне відновлення
          </button>
          <p className="mt-2 text-center text-xs text-gray-500">
            Потрібно зібрати частини від довірених осіб
          </p>
        </div>
      </div>
    </div>
  );
}
