import {
  KBarProvider as Provider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  Action,
} from 'kbar';
import { Home, Briefcase, Settings, User, LogOut } from 'lucide-react';
import { ViewType } from '../types';

interface KBarProviderProps {
  children: React.ReactNode;
  onNavigate: (view: ViewType) => void;
}

export default function KBarProvider({ children, onNavigate }: KBarProviderProps) {
  const actions: Action[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      shortcut: ['d'],
      keywords: 'home inicio principal',
      section: 'Navegación',
      perform: () => onNavigate('dashboard'),
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'extraworks',
      name: 'Extraworks',
      shortcut: ['e'],
      keywords: 'trabajos extras proyectos',
      section: 'Navegación',
      perform: () => onNavigate('extraworks'),
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: 'profile',
      name: 'Ver Perfil',
      shortcut: ['p'],
      keywords: 'profile usuario cuenta',
      section: 'Acciones',
      perform: () => onNavigate('profile'),
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      name: 'Configuración',
      shortcut: ['s'],
      keywords: 'settings ajustes preferencias',
      section: 'Acciones',
      perform: () => alert('Abriendo configuración...'),
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: 'logout',
      name: 'Cerrar Sesión',
      shortcut: ['l', 'o'],
      keywords: 'logout salir exit',
      section: 'Acciones',
      perform: () => alert('Cerrando sesión...'),
      icon: <LogOut className="w-5 h-5" />,
    },
  ];

  return (
    <Provider 
      actions={actions}
      options={{
        toggleShortcut: '$mod+b',
      }}
    >
      <KBarPortal>
        <KBarPositioner className="bg-black/50 backdrop-blur-sm z-50">
          <KBarAnimator className="max-w-2xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <KBarSearch className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </Provider>
  );
}

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
            {item}
          </div>
        ) : (
          <div
            className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors ${
              active ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{item.name}</div>
              {item.subtitle && (
                <div className="text-xs text-gray-500">{item.subtitle}</div>
              )}
            </div>
            {item.shortcut && item.shortcut.length > 0 && (
              <div className="flex gap-1">
                {item.shortcut.map((key) => (
                  <kbd
                    key={key}
                    className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            )}
          </div>
        )
      }
    />
  );
}
