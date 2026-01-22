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
  useRegisterActions,
  Priority,
} from 'kbar';
import { Briefcase, Settings, User, LogOut, Plus, Search, FileText, Zap } from 'lucide-react';
import { ViewType } from '../types';
import { apiService, ActionSuggestion } from '../services/api';

interface KBarProviderProps {
  children: React.ReactNode;
  onNavigate: (view: ViewType) => void;
}

// Global state for search query (to share between Provider options and DynamicActionsHandler)
let globalSetSearchQuery: ((q: string) => void) | null = null;

export default function KBarProvider({ children, onNavigate }: KBarProviderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Store setter globally so it can be called from options callback
  useEffect(() => {
    globalSetSearchQuery = setSearchQuery;
    return () => {
      globalSetSearchQuery = null;
    };
  }, []);

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
      id: 'create-extrawork',
      name: 'Crear ExtraWork',
      shortcut: ['c', 'e'],
      keywords: 'crear nuevo extrawork trabajo añadir agregar new create',
      section: 'Crear',
      subtitle: 'Crear un nuevo trabajo extra',
      perform: async () => {
        onNavigate('extraworks');
        window.dispatchEvent(new CustomEvent('openCreateExtraWork'));
      },
      icon: <Plus className="w-5 h-5" />,
    },
    {
      id: 'create-resource',
      name: 'Crear Recurso',
      shortcut: ['c', 'r'],
      keywords: 'crear nuevo recurso personal empleado añadir agregar new create resource',
      section: 'Crear',
      subtitle: 'Crear un nuevo recurso',
      perform: async () => {
        onNavigate('recursos');
        window.dispatchEvent(new CustomEvent('openCreateResource'));
      },
      icon: <Plus className="w-5 h-5" />,
    },
    {
      id: 'profile',
      name: 'Ver Perfil',
      shortcut: ['n'],
      keywords: 'profile usuario cuenta perfil',
      section: 'Acciones',
      perform: () => onNavigate('profile'),
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      name: 'Configuración',
      shortcut: ['s'],
      keywords: 'settings ajustes preferencias configuracion',
      section: 'Acciones',
      perform: () => alert('Abriendo configuración...'),
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: 'logout',
      name: 'Cerrar Sesión',
      shortcut: ['l', 'o'],
      keywords: 'logout salir exit cerrar sesion',
      section: 'Acciones',
      perform: () => alert('Cerrando sesión...'),
      icon: <LogOut className="w-5 h-5" />,
    },
  ], [onNavigate]);

  // KBar options with onQueryChange callback
  const options = useMemo(() => ({
    toggleShortcut: '$mod+k',
    callbacks: {
      onQueryChange: (query: string) => {
        console.log('[KBar] Query changed:', query);
        if (globalSetSearchQuery) {
          globalSetSearchQuery(query);
        }
      },
    },
  }), []);

  return (
    <Provider actions={staticActions} options={options}>
      <DynamicActionsHandler onNavigate={onNavigate} searchQuery={searchQuery} />
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

// Component to handle dynamic actions from backend
function DynamicActionsHandler({
  onNavigate,
  searchQuery
}: {
  onNavigate: (view: ViewType) => void;
  searchQuery: string;
}) {
  const [dynamicActions, setDynamicActions] = useState<Action[]>([]);

  // Get icon for intent
  const getIconForIntent = useCallback((intent: string) => {
    switch (intent) {
      case 'create_extrawork':
        return <Plus className="w-5 h-5" />;
      case 'search_extrawork':
      case 'search_resource':
        return <Search className="w-5 h-5" />;
      case 'open_extrawork':
      case 'open_extrawork_for_resource':
        return <Briefcase className="w-5 h-5" />;
      case 'assign_resource_to_extrawork':
      case 'assign_resource_suggestion':
        return <Zap className="w-5 h-5" />;
      case 'create_resource':
        return <Plus className="w-5 h-5" />;
      case 'view_resource':
        return <User className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  }, []);

  // Convert backend suggestions to KBar actions
  const convertToKBarActions = useCallback((suggestions: ActionSuggestion[], query: string): Action[] => {
    return suggestions.map((suggestion, index) => {
      const action: Action = {
        id: `dynamic-${suggestion.intent}-${index}-${Date.now()}`,
        name: suggestion.title || suggestion.description,
        subtitle: suggestion.subtitle,
        // Include the search query in keywords so KBar matches it
        keywords: `${query} ${suggestion.description}`,
        section: 'Acciones Inteligentes',
        priority: Priority.HIGH,
        perform: async () => {
          try {
            console.log('[KBar] Performing action:', suggestion.intent, 'with params:', suggestion.params);
            // Special handling for create_extrawork - navigate and open form with pre-filled data
            if (suggestion.intent === 'create_extrawork') {
              const title = suggestion.params?.title || '';
              console.log('[KBar] Opening create extrawork with title:', title);
              onNavigate('extraworks');
              // Small delay to ensure navigation completes before dispatching event
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('openCreateExtraWork', {
                  detail: { title }
                }));
              }, 100);
              return;
            }

            // Special handling for create_resource
            if (suggestion.intent === 'create_resource') {
              onNavigate('recursos');
              window.dispatchEvent(new CustomEvent('openCreateResource', {
                detail: { name: suggestion.params?.name || '' }
              }));
              return;
            }

            // Special handling for view_resource - navigate to recursos and highlight/select the resource
            if (suggestion.intent === 'view_resource') {
              onNavigate('recursos');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('highlightResource', {
                  detail: {
                    resourceId: suggestion.params?.resourceId,
                    resourceName: suggestion.params?.resourceName
                  }
                }));
              }, 100);
              return;
            }

            // Special handling for open_extrawork_for_resource - navigate to extraworks
            if (suggestion.intent === 'open_extrawork_for_resource') {
              onNavigate('extraworks');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('highlightExtraWork', {
                  detail: {
                    extraWorkId: suggestion.params?.extraWorkId,
                    extraWorkTitle: suggestion.params?.extraWorkTitle
                  }
                }));
              }, 100);
              return;
            }

            // Special handling for assign_resource_suggestion - navigate to recursos with assignment mode
            if (suggestion.intent === 'assign_resource_suggestion') {
              onNavigate('recursos');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('openAssignResource', {
                  detail: {
                    resourceId: suggestion.params?.resourceId,
                    resourceName: suggestion.params?.resourceName
                  }
                }));
              }, 100);
              return;
            }

            // For other intents, execute via API
            const result = await apiService.executeActionByIntent(
              suggestion.intent,
              suggestion.params || {}
            );

            if (result.success) {
              if (suggestion.intent === 'open_extrawork') {
                onNavigate('extraworks');
              } else if (suggestion.intent === 'search_extrawork') {
                onNavigate('extraworks');
              } else if (suggestion.intent === 'search_resource') {
                onNavigate('recursos');
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

  // Fetch dynamic actions when searchQuery changes
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length >= 2) {
      const debounceTimer = setTimeout(async () => {
        try {
          console.log('[KBar] Fetching actions for:', trimmedQuery);
          const suggestions = await apiService.searchActions(trimmedQuery, 0.1);
          console.log('[KBar] Backend returned:', suggestions);
          const actions = convertToKBarActions(suggestions, trimmedQuery);
          console.log('[KBar] Converted to actions:', actions.length);
          setDynamicActions(actions);
        } catch (error) {
          console.error('[KBar] Error fetching actions:', error);
          setDynamicActions([]);
        }
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setDynamicActions([]);
    }
  }, [searchQuery, convertToKBarActions]);

  // Register dynamic actions with KBar
  useRegisterActions(dynamicActions, [dynamicActions]);

  return null;
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
