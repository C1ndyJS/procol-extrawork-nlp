# ExtraWorks Architecture

## Overview

ExtraWorks is a modular web application built with a focus on extensibility and maintainability. The application features a natural language processing (NLP) action search engine that allows users to interact with the system using natural language queries.

## Architecture Layers

### 1. Backend Architecture

#### Domain Layer (`backend/src/domain/`)
Contains business logic and data access services.

- **ExtraWorkService**: Handles CRUD operations for ExtraWork entities
- **ResourceService**: Manages Resource entities associated with ExtraWorks

**Key Features:**
- Encapsulates all database operations
- Provides clean interfaces for business logic
- Uses Prisma ORM for type-safe database access

#### Intention Layer (`backend/src/intentions/`)
The core of the NLP system, implementing an extensible plugin architecture.

**Components:**
- **Intention.ts**: Base interface and abstract class for all intentions
- **IntentionRegistry.ts**: Central registry for managing intentions
- **modules/**: Individual intention implementations

**How it works:**
1. Each intention defines keywords and a match algorithm
2. The registry finds the best matching intention for a given query
3. Intentions execute their specific business logic

**Example Intentions:**
- `CreateExtraWorkIntention`: Creates new work items
- `SearchExtraWorkIntention`: Searches existing work items
- `UpdateExtraWorkIntention`: Updates work items
- `DeleteExtraWorkIntention`: Deletes work items
- `AddResourceIntention`: Adds resources to work items

#### Action Factory (`backend/src/utils/ActionFactory.ts`)
Implements the Factory pattern to generate executable actions.

**Responsibilities:**
- Creates actions from natural language queries
- Provides direct intent-based action creation
- Returns searchable action suggestions with confidence scores

#### API Layer (`backend/src/api/routes/`)
REST API endpoints for external access.

**Route Groups:**
- **extrawork.routes.ts**: CRUD endpoints for ExtraWorks
- **resource.routes.ts**: CRUD endpoints for Resources
- **action.routes.ts**: NLP search and execution endpoints

### 2. Frontend Architecture

#### Component Layer (`frontend/src/components/`)
React components implementing the user interface.

- **SearchBar.tsx**: Natural language search interface
  - Accepts text queries
  - Displays matching actions with confidence scores
  - Allows direct action execution

- **ExtraWorkList.tsx**: CRUD interface for ExtraWorks
  - Lists all ExtraWorks
  - Create/Update/Delete operations
  - Form for new ExtraWork creation

#### Service Layer (`frontend/src/services/api.ts`)
Encapsulates all API communication.

**Benefits:**
- Centralized API logic
- Type-safe responses
- Easy to mock for testing
- Consistent error handling

## Data Flow

### Creating an ExtraWork via NLP

```
User Input: "create new task"
    ↓
SearchBar Component
    ↓
API Service → POST /api/actions/search
    ↓
Action Routes
    ↓
Action Factory → finds best matching intention
    ↓
IntentionRegistry → returns "create_extrawork"
    ↓
SearchBar displays action with confidence score
    ↓
User clicks "Execute"
    ↓
API Service → POST /api/actions/execute/create_extrawork
    ↓
CreateExtraWorkIntention.execute()
    ↓
ExtraWorkService.create()
    ↓
Prisma → Database
    ↓
Response → User sees success message
```

### Traditional CRUD Flow

```
User clicks "New ExtraWork"
    ↓
Form displays
    ↓
User fills form and submits
    ↓
API Service → POST /api/extraworks
    ↓
ExtraWork Routes
    ↓
ExtraWorkService.create()
    ↓
Prisma → Database
    ↓
Response → List refreshes
```

## Extensibility

### Adding a New Intention

1. **Create Intention Module**
```typescript
// backend/src/intentions/modules/MyIntention.ts
import { BaseIntention } from '../Intention';

export class MyIntention extends BaseIntention {
  name = 'my_custom_action';
  keywords = ['my', 'custom', 'keywords'];
  description = 'What this intention does';

  constructor(private myService: MyService) {
    super();
  }

  async execute(params: any): Promise<any> {
    // Implementation
    return {
      success: true,
      data: result,
      message: 'Success message'
    };
  }
}
```

2. **Register Intention**
```typescript
// backend/src/index.ts
intentionRegistry.register(new MyIntention(myService));
```

3. **No frontend changes needed!** The NLP search will automatically discover and use the new intention.

### Adding a New Domain Service

1. Create service in `backend/src/domain/`
2. Inject PrismaClient
3. Implement business logic methods
4. Create corresponding routes in `backend/src/api/routes/`

### Adding a New Frontend Feature

1. Create component in `frontend/src/components/`
2. Use API service for backend communication
3. Update App.tsx to include new component

## Technology Choices

### Backend

- **TypeScript**: Type safety and better developer experience
- **Express**: Lightweight, flexible web framework
- **Prisma**: Modern ORM with excellent TypeScript support
- **SQLite**: Simple, file-based database (easy to switch to PostgreSQL/MySQL)

### Frontend

- **React**: Component-based UI library
- **Vite**: Fast build tool with great DX
- **TypeScript**: Type safety across the stack

## Design Patterns

1. **Service Pattern**: Encapsulates business logic in services
2. **Factory Pattern**: ActionFactory creates actions dynamically
3. **Registry Pattern**: IntentionRegistry manages intentions
4. **Strategy Pattern**: Each intention is a strategy for handling queries
5. **Repository Pattern**: Services act as repositories for domain entities

## Security Considerations

- Input validation needed for production
- Authentication/authorization not implemented (add JWT/OAuth)
- CORS configured for development (tighten for production)
- SQL injection protected by Prisma
- XSS protection via React's default escaping

## Scalability Considerations

### Current Implementation
- Single server
- SQLite database
- Synchronous processing

### Future Improvements
- Switch to PostgreSQL for production
- Add caching layer (Redis)
- Implement message queue for async operations
- Add rate limiting
- Implement pagination for large datasets
- Add full-text search (Elasticsearch)
- Microservices architecture for different intentions

## Testing Strategy

### Backend
- Unit tests for services
- Integration tests for API endpoints
- Test intention matching logic

### Frontend
- Component unit tests
- Integration tests with React Testing Library
- E2E tests with Playwright

## Monitoring and Observability

Recommended additions:
- Structured logging (Winston/Pino)
- Application metrics (Prometheus)
- Error tracking (Sentry)
- API monitoring (DataDog/New Relic)

## Deployment

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
# Serve dist/ with any static file server
```

### Docker Support
Consider adding:
- Dockerfile for backend
- Dockerfile for frontend
- docker-compose.yml for orchestration

## Conclusion

This architecture provides a solid foundation for a modular, extensible application. The intention system makes it easy to add new capabilities without modifying existing code, following the Open/Closed Principle. The clear separation of concerns ensures maintainability as the application grows.
