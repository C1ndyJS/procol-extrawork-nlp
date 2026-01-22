import { useState } from 'react';
import { useKBar } from 'kbar';
import { Menu, X, Search, Briefcase, Users, Command } from 'lucide-react';
import type { ViewType } from '../types';

interface HomePageProps {
  onNavigate: (view: ViewType) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { query } = useKBar();

  const handleSearchClick = () => {
    query.toggle();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-6 left-6 z-50 p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
        aria-label="Menu"
      >
        {menuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pt-20 px-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Navegación</h2>

          <nav className="space-y-2">
            <button
              onClick={() => {
                onNavigate('extraworks');
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">ExtraWorks</div>
                <div className="text-xs text-gray-500">Gestionar trabajos extras</div>
              </div>
            </button>

            <button
              onClick={() => {
                onNavigate('recursos');
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-colors group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium">Recursos</div>
                <div className="text-xs text-gray-500">Gestionar personal y equipos</div>
              </div>
            </button>
          </nav>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Atajo de teclado</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">K</kbd>
              <span className="text-gray-400">para buscar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Main Content - Centered Search */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo / Title */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Command className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Extraworks App</h1>
          <p className="text-gray-500 mt-2">Gestiona tus trabajos extras con lenguaje natural</p>
        </div>

        {/* Search Box */}
        <button
          onClick={handleSearchClick}
          className="w-full max-w-xl bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 group"
        >
          <div className="flex items-center gap-4 px-6 py-4">
            <Search className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="flex-1 text-left text-gray-400 group-hover:text-gray-500">
              Escribe lo que deseas hacer...
            </span>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-500">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-500">K</kbd>
            </div>
          </div>
        </button>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <QuickAction
            icon={<Briefcase className="w-4 h-4" />}
            label="Ver ExtraWorks"
            onClick={() => onNavigate('extraworks')}
            color="blue"
          />
          <QuickAction
            icon={<Users className="w-4 h-4" />}
            label="Ver Recursos"
            onClick={() => onNavigate('recursos')}
            color="green"
          />
        </div>

        {/* Examples */}
        <div className="mt-12 text-center max-w-lg">
          <p className="text-sm text-gray-400 mb-4">Prueba escribir:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <ExampleChip text="crear extrawork pintar pared" onClick={handleSearchClick} />
            <ExampleChip text="asignar recurso a EW-001" onClick={handleSearchClick} />
            <ExampleChip text="ver recursos disponibles" onClick={handleSearchClick} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: 'blue' | 'green';
}

function QuickAction({ icon, label, onClick, color }: QuickActionProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${colorClasses[color]}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

interface ExampleChipProps {
  text: string;
  onClick: () => void;
}

function ExampleChip({ text, onClick }: ExampleChipProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 font-mono transition-colors"
    >
      "{text}"
    </button>
  );
}
