// Типи для застосунку

export interface Account {
  id: string;
  issuer: string;
  username: string;
  secret: string;
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: number;
  period?: number;
  createdAt: number;
}

export interface EncryptedVault {
  salt: string; // Base64 encoded
  iv: string; // Base64 encoded
  data: string; // Base64 encoded encrypted data
  version: number;
}

export interface StorageData {
  vault: EncryptedVault | null;
  lastAccess: number;
}

export interface AppState {
  isLocked: boolean;
  isInitialized: boolean;
  accounts: Account[];
  masterKey: CryptoKey | null;
}

export interface BackupData {
  version: number;
  timestamp: number;
  vault: EncryptedVault;
}
