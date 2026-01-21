import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  KBarProvider as Provider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  Action,
  useKBar,
} from 'kbar';
import { Home, Briefcase, Settings, User, LogOut, Plus, Search, FileText, Zap } from 'lucide-react';
import { ViewType } from '../types';
import { apiService, ActionSuggestion } from '../services/api';

interface KBarProviderProps {
  children: React.ReactNode;
  onNavigate: (view: ViewType) => void;
}

export default function KBarProvider({ children, onNavigate }: KBarProviderProps) {
  const [dynamicActions, setDynamicActions] = useState<Action[]>([]);

  // Static navigation actions - Memoized
  const staticActions: Action[] = useMemo(() => [
    {
      id: 'recursos',
      name: 'Recursos',
      shortcut: ['r'],
      keywords: 'recursos personal empleados trabajadores',
      section: 'Navegación',
      perform: () => onNavigate('recursos'),
      icon: <User className="w-5 h-5" />,
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
      perform: () => alert('Abriendo perfil...'),
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
  ], [onNavigate]);

  // Get icon for intent - Memoized
  const getIconForIntent = useCallback((intent: string) => {
    switch (intent) {
      case 'create_extrawork':
        return <Plus className="w-5 h-5" />;
      case 'search_extrawork':
      case 'search_resource':
        return <Search className="w-5 h-5" />;
      case 'open_extrawork':
        return <Briefcase className="w-5 h-5" />;
      case 'assign_resource_to_extrawork':
        return <Zap className="w-5 h-5" />;
      case 'create_resource':
        return <Plus className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  }, []);

  // Convert backend suggestions to KBar actions - Memoized
  const convertToKBarActions = useCallback((suggestions: ActionSuggestion[]): Action[] => {
    return suggestions.map((suggestion, index) => {
      const action: Action = {
        id: `intention-${suggestion.intent}-${index}-${Date.now()}`,
        name: suggestion.title || suggestion.description,
        subtitle: suggestion.subtitle,
        keywords: suggestion.description,
        section: 'Acciones Inteligentes',
        perform: async () => {
          try {
            const result = await apiService.executeActionByIntent(
              suggestion.intent,
              suggestion.params || {}
            );

            if (result.success) {
              // Handle navigation for open_extrawork
              if (suggestion.intent === 'open_extrawork' && result.extraWorkId) {
                onNavigate('extraworks');
                alert(`Abriendo ExtraWork ${result.extraWorkId}`);
              } else if (result.navigate) {
                onNavigate('extraworks');
              } else {
                alert(result.message || 'Acción ejecutada correctamente');
              }

              // Handle data if needed
              if (result.data) {
                console.log('Action result:', result.data);
              }
            } else {
              alert(result.error || 'Error al ejecutar la acción');
            }
          } catch (error: any) {
            console.error('Error executing action:', error);
            alert(error.message || 'Error al ejecutar la acción');
          }
        },
        icon: getIconForIntent(suggestion.intent),
      };
      return action;
    });
  }, [onNavigate, getIconForIntent]);

  // Watch for search query changes and fetch dynamic actions
  const SearchWatcher = () => {
    const { query } = useKBar((state) => ({ query: state.searchQuery }));

    useEffect(() => {
      // Validate that query is a string before processing
      if (!query || typeof query !== 'string') {
        if (dynamicActions.length > 0) {
          setDynamicActions([]);
        }
        return;
      }

      const trimmedQuery = query.trim();

      // Only search if query is not empty and has at least 2 characters
      if (trimmedQuery.length >= 2) {
        const debounceTimer = setTimeout(async () => {
          try {
            const suggestions = await apiService.searchActions(trimmedQuery, 0.2);
            const actions = convertToKBarActions(suggestions);
            setDynamicActions(actions);
          } catch (error) {
            console.error('Error fetching actions:', error);
            setDynamicActions([]);
          }
        }, 300); // Debounce for 300ms

        return () => clearTimeout(debounceTimer);
      } else {
        if (dynamicActions.length > 0) {
          setDynamicActions([]);
        }
      }
    }, [query, convertToKBarActions]);

    return null;
  };

  // Combine static and dynamic actions
  const allActions = useMemo(() => {
    return [...staticActions, ...dynamicActions];
  }, [staticActions, dynamicActions]);

  return (
    <Provider
      actions={allActions}
      options={{
        toggleShortcut: '$mod+k',
      }}
    >
      <SearchWatcher />
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
