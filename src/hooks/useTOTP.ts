// Hook для роботи з TOTP кодами
import { useState, useEffect, useCallback } from 'react';
import { generateTOTP } from '../utils/totp';
import type { Account } from '../types';

export function useTOTP(account: Account | null) {
  const [code, setCode] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = useCallback(() => {
    if (!account) {
      setCode('');
      return;
    }

    setIsGenerating(true);
    try {
      const newCode = generateTOTP(account);
      setCode(newCode);
    } catch (error) {
      console.error('Помилка генерації TOTP:', error);
      setCode('------');
    } finally {
      setIsGenerating(false);
    }
  }, [account]);

  const calculateTimeRemaining = useCallback(() => {
    const period = account?.period || 30;
    const now = Math.floor(Date.now() / 1000);
    return period - (now % period);
  }, [account]);

  useEffect(() => {
    if (!account) {
      setCode('');
      setTimeRemaining(30);
      return;
    }

    generateCode();
    setTimeRemaining(calculateTimeRemaining());

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === (account.period || 30)) {
        generateCode();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [account, generateCode, calculateTimeRemaining]);

  const refreshCode = () => {
    generateCode();
  };

  return {
    code,
    timeRemaining,
    isGenerating,
    refreshCode,
  };
}
