// Компонент вкладки резервного копіювання
import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import { useBackup } from '../../hooks/useBackup';

interface BackupTabProps {
  currentPassword: string | null;
  accountsCount: number;
}

export function BackupTab({ currentPassword, accountsCount }: BackupTabProps) {
  const [password, setPassword] = useState('');
  const { loading, error, success, exportData, importData, clearMessages } =
    useBackup(currentPassword);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await importData(file, password);
    e.target.value = ''; // Reset file input
  };

  return (
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
              {accountsCount} шт.) в безпечному місці. Файл залишається
              зашифрованим вашим майстер-паролем.
            </p>
            <Button onClick={exportData} disabled={loading} loading={loading}>
              Експортувати
            </Button>
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
              Відновіть ваші акаунти з раніше створеної резервної копії. Поточні
              дані будуть замінені.
            </p>
            <div className="space-y-3">
              <Input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                placeholder="Пароль від резервної копії"
              />
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={loading || !password}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button
                    variant="secondary"
                    disabled={loading || !password}
                    loading={loading}
                    onClick={() =>
                      document.getElementById('import-file')?.click()
                    }
                  >
                    Вибрати файл
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert type="error" onClose={clearMessages}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert type="success" onClose={clearMessages}>
          {success}
        </Alert>
      )}

      {/* Warning */}
      <Alert type="warning">
        <p className="font-semibold mb-1">Важливо:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Зберігайте резервні копії в безпечному місці</li>
          <li>Регулярно створюйте нові копії після додавання акаунтів</li>
          <li>Ніколи не діліться файлом резервної копії з іншими</li>
        </ul>
      </Alert>
    </div>
  );
}
