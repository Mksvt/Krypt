// Hook для роботи з резервними копіями
import { useState } from 'react';
import { exportVault, importVault } from '../services/vault';

export function useBackup(currentPassword: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const exportData = async () => {
    if (!currentPassword) {
      setError('Необхідна автентифікація');
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

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
      return true;
    } catch (err) {
      setError('Помилка при експорті');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const importData = async (file: File, password: string) => {
    if (!password) {
      setError('Введіть пароль від резервної копії');
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      await importVault(text, password);
      setSuccess('Резервну копію успішно відновлено. Перезавантажте сторінку.');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return true;
    } catch (err) {
      setError('Невірний файл або пароль');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    exportData,
    importData,
    clearMessages,
  };
}
