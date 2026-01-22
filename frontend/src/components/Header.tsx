import { useKBar } from 'kbar';
import { Search, Command, Moon, Sun } from 'lucide-react';
import { ViewType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const { query } = useKBar();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Extraworks App</h1>

            <nav className="hidden md:flex gap-1">
              <NavButton
                active={currentView === 'resources'}
                onClick={() => onNavigate('resources')}
              >
                Resources
              </NavButton>
              <NavButton
                active={currentView === 'extraworks'}
                onClick={() => onNavigate('extraworks')}
              >
                Extraworks
              </NavButton>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => query.toggle()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar acciones</span>
              <kbd className="hidden sm:inline px-2 py-0.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">
                <Command className="w-3 h-3 inline" /> L
              </kbd>
            </button>
          </div>
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
          ? 'bg-primary-200 dark:bg-primary-400 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
