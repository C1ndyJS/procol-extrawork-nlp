# Documentación del Frontend - Extraworks App

## Descripción General

El frontend de Extraworks App es una aplicación web construida con **React + TypeScript + Vite** que permite gestionar ExtraWorks (trabajos adicionales) y Recursos de forma intuitiva. La característica principal es un **Command Palette (KBar)** que permite ejecutar acciones mediante lenguaje natural en español.

---

## Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| **React 18** | Biblioteca principal para UI |
| **TypeScript** | Tipado estático |
| **Vite** | Build tool y dev server |
| **Tailwind CSS** | Estilos utilitarios |
| **KBar** | Command palette / buscador de acciones |
| **Lucide React** | Iconografía |

---

## Estructura de Carpetas

```
Frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── KBarProvider.tsx # Command Palette con NLP
│   │   ├── Header.tsx       # Navegación superior
│   │   ├── Recursos.tsx     # Vista de gestión de recursos
│   │   └── Extraworks.tsx   # Vista de gestión de extraworks
│   ├── services/
│   │   └── api.ts           # Cliente HTTP para el backend
│   ├── types.ts             # Definiciones de tipos TypeScript
│   ├── App.tsx              # Componente raíz
│   └── main.tsx             # Punto de entrada
├── .env                     # Variables de entorno
└── package.json
```

---

## Componentes Principales

### 1. App.tsx - Componente Raíz

```tsx
function App() {
  const [currentView, setCurrentView] = useState<ViewType>('extraworks');

  return (
    <KBarProvider onNavigate={setCurrentView}>
      <Header currentView={currentView} onNavigate={setCurrentView} />
      <main>
        {currentView === 'recursos' ?
          <Recursos onNavigate={setCurrentView} /> :
          <Extraworks />
        }
      </main>
    </KBarProvider>
  );
}
```

**Responsabilidades:**
- Maneja el estado de navegación entre vistas
- Envuelve la aplicación con el KBarProvider
- Renderiza el Header y la vista activa

---

### 2. KBarProvider.tsx - Command Palette con NLP

Este es el componente más importante del sistema. Implementa un buscador de acciones que:

1. **Acciones Estáticas**: Navegación básica predefinida
2. **Acciones Dinámicas**: Sugerencias del backend basadas en NLP

#### Acciones Estáticas

```tsx
const staticActions: Action[] = [
  {
    id: 'recursos',
    name: 'Recursos',
    shortcut: ['r'],
    keywords: 'recursos personal empleados',
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
  // ... más acciones
];
```

#### Acciones Dinámicas (NLP)

Cuando el usuario escribe en el buscador, se consulta al backend:

```tsx
useEffect(() => {
  if (trimmedQuery.length >= 2) {
    const debounceTimer = setTimeout(async () => {
      const suggestions = await apiService.searchActions(trimmedQuery, 0.15);
      const actions = convertToKBarActions(suggestions, trimmedQuery);
      setDynamicActions(actions);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(debounceTimer);
  }
}, [searchQuery]);
```

#### Intents Soportados

| Intent | Ejemplo de Query | Acción |
|--------|------------------|--------|
| `create_extrawork` | "crear extrawork mover silla" | Abre formulario con título prellenado |
| `view_resource` | "silla" (busca recursos) | Navega a recursos y resalta |
| `open_extrawork_for_resource` | "silla" (si está asignado) | Navega al ExtraWork asociado |
| `assign_resource_suggestion` | "silla" (si disponible) | Sugiere asignación |

#### Comunicación entre Componentes

Se usa `CustomEvent` para comunicar acciones entre KBar y las vistas:

```tsx
// En KBarProvider - Disparar evento
window.dispatchEvent(new CustomEvent('openCreateExtraWork', {
  detail: { title: 'mover silla' }
}));

// En Extraworks.tsx - Escuchar evento
useEffect(() => {
  const handleOpenCreate = (event: CustomEvent) => {
    setFormData({ title: event.detail?.title || '' });
    setShowModal(true);
  };
  window.addEventListener('openCreateExtraWork', handleOpenCreate);
  return () => window.removeEventListener('openCreateExtraWork', handleOpenCreate);
}, []);
```

---

### 3. Recursos.tsx - Gestión de Recursos

Vista completa para CRUD de recursos con las siguientes características:

#### Estado del Componente

```tsx
const [recursos, setRecursos] = useState<Resource[]>([]);
const [extraworks, setExtraworks] = useState<ExtraWork[]>([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [editingResource, setEditingResource] = useState<Resource | null>(null);
const [highlightedResourceId, setHighlightedResourceId] = useState<string | null>(null);
const [formData, setFormData] = useState({
  name: '',
  type: '',
  availability: 'available',
  extraWorkId: '',
});
```

#### Funcionalidades

1. **Listado de Recursos**: Tabla con ID, nombre, tipo, disponibilidad y ExtraWork asignado
2. **Crear/Editar Recurso**: Modal con formulario
3. **Asignar a ExtraWork**: Selector en el formulario
4. **Enlace a ExtraWork**: Click en el ID navega a Extraworks y resalta
5. **Highlighting**: Recursos pueden ser resaltados desde KBar

