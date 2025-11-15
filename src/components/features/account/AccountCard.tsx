// Компонент для відображення одного TOTP-коду
import { useState, useEffect } from 'react';
import type { Account } from '../../../types';
import {
  generateTOTP,
  getTimeRemaining,
  getTimerProgress,
} from '../../../utils/totp';

interface AccountCardProps {
  account: Account;
  onDelete: (id: string) => void;
}

export default function AccountCard({ account, onDelete }: AccountCardProps) {
  const [code, setCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [progress, setProgress] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const updateCode = () => {
      const newCode = generateTOTP(account);
      setCode(newCode);
      setTimeRemaining(getTimeRemaining(account.period));
      setProgress(getTimerProgress(account.period));
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);

    return () => clearInterval(interval);
  }, [account]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    if (showDelete) {
      onDelete(account.id);
    } else {
      setShowDelete(true);
      setTimeout(() => setShowDelete(false), 3000);
    }
  };

  const formatCode = (code: string) => {
    return code.slice(0, 3) + ' ' + code.slice(3);
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {account.issuer || 'Акаунт'}
          </h3>
          {account.username && (
            <p className="text-sm text-gray-600 truncate">{account.username}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className={`ml-2 p-2 rounded-lg transition-colors duration-200 ${
            showDelete
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
          title={showDelete ? 'Натисніть ще раз для підтвердження' : 'Видалити'}
        >
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <button
          onClick={handleCopy}
          className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <span className="text-3xl font-mono font-bold text-primary-600 tracking-wider">
            {formatCode(code)}
          </span>
          <div className="flex items-center space-x-2">
            {copied ? (
              <span className="text-green-600 text-sm font-medium">
                Скопійовано!
              </span>
            ) : (
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeRemaining <= 5 ? 'bg-red-500' : 'bg-primary-500'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
        <span
          className={`text-sm font-medium tabular-nums ${
            timeRemaining <= 5 ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          {timeRemaining}s
        </span>
      </div>
    </div>
  );
}
