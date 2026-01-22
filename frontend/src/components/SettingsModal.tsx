import { useState } from 'react';
import { X, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  if (!isOpen) return null;

  const handleSave = () => {
    setLanguage(selectedLanguage);
    onClose();
  };

  const handleCancel = () => {
    setSelectedLanguage(language);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">{t('settingsTitle')}</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Globe className="w-4 h-4" />
                {t('language')}
              </label>

              <div className="space-y-2">
                <LanguageOption
                  value="es"
                  label={t('spanish')}
                  flag="🇪🇸"
                  selected={selectedLanguage === 'es'}
                  onChange={() => setSelectedLanguage('es')}
                />
                <LanguageOption
                  value="en"
                  label={t('english')}
                  flag="🇺🇸"
                  selected={selectedLanguage === 'en'}
                  onChange={() => setSelectedLanguage('en')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface LanguageOptionProps {
  value: string;
  label: string;
  flag: string;
  selected: boolean;
  onChange: () => void;
}

function LanguageOption({ label, flag, selected, onChange }: LanguageOptionProps) {
  return (
    <button
      onClick={onChange}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <span className="text-2xl">{flag}</span>
      <span className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
        {label}
      </span>
      {selected && (
        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
