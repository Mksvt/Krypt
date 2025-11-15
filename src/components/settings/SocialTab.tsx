// Компонент вкладки соціального відновлення
import Button from '../common/Button';
import Alert from '../common/Alert';

interface SocialTabProps {
  onSetupClick: () => void;
}

export function SocialTab({ onSetupClick }: SocialTabProps) {
  return (
    <div className="space-y-6">
      <Alert type="info">
        <h3 className="font-semibold mb-2">
          🔐 Що таке соціальне відновлення?
        </h3>
        <p className="text-sm">
          Схема Шаміра дозволяє розділити ваш майстер-пароль на кілька частин та
          довірити їх різним людям. Для відновлення доступу потрібна тільки
          частина цих частин (наприклад, 3 з 5).
        </p>
      </Alert>

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
            <span>Для відновлення потрібно зібрати будь-які 3 частини</span>
          </li>
        </ol>
      </div>

      <Button onClick={onSetupClick}>
        🛡️ Налаштувати соціальне відновлення
      </Button>

      <Alert type="warning">
        <p className="font-semibold mb-1">Порада:</p>
        <p>
          Обирайте довірених осіб ретельно. Це мають бути люди, яким ви
          довіряєте, але які не знають один одного.
        </p>
      </Alert>
    </div>
  );
}
