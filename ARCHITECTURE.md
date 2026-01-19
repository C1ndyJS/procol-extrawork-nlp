# Arquitectura de ExtraWorks

## Descripción General

ExtraWorks es una aplicación web modular construida con un enfoque en la extensibilidad y mantenibilidad. La aplicación cuenta con un motor de búsqueda de acciones con procesamiento de lenguaje natural (NLP) que permite a los usuarios interactuar con el sistema usando consultas en lenguaje natural.

## Capas de Arquitectura

### 1. Arquitectura del Backend

#### Capa de Dominio (`backend/src/domain/`)
Contiene la lógica de negocio y servicios de acceso a datos.

- **ExtraWorkService**: Maneja operaciones CRUD para entidades ExtraWork
- **ResourceService**: Gestiona entidades Resource asociadas con ExtraWorks

**Características Clave:**
- Encapsula todas las operaciones de base de datos
- Proporciona interfaces limpias para la lógica de negocio
- Usa Prisma ORM para acceso a base de datos con seguridad de tipos

#### Capa de Intenciones (`backend/src/intentions/`)
El núcleo del sistema NLP, implementando una arquitectura de plugins extensible.

**Componentes:**
- **Intention.ts**: Interfaz base y clase abstracta para todas las intenciones
- **IntentionRegistry.ts**: Registro central para gestionar intenciones
- **modules/**: Implementaciones individuales de intenciones

**Cómo funciona:**
1. Cada intención define palabras clave y un algoritmo de coincidencia
2. El registro encuentra la mejor intención coincidente para una consulta dada
3. Las intenciones ejecutan su lógica de negocio específica

**Ejemplos de Intenciones:**
- `CreateExtraWorkIntention`: Crea nuevos elementos de trabajo
- `SearchExtraWorkIntention`: Busca elementos de trabajo existentes
- `UpdateExtraWorkIntention`: Actualiza elementos de trabajo
- `DeleteExtraWorkIntention`: Elimina elementos de trabajo
- `AddResourceIntention`: Agrega recursos a elementos de trabajo

#### Action Factory (`backend/src/utils/ActionFactory.ts`)
Implementa el patrón Factory para generar acciones ejecutables.

**Responsabilidades:**
- Crea acciones a partir de consultas en lenguaje natural
- Proporciona creación directa de acciones basadas en intenciones
- Devuelve sugerencias de acciones buscables con puntajes de confianza

#### Capa de API (`backend/src/api/routes/`)
Endpoints de API REST para acceso externo.

**Grupos de Rutas:**
- **extrawork.routes.ts**: Endpoints CRUD para ExtraWorks
- **resource.routes.ts**: Endpoints CRUD para Resources
- **action.routes.ts**: Endpoints de búsqueda y ejecución NLP

### 2. Arquitectura del Frontend

#### Capa de Componentes (`frontend/src/components/`)
Componentes React que implementan la interfaz de usuario.

- **SearchBar.tsx**: Interfaz de búsqueda en lenguaje natural
  - Acepta consultas de texto
  - Muestra acciones coincidentes con puntajes de confianza
  - Permite ejecución directa de acciones

- **ExtraWorkList.tsx**: Interfaz CRUD para ExtraWorks
  - Lista todos los ExtraWorks
  - Operaciones de Crear/Actualizar/Eliminar
  - Formulario para la creación de nuevo ExtraWork

#### Capa de Servicio (`frontend/src/services/api.ts`)
Encapsula toda la comunicación con la API.

**Beneficios:**
- Lógica de API centralizada
- Respuestas con seguridad de tipos
- Fácil de simular para pruebas
- Manejo consistente de errores

## Flujo de Datos

### Creando un ExtraWork mediante NLP

```
Entrada del Usuario: "crear nueva tarea"
    ↓
Componente SearchBar
    ↓
API Service → POST /api/actions/search
    ↓
Action Routes
    ↓
Action Factory → encuentra la mejor intención coincidente
    ↓
IntentionRegistry → devuelve "create_extrawork"
    ↓
SearchBar muestra la acción con puntaje de confianza
    ↓
Usuario hace clic en "Ejecutar"
    ↓
API Service → POST /api/actions/execute/create_extrawork
    ↓
CreateExtraWorkIntention.execute()
    ↓
ExtraWorkService.create()
    ↓
Prisma → Base de Datos
    ↓
Respuesta → Usuario ve mensaje de éxito
```

### Flujo CRUD Tradicional

```
Usuario hace clic en "Nuevo ExtraWork"
    ↓
Se muestra el formulario
    ↓
Usuario completa el formulario y envía
    ↓
API Service → POST /api/extraworks
    ↓
ExtraWork Routes
    ↓
ExtraWorkService.create()
    ↓
Prisma → Base de Datos
    ↓
Respuesta → La lista se actualiza
```

## Extensibilidad

### Agregando una Nueva Intención

1. **Crear Módulo de Intención**
```typescript
// backend/src/intentions/modules/MyIntention.ts
import { BaseIntention } from '../Intention';

export class MyIntention extends BaseIntention {
  name = 'mi_accion_personalizada';
  keywords = ['mis', 'palabras', 'clave', 'personalizadas'];
  description = 'Lo que hace esta intención';

  constructor(private myService: MyService) {
    super();
  }

  async execute(params: any): Promise<any> {
    // Implementación
    return {
      success: true,
      data: result,
      message: 'Mensaje de éxito'
    };
  }
}
```

2. **Registrar Intención**
```typescript
// backend/src/index.ts
intentionRegistry.register(new MyIntention(myService));
```

3. **¡No se necesitan cambios en el frontend!** La búsqueda NLP descubrirá y usará automáticamente la nueva intención.

### Agregando un Nuevo Servicio de Dominio

1. Crear servicio en `backend/src/domain/`
2. Inyectar PrismaClient
3. Implementar métodos de lógica de negocio
4. Crear rutas correspondientes en `backend/src/api/routes/`

### Agregando una Nueva Característica en Frontend

1. Crear componente en `frontend/src/components/`
2. Usar servicio API para comunicación con backend
3. Actualizar App.tsx para incluir el nuevo componente

## Elecciones Tecnológicas

### Backend

- **TypeScript**: Seguridad de tipos y mejor experiencia de desarrollo
- **Express**: Framework web ligero y flexible
- **Prisma**: ORM moderno con excelente soporte de TypeScript
- **SQLite**: Base de datos simple basada en archivos (fácil de cambiar a PostgreSQL/MySQL)

### Frontend

- **React**: Biblioteca de UI basada en componentes
- **Vite**: Herramienta de compilación rápida con excelente DX
- **TypeScript**: Seguridad de tipos en toda la pila

## Patrones de Diseño

1. **Patrón de Servicio**: Encapsula la lógica de negocio en servicios
2. **Patrón Factory**: ActionFactory crea acciones dinámicamente
3. **Patrón Registry**: IntentionRegistry gestiona intenciones
4. **Patrón Estrategia**: Cada intención es una estrategia para manejar consultas
5. **Patrón Repositorio**: Los servicios actúan como repositorios para entidades de dominio

## Consideraciones de Seguridad

- Se necesita validación de entrada para producción
- Autenticación/autorización no implementada (agregar JWT/OAuth)
- CORS configurado para desarrollo (restringir para producción)
- Protección contra inyección SQL mediante Prisma
- Protección XSS mediante el escape predeterminado de React

## Consideraciones de Escalabilidad

### Implementación Actual
- Servidor único
- Base de datos SQLite
- Procesamiento síncrono

### Mejoras Futuras
- Cambiar a PostgreSQL para producción
- Agregar capa de caché (Redis)
- Implementar cola de mensajes para operaciones asíncronas
- Agregar limitación de velocidad
- Implementar paginación para conjuntos de datos grandes
- Agregar búsqueda de texto completo (Elasticsearch)
- Arquitectura de microservicios para diferentes intenciones

## Estrategia de Pruebas

### Backend
- Pruebas unitarias para servicios
- Pruebas de integración para endpoints de API
- Probar la lógica de coincidencia de intenciones

### Frontend
- Pruebas unitarias de componentes
- Pruebas de integración con React Testing Library
- Pruebas E2E con Playwright

## Monitoreo y Observabilidad

Adiciones recomendadas:
- Registro estructurado (Winston/Pino)
- Métricas de aplicación (Prometheus)
- Seguimiento de errores (Sentry)
- Monitoreo de API (DataDog/New Relic)

## Despliegue

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Servir dist/ con cualquier servidor de archivos estáticos
```

### Soporte Docker
Considerar agregar:
- Dockerfile para backend
- Dockerfile para frontend
- docker-compose.yml para orquestación

## Conclusión

Esta arquitectura proporciona una base sólida para una aplicación modular y extensible. El sistema de intenciones facilita agregar nuevas capacidades sin modificar el código existente, siguiendo el Principio Abierto/Cerrado. La clara separación de preocupaciones garantiza la mantenibilidad a medida que la aplicación crece.