#### Enlace Clickeable a ExtraWork

```tsx
<td>
  {resource.extraWorkId && resource.extraWork ? (
    <button
      onClick={() => {
        onNavigate('extraworks');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('highlightExtraWork', {
            detail: { extraWorkId: resource.extraWorkId }
          }));
        }, 100);
      }}
      className="flex items-center gap-1 text-blue-600 hover:underline"
    >
      <Briefcase className="w-3 h-3" />
      <span>{resource.extraWorkId}</span>
      <ExternalLink className="w-3 h-3" />
    </button>
  ) : (
    <span className="text-gray-400">Sin asignar</span>
  )}
</td>
```

---

### 4. Header.tsx - Navegación

Componente simple con:
- Logo/título de la aplicación
- Tabs de navegación (Extraworks, Recursos)
- Botón para abrir el Command Palette (Cmd+K)

```tsx
<button onClick={() => query.toggle()}>
  <Search className="w-4 h-4" />
  <span>Buscar acciones</span>
  <kbd>⌘ K</kbd>
</button>
```

---

## Servicio API (api.ts)

Cliente HTTP que comunica con el backend:

```tsx
class ApiService {
  private baseUrl = import.meta.env.VITE_API_URL;

  // Buscar acciones con NLP
  async searchActions(query: string, threshold: number): Promise<ActionSuggestion[]>

  // Ejecutar acción por intent
  async executeActionByIntent(intent: string, params: any): Promise<ActionResponse>

  // CRUD ExtraWorks
  async getExtraWorks(): Promise<ExtraWork[]>
  async searchExtraWorks(query: string): Promise<ExtraWork[]>

  // CRUD Resources
  async getResources(): Promise<Resource[]>
  async searchResources(query: string): Promise<Resource[]>
}
```

---

## Tipos TypeScript (types.ts)

```tsx
export type ViewType = 'recursos' | 'extraworks';

export interface ExtraWork {
  id: string;          // Formato: EW-001, EW-002, etc.
  title: string;
  description: string;
  status: string;      // pending, in_progress, completed, cancelled, on_hold
  priority: string;    // low, medium, high, critical
  createdAt: string;
  updatedAt: string;
  resources?: Resource[];
}

export interface Resource {
  id: string;          // Formato: R-001, R-002, etc.
  name: string;
  type: string;        // personnel, equipment, material
  availability: string; // available, busy, unavailable
  extraWorkId?: string | null;
  extraWork?: ExtraWork | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                        Usuario                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    KBar (Command Palette)                    │
│  - Usuario escribe: "crear extrawork mover silla"           │
│  - Debounce 300ms                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     apiService.searchActions()               │
│  POST /api/actions/search { query, threshold: 0.15 }        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│  - TextParser analiza query                                  │
│  - ActionFactory genera sugerencias                          │
│  - Retorna: [{ intent, score, title, params }]              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   convertToKBarActions()                     │
│  - Convierte sugerencias a acciones de KBar                  │
│  - Asigna iconos según intent                                │
│  - Configura perform() para cada acción                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Usuario selecciona                       │
│  "Crear ExtraWork: mover silla"                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      perform() ejecuta                       │
│  1. onNavigate('extraworks')                                │
│  2. dispatchEvent('openCreateExtraWork', { title })         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Extraworks.tsx                           │
│  - Escucha evento                                           │
│  - Abre modal con título prellenado                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuración de Entorno

### .env

```env
VITE_API_URL=http://localhost:3000/api
```

### Instalación

```bash
cd Frontend
npm install
npm run dev
```

---

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Cmd/Ctrl + K` | Abrir Command Palette |
| `r` | Ir a Recursos |
| `e` | Ir a Extraworks |
| `c + e` | Crear ExtraWork |
| `c + r` | Crear Recurso |
| `Escape` | Cerrar modales/palette |

---

## Patrones de Diseño Utilizados

1. **Compound Components**: KBarProvider envuelve la app
2. **Custom Events**: Comunicación desacoplada entre componentes
3. **Debouncing**: Evita llamadas excesivas al backend
4. **Optimistic UI**: Notificaciones inmediatas
5. **Controlled Components**: Formularios con estado React

---

## Mejoras Futuras Posibles

1. **Persistencia de estado**: Guardar vista actual en localStorage
2. **Filtros avanzados**: En listados de recursos y extraworks
3. **Paginación**: Para listas largas
4. **Cache**: React Query para caché de datos
5. **Tests**: Jest + React Testing Library
6. **Accesibilidad**: Mejorar ARIA labels
7. **Modo oscuro**: Soporte de temas

---

## Resumen

El frontend implementa una interfaz moderna con:

- **Command Palette (KBar)** para búsqueda con lenguaje natural
- **Comunicación por eventos** para acciones entre componentes
- **IDs legibles** (EW-001, R-001) para mejor UX
- **Navegación cruzada** entre recursos y extraworks
- **Formularios con asignación** directa a extraworks
