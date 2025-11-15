// Hook для роботи з біометричною автентифікацією
import { useState, useEffect } from 'react';
import {
  isBiometricSupported,
  isBiometricAvailable,
  registerBiometric,
  authenticateWithBiometric,
  getBiometricTypeName,
} from '../utils/biometric';
import {
  saveBiometricCredential,
  loadBiometricCredential,
  deleteBiometricCredential,
  isBiometricConfigured,
} from '../services/storage';

export function useBiometric() {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const supported = isBiometricSupported();
    setIsSupported(supported);

    if (supported) {
      const available = await isBiometricAvailable();
      setIsAvailable(available);

      if (available) {
        const enabled = await isBiometricConfigured();
        setIsEnabled(enabled);
        setTypeName(getBiometricTypeName());
      }
    }
  };

  const register = async (username: string = 'dauth-user') => {
    setLoading(true);
    setError(null);

    try {
      const credential = await registerBiometric(username);
      await saveBiometricCredential(credential);
      setIsEnabled(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка реєстрації');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    setLoading(true);
    setError(null);

    try {
      const credential = await loadBiometricCredential();
      if (!credential) {
        throw new Error('Біометричні дані не знайдені');
      }

      await authenticateWithBiometric(credential.credentialId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка автентифікації');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteBiometricCredential();
      setIsEnabled(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка видалення');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isAvailable,
    isEnabled,
    typeName,
    loading,
    error,
    register,
    authenticate,
    remove,
    refresh: checkBiometric,
  };
}
