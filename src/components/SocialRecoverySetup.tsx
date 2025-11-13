import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  createShamirShares,
  exportShareAsText,
  generateShareQRData,
  createVerificationHash,
  RECOMMENDATIONS,
  type ShamirShare,
} from '../utils/shamir';
import QRCode from 'qrcode';

interface SocialRecoverySetupProps {
  onClose: () => void;
  onComplete: () => void;
}

export default function SocialRecoverySetup({
  onClose,
  onComplete,
}: SocialRecoverySetupProps) {
  const { currentPassword } = useApp();
  const [step, setStep] = useState<'config' | 'generate' | 'distribute'>(
    'config'
  );
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [shares, setShares] = useState<ShamirShare[]>([]);
  const [holderNames, setHolderNames] = useState<string[]>([]);
  const [verificationHash, setVerificationHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] =
    useState<keyof typeof RECOMMENDATIONS>('3-of-5');

  const handlePresetSelect = (preset: keyof typeof RECOMMENDATIONS) => {
    setSelectedPreset(preset);
    const config = RECOMMENDATIONS[preset];
    setTotalShares(config.totalShares);
    setThreshold(config.threshold);
    setHolderNames(config.suggestion);
  };

  const handleGenerate = async () => {
    if (!currentPassword) {
      alert('Необхідна автентифікація');
      return;
    }

    setLoading(true);

    try {
      // Створюємо частини
      const generatedShares = createShamirShares(
        currentPassword,
        totalShares,
        threshold
      );

      // Додаємо імена власників
      const sharesWithNames = generatedShares.map((share, index) => ({
        ...share,
        holderName: holderNames[index] || `Довірена особа ${index + 1}`,
      }));

      // Створюємо контрольну суму
      const hash = await createVerificationHash(currentPassword);

      setShares(sharesWithNames);
      setVerificationHash(hash);
      setStep('distribute');
    } catch (error) {
      alert('Помилка при генерації частин');
    } finally {
      setLoading(false);
    }
  };

  const downloadShare = async (share: ShamirShare, index: number) => {
    const text = exportShareAsText(
      share,
      share.holderName || `Особа ${index + 1}`
    );
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dauth-recovery-share-${index + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadQR = async (share: ShamirShare, index: number) => {
    try {
      const qrData = generateShareQRData(share);
      const qrImage = await QRCode.toDataURL(qrData);

      const a = document.createElement('a');
      a.href = qrImage;
      a.download = `dauth-recovery-qr-${index + 1}.png`;
      a.click();
    } catch (error) {
      alert('Помилка генерації QR-коду');
    }
  };

  const downloadVerification = () => {
    const text = `
DAuth - Контрольна сума для відновлення
═══════════════════════════════════════

ЗБЕРІГАЙТЕ ЦЮ КОНТРОЛЬНУ СУМУ ОКРЕМО!

Вона буде використана для перевірки правильності
відновлення майстер-пароля.

Контрольна сума:
${verificationHash}

Дата створення: ${new Date().toLocaleDateString('uk-UA')}

Схема відновлення: ${threshold} з ${totalShares} частин
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dauth-verification.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="card max-w-2xl w-full my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Соціальне Відновлення
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {step === 'config' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Що таке Схема Шаміра?
              </h3>
              <p className="text-sm text-blue-800">
                Схема Шаміра дозволяє розділити ваш майстер-пароль на кілька
                частин та довірити їх різним людям. Для відновлення доступу
                потрібна тільки частина цих частин (наприклад, 3 з 5).
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Виберіть схему:</h3>
              <div className="space-y-2">
                {(
                  Object.keys(RECOMMENDATIONS) as Array<
                    keyof typeof RECOMMENDATIONS
                  >
                ).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedPreset === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{key}</span>
                      <span className="text-sm text-gray-600">
                        {RECOMMENDATIONS[key].threshold} з{' '}
                        {RECOMMENDATIONS[key].totalShares}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {RECOMMENDATIONS[key].description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Хто отримає частини?</h3>
              <div className="space-y-2">
                {Array.from({ length: totalShares }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    value={holderNames[index] || ''}
                    onChange={(e) => {
                      const newNames = [...holderNames];
                      newNames[index] = e.target.value;
                      setHolderNames(newNames);
                    }}
                    className="input-field"
                    placeholder={`Довірена особа ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Важливо:</strong> Обирайте довірених осіб ретельно. Вони
                зможуть відновити ваш доступ, зібравшись разом ({threshold}{' '}
                осіб).
              </p>
            </div>

            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 btn-secondary">
                Скасувати
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? 'Генерація...' : 'Згенерувати частини'}
              </button>
            </div>
          </div>
        )}

        {step === 'distribute' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✅ Частини успішно згенеровано! Тепер роздайте їх довіреним
                особам.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Частини для розподілу:</h3>
                <button
                  onClick={downloadVerification}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  💾 Зберегти контрольну суму
                </button>
              </div>

              <div className="space-y-3">
                {shares.map((share, index) => (
                  <div
                    key={share.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          Частина {index + 1} з {totalShares}
                        </p>
                        <p className="text-sm text-gray-600">
                          {share.holderName}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {share.id}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadShare(share, index)}
                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        📄 Текст
                      </button>
                      <button
                        onClick={() => downloadQR(share, index)}
                        className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        📱 QR-код
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">
                ⚠️ Важливі правила безпеки:
              </h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Не відправляйте частини електронною поштою</li>
                <li>• Роздайте їх особисто або через захищені канали</li>
                <li>• Збережіть контрольну суму окремо</li>
                <li>• Довірені особи не повинні знати про інших власників</li>
              </ul>
            </div>

            <button onClick={onComplete} className="w-full btn-primary">
              Завершити налаштування
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
