// React Context для управління станом застосунку
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Account, AppState } from '../types';
import { vaultExists } from '../services/storage';
import { unlockVault, updateVault } from '../services/vault';

interface AppContextType extends AppState {
  initialize: () => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  addAccount: (account: Omit<Account, 'id' | 'createdAt'>) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  currentPassword: string | null;
  setCurrentPassword: (password: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 хвилин

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    isLocked: true,
    isInitialized: false,
    accounts: [],
    masterKey: null,
  });

  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Ініціалізація - перевірка, чи існує vault
  const initialize = async () => {
    const exists = await vaultExists();
    setState((prev) => ({
      ...prev,
      isInitialized: exists,
      isLocked: exists,
    }));
  };

  // Розблокування сховища
  const unlock = async (password: string) => {
    try {
      const accounts = await unlockVault(password);
      setCurrentPassword(password);
      setState({
        isLocked: false,
        isInitialized: true,
        accounts,
        masterKey: null, // Ключ зберігається в пам'яті тільки при шифруванні
      });
      setLastActivity(Date.now());
    } catch (error) {
      throw new Error('Невірний пароль');
    }
  };

  // Блокування застосунку
  const lock = () => {
    setCurrentPassword(null);
    setState((prev) => ({
      ...prev,
      isLocked: true,
      accounts: [],
      masterKey: null,
    }));
  };

  // Додавання нового акаунту
  const addAccount = async (accountData: Omit<Account, 'id' | 'createdAt'>) => {
    if (!currentPassword) {
      throw new Error('Необхідна автентифікація');
    }

    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    const updatedAccounts = [...state.accounts, newAccount];
    await updateVault(currentPassword, updatedAccounts);

    setState((prev) => ({
      ...prev,
      accounts: updatedAccounts,
    }));

    setLastActivity(Date.now());
  };

  // Видалення акаунту
  const removeAccount = async (id: string) => {
    if (!currentPassword) {
      throw new Error('Необхідна автентифікація');
    }

    const updatedAccounts = state.accounts.filter((acc) => acc.id !== id);
    await updateVault(currentPassword, updatedAccounts);

    setState((prev) => ({
      ...prev,
      accounts: updatedAccounts,
    }));

    setLastActivity(Date.now());
  };

  // Оновлення акаунту
  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!currentPassword) {
      throw new Error('Необхідна автентифікація');
    }

    const updatedAccounts = state.accounts.map((acc) =>
      acc.id === id ? { ...acc, ...updates } : acc
    );

    await updateVault(currentPassword, updatedAccounts);

    setState((prev) => ({
      ...prev,
      accounts: updatedAccounts,
    }));

    setLastActivity(Date.now());
  };

  // Автоматичне блокування після неактивності
  useEffect(() => {
    if (state.isLocked) return;

    const checkActivity = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity > LOCK_TIMEOUT) {
        lock();
      }
    }, 10000); // Перевіряємо кожні 10 секунд

    return () => clearInterval(checkActivity);
  }, [state.isLocked, lastActivity]);

  // Оновлення часу активності при взаємодії
  useEffect(() => {
    if (state.isLocked) return;

    const updateActivity = () => setLastActivity(Date.now());

    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, [state.isLocked]);

  // Ініціалізація при завантаженні
  useEffect(() => {
    initialize();
  }, []);

  const value: AppContextType = {
    ...state,
    initialize,
    unlock,
    lock,
    addAccount,
    removeAccount,
    updateAccount,
    currentPassword,
    setCurrentPassword,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
