import { useApp } from './context/AppContext';
import { SetupScreen, LockScreen, MainScreen } from './screens';

function App() {
  const { isInitialized, isLocked, initialize } = useApp();

  // Якщо сховище не ініціалізоване - показуємо onboarding
  if (!isInitialized) {
    return <SetupScreen onComplete={initialize} />;
  }

  // Якщо заблоковано - показуємо екран розблокування
  if (isLocked) {
    return <LockScreen />;
  }

  // Головний екран з акаунтами
  return <MainScreen />;
}

export default App;
