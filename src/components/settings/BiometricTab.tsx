// Компонент вкладки біометричної автентифікації
import Button from '../common/Button';
import Alert from '../common/Alert';
import { useBiometric } from '../../hooks/useBiometric';

export function BiometricTab() {
  const {
    isSupported,
    isAvailable,
    isEnabled,
    typeName,
    loading,
    error,
    register,
    remove,
  } = useBiometric();

  return (
    <div className="space-y-6">
      <Alert type="info">
        <h3 className="font-semibold mb-2">🔐 Біометрична автентифікація</h3>
        <p className="text-sm">
          Розблокуйте застосунок швидко та безпечно використовуючи{' '}
          {typeName || 'біометричну автентифікацію'}. Ваш майстер-пароль
          залишається зашифрованим на пристрої.
        </p>
      </Alert>

      {!isSupported && (
        <Alert type="error">
          <strong>Не підтримується:</strong> Ваш браузер не підтримує WebAuthn
          API. Спробуйте оновити браузер або використовуйте Chrome, Safari або
          Edge.
        </Alert>
      )}

      {isSupported && !isAvailable && (
        <Alert type="warning">
          <strong>Недоступно:</strong> На цьому пристрої немає біометричних
          датчиків або вони не налаштовані. Перевірте налаштування системи.
        </Alert>
      )}

      {isSupported && isAvailable && (
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
                  {isEnabled
                    ? `✅ Біометричну автентифікацію увімкнено. Ви можете розблокувати застосунок за допомогою ${typeName}.`
                    : `Налаштуйте ${typeName} для швидкого розблокування застосунку.`}
                </p>
                {!isEnabled ? (
                  <Button
                    onClick={() => register()}
                    disabled={loading}
                    loading={loading}
                  >
                    🔒 Увімкнути біометрію
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => remove()}
                    disabled={loading}
                    loading={loading}
                  >
                    Вимкнути біометрію
                  </Button>
                )}
              </div>
            </div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

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
                <span>Підтвердьте використовуючи {typeName}</span>
              </li>
              <li className="flex">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center mr-3 text-xs font-bold">
                  3
                </span>
                <span>Тепер ви можете розблокувати застосунок біометрією</span>
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

          <Alert type="warning">
            <p className="font-semibold mb-1">Важливо:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ви все ще можете розблокувати за допомогою майстер-пароля</li>
              <li>Біометрія працює тільки на цьому пристрої</li>
              <li>При видаленні даних браузера потрібно налаштувати заново</li>
            </ul>
          </Alert>
        </>
      )}
    </div>
  );
}
