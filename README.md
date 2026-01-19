# ExtraWorks - Aplicación Web Modular con Búsqueda de Acciones NLP

Una aplicación web modular con capacidades de procesamiento de lenguaje natural para búsqueda y ejecución de acciones.

## Arquitectura

### Backend (Node.js + Express + Prisma)

```
backend/
├── src/
│   ├── domain/              # Servicios de dominio
│   │   ├── ExtraWorkService.ts
│   │   └── ResourceService.ts
│   ├── intentions/          # Sistema de intenciones extensible
│   │   ├── Intention.ts     # Interfaz de intención base
│   │   ├── IntentionRegistry.ts
│   │   └── modules/         # Módulos de intención individuales
│   │       ├── CreateExtraWorkIntention.ts
│   │       ├── SearchExtraWorkIntention.ts
│   │       ├── UpdateExtraWorkIntention.ts
│   │       ├── DeleteExtraWorkIntention.ts
│   │       └── AddResourceIntention.ts
│   ├── api/
│   │   └── routes/          # Endpoints de API REST
│   │       ├── extrawork.routes.ts
│   │       ├── resource.routes.ts
│   │       └── action.routes.ts
│   ├── utils/
│   │   └── ActionFactory.ts # Patrón factory de acciones
│   └── index.ts             # Punto de entrada del servidor
├── prisma/
│   └── schema.prisma        # Esquema de base de datos
└── package.json
```

### Frontend (React + Vite + TypeScript)

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx    # Interfaz de búsqueda NLP
│   │   └── ExtraWorkList.tsx # Interfaz CRUD
│   ├── services/
│   │   └── api.ts           # Capa de servicio API
│   ├── types/
│   │   └── index.ts         # Tipos de TypeScript
│   ├── App.tsx              # Aplicación principal
│   └── main.tsx
└── package.json
```

## Características

### 🎯 Arquitectura Modular
- **Servicios de Dominio**: Servicios separados para ExtraWorks y Resources
- **Sistema de Intenciones**: Cada intención como módulo independiente y conectable
- **Action Factory**: Genera acciones ejecutables a partir de consultas en lenguaje natural

### 🔍 Procesamiento de Lenguaje Natural
- Buscar acciones usando consultas en lenguaje natural
- Coincidencia inteligente de intenciones con puntajes de confianza
- Ejecutar acciones directamente desde consultas NLP

### 🛠️ Endpoints de API REST

#### CRUD de ExtraWork
- `GET /api/extraworks` - Listar todos los ExtraWorks
- `GET /api/extraworks/:id` - Obtener ExtraWork por ID
- `POST /api/extraworks` - Crear nuevo ExtraWork
- `PUT /api/extraworks/:id` - Actualizar ExtraWork
- `DELETE /api/extraworks/:id` - Eliminar ExtraWork

#### CRUD de Resource
- `GET /api/resources` - Listar todos los Resources
- `GET /api/resources/:id` - Obtener Resource por ID
- `POST /api/resources` - Crear nuevo Resource
- `PUT /api/resources/:id` - Actualizar Resource
- `DELETE /api/resources/:id` - Eliminar Resource

#### Búsqueda y Ejecución de Acciones
- `POST /api/actions/search` - Buscar acciones por consulta en lenguaje natural
- `POST /api/actions/execute` - Ejecutar acción desde lenguaje natural
- `POST /api/actions/execute/:intent` - Ejecutar acción por nombre de intención
- `GET /api/intentions` - Listar todas las intenciones registradas

## Instrucciones de Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Configuración del Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Generar cliente Prisma:
```bash
npm run prisma:generate
```

4. Ejecutar migraciones de base de datos:
```bash
npm run prisma:migrate
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El backend se iniciará en `http://localhost:3000`

### Configuración del Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend se iniciará en `http://localhost:5173`

## Uso

### Usando la Aplicación

1. **Pestaña de Búsqueda NLP**: 
   - Escribe consultas en lenguaje natural como "crear nuevo extrawork", "buscar tareas", "actualizar extrawork"
   - Ve acciones coincidentes con puntajes de confianza
   - Ejecuta acciones directamente desde los resultados de búsqueda

2. **Pestaña Administrar ExtraWorks**:
   - Ver todos los ExtraWorks
   - Crear nuevos ExtraWorks con título, descripción, estado y prioridad
   - Eliminar ExtraWorks existentes

### Ejemplos de Consultas NLP

- "crear nueva tarea"
- "buscar extrawork"
- "encontrar todos los trabajos"
- "agregar un recurso"
- "actualizar extrawork"
- "eliminar tarea"

## Extensibilidad

### Agregando Nuevas Intenciones

1. Crear un nuevo módulo de intención en `backend/src/intentions/modules/`:

```typescript
import { BaseIntention } from '../Intention';

export class MiIntencionPersonalizada extends BaseIntention {
  name = 'mi_intencion_personalizada';
  keywords = ['personalizada', 'accion', 'palabras', 'clave'];
  description = 'Descripción de lo que hace esta intención';

  constructor(private myService: MyService) {
    super();
  }

  async execute(params: any): Promise<any> {
    // Implementación
    return {
      success: true,
      data: result,
      message: 'Acción completada'
    };
  }
}
```

2. Registrar la intención en `backend/src/index.ts`:

```typescript
intentionRegistry.register(new MiIntencionPersonalizada(myService));
```

## Pila Tecnológica

**Backend:**
- Node.js & Express - Framework web
- TypeScript - Seguridad de tipos
- Prisma ORM - ORM de base de datos
- SQLite - Base de datos

**Frontend:**
- React 18 - Biblioteca de UI
- Vite - Herramienta de compilación
- TypeScript - Seguridad de tipos

## Verificación de Salud de la API

Verifica si el backend está ejecutándose:
```
GET http://localhost:3000/health
```

## Esquema de Base de Datos

- **ExtraWork**: Elementos de trabajo principales con título, descripción, estado y prioridad
- **Resource**: Recursos adjuntos a ExtraWorks (archivos, enlaces, etc.)
- **Action**: Acciones registradas con intenciones y palabras clave

## Desarrollo

### Filosofía de Estructura del Proyecto

El proyecto sigue un diseño modular orientado al dominio:

1. **Capa de Dominio**: Lógica de negocio y acceso a datos (Servicios)
2. **Capa de Intenciones**: Comprensión del lenguaje natural (Intenciones)
3. **Capa de API**: Endpoints HTTP y enrutamiento
4. **Capa de UI**: Componentes React y gestión de estado

Esta separación garantiza:
- Fácil prueba y mantenimiento
- Clara separación de preocupaciones
- Extensión simple con nuevas características
- Acoplamiento mínimo entre capas

## Licencia

MIT
