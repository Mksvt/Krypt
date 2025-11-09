// Компонент для створення майстер-пароля (onboarding)
import { useState } from 'react';
import { checkPasswordStrength } from '../utils/crypto';
import { createVault } from '../services/vault';

interface SetupScreenProps {
  onComplete: () => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const strength = password
    ? checkPasswordStrength(password)
    : { score: 0, feedback: '' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Пароль має містити мінімум 8 символів');
      return;
    }

    if (password !== confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (strength.score < 3) {
      setError('Пароль занадто слабкий. ' + strength.feedback);
      return;
    }

    setLoading(true);

    try {
      await createVault(password, []);
      onComplete();
    } catch (err) {
      setError('Помилка при створенні сховища');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (score: number) => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-yellow-500';
    if (score >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = (score: number) => {
    if (score >= 4) return 'Надійний';
    if (score >= 3) return 'Середній';
    if (score >= 2) return 'Слабкий';
    return 'Дуже слабкий';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Децентралізований Автентифікатор
          </h1>
          <p className="text-gray-600">
            Створіть надійний майстер-пароль для захисту ваших 2FA-кодів
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
                placeholder="Введіть надійний пароль"
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

            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Надійність пароля</span>
                  <span className="font-medium">
                    {getStrengthText(strength.score)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(
                      strength.score
                    )}`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {strength.feedback}
                </p>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Підтвердіть пароль
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Повторіть пароль"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Важливо:</strong> Запам'ятайте цей пароль! Він не може
              бути відновлений. Втрата пароля означає втрату доступу до всіх
              ваших 2FA-кодів.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Створення...' : 'Створити сховище'}
          </button>
        </form>
      </div>
    </div>
  );
}
