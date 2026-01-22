import { useKBar } from 'kbar';
import { Search, Command, Home } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const { query } = useKBar();
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>{t('appTitle')}</span>
            </button>

            <nav className="hidden md:flex gap-1">
              <NavButton
                active={currentView === 'extraworks'}
                onClick={() => onNavigate('extraworks')}
              >
                {t('extraworks')}
              </NavButton>
              <NavButton
                active={currentView === 'recursos'}
                onClick={() => onNavigate('recursos')}
              >
                {t('resources')}
              </NavButton>
            </nav>
          </div>

          <button
            onClick={() => query.toggle()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">{t('searchActions')}</span>
            <kbd className="hidden sm:inline px-2 py-0.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded">
              <Command className="w-3 h-3 inline" /> K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
