// Головний компонент налаштувань з вкладками
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import Tabs from '../common/Tabs';
import { BackupTab } from './BackupTab';
import { BiometricTab } from './BiometricTab';
import { SocialTab } from './SocialTab';
import { AboutTab } from './AboutTab';
import { SocialRecoverySetup } from '../features/recovery';

interface SettingsModalProps {
  onClose: () => void;
}

type TabType = 'backup' | 'social' | 'biometric' | 'about';

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('backup');
  const [showSocialSetup, setShowSocialSetup] = useState(false);
  const { currentPassword, accounts } = useApp();

  const tabs = [
    {
      id: 'backup' as TabType,
      label: 'Резервне копіювання',
      icon: (
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
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    },
    {
      id: 'social' as TabType,
      label: 'Соціальне',
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: 'biometric' as TabType,
      label: 'Біометрія',
      icon: (
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
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
          />
        </svg>
      ),
    },
    {
      id: 'about' as TabType,
      label: 'Про застосунок',
      icon: (
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  if (showSocialSetup) {
    return (
      <SocialRecoverySetup
        onClose={() => setShowSocialSetup(false)}
        onComplete={() => {
          setShowSocialSetup(false);
        }}
      />
    );
  }

  return (
    <Modal title="Налаштування" size="xl" onClose={onClose}>
      <div className="space-y-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id: string) => setActiveTab(id as TabType)}
          variant="pills"
        />

        <div className="pt-4">
          {activeTab === 'backup' && (
            <BackupTab
              currentPassword={currentPassword}
              accountsCount={accounts.length}
            />
          )}
          {activeTab === 'social' && (
            <SocialTab onSetupClick={() => setShowSocialSetup(true)} />
          )}
          {activeTab === 'biometric' && <BiometricTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>
      </div>
    </Modal>
  );
}
