// Компонент вкладки "Про застосунок"
export function AboutTab() {
  return (
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
          <h4 className="font-semibold text-gray-900 mb-2">Особливості</h4>
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
              Біометрична автентифікація (WebAuthn)
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Технології</h4>
          <p className="text-sm text-gray-600">
            React, TypeScript, Vite, Tailwind CSS, Web Crypto API, WebAuthn,
            IndexedDB, PWA
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Безпека</h4>
          <p className="text-sm text-gray-600">
            Всі дані зашифровані з використанням AES-GCM-256. Ключ шифрування
            генерується з вашого майстер-пароля через PBKDF2 (100,000 ітерацій).
            Ваші секрети ніколи не покидають пристрій у незашифрованому вигляді.
          </p>
        </div>
      </div>
    </div>
  );
}
