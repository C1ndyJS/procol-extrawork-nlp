# ExtraWorks - Modular Web Application with NLP Action Search

A modular web application with natural language processing capabilities for action search and execution.

## Architecture

### Backend (Node.js + Express + Prisma)

```
backend/
├── src/
│   ├── domain/              # Domain services
│   │   ├── ExtraWorkService.ts
│   │   └── ResourceService.ts
│   ├── intentions/          # Extensible intention system
│   │   ├── Intention.ts     # Base intention interface
│   │   ├── IntentionRegistry.ts
│   │   └── modules/         # Individual intention modules
│   │       ├── CreateExtraWorkIntention.ts
│   │       ├── SearchExtraWorkIntention.ts
│   │       ├── UpdateExtraWorkIntention.ts
│   │       ├── DeleteExtraWorkIntention.ts
│   │       └── AddResourceIntention.ts
│   ├── api/
│   │   └── routes/          # REST API endpoints
│   │       ├── extrawork.routes.ts
│   │       ├── resource.routes.ts
│   │       └── action.routes.ts
│   ├── utils/
│   │   └── ActionFactory.ts # Action factory pattern
│   └── index.ts             # Server entry point
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

### Frontend (React + Vite + TypeScript)

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx    # NLP search interface
│   │   └── ExtraWorkList.tsx # CRUD interface
│   ├── services/
│   │   └── api.ts           # API service layer
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── App.tsx              # Main application
│   └── main.tsx
└── package.json
```

## Features

### 🎯 Modular Architecture
- **Domain Services**: Separate services for ExtraWorks and Resources
- **Intention System**: Each intention as an independent, pluggable module
- **Action Factory**: Generates executable actions from natural language queries

### 🔍 Natural Language Processing
- Search for actions using natural language queries
- Intelligent intent matching with confidence scores
- Execute actions directly from NLP queries

### 🛠️ REST API Endpoints

#### ExtraWork CRUD
- `GET /api/extraworks` - List all ExtraWorks
- `GET /api/extraworks/:id` - Get ExtraWork by ID
- `POST /api/extraworks` - Create new ExtraWork
- `PUT /api/extraworks/:id` - Update ExtraWork
- `DELETE /api/extraworks/:id` - Delete ExtraWork

#### Resource CRUD
- `GET /api/resources` - List all Resources
- `GET /api/resources/:id` - Get Resource by ID
- `POST /api/resources` - Create new Resource
- `PUT /api/resources/:id` - Update Resource
- `DELETE /api/resources/:id` - Delete Resource

#### Action Search & Execution
- `POST /api/actions/search` - Search actions by natural language query
- `POST /api/actions/execute` - Execute action from natural language
- `POST /api/actions/execute/:intent` - Execute action by intent name
- `GET /api/intentions` - List all registered intentions

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

The backend will start on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### Using the Application

1. **NLP Search Tab**: 
   - Type natural language queries like "create new extrawork", "search tasks", "update extrawork"
   - View matching actions with confidence scores
   - Execute actions directly from the search results

2. **Manage ExtraWorks Tab**:
   - View all ExtraWorks
   - Create new ExtraWorks with title, description, status, and priority
   - Delete existing ExtraWorks

### Example NLP Queries

- "create new task"
- "search for extrawork"
- "find all works"
- "add a resource"
- "update extrawork"
- "delete task"

## Extensibility

### Adding New Intentions

1. Create a new intention module in `backend/src/intentions/modules/`:

```typescript
import { BaseIntention } from '../Intention';

export class MyCustomIntention extends BaseIntention {
  name = 'my_custom_intent';
  keywords = ['custom', 'action', 'keywords'];
  description = 'Description of what this intention does';

  constructor(private myService: MyService) {
    super();
  }

  async execute(params: any): Promise<any> {
    // Implementation
    return {
      success: true,
      data: result,
      message: 'Action completed'
    };
  }
}
```

2. Register the intention in `backend/src/index.ts`:

```typescript
intentionRegistry.register(new MyCustomIntention(myService));
```

## Technology Stack

**Backend:**
- Node.js & Express - Web framework
- TypeScript - Type safety
- Prisma ORM - Database ORM
- SQLite - Database

**Frontend:**
- React 18 - UI library
- Vite - Build tool
- TypeScript - Type safety

## API Health Check

Check if the backend is running:
```
GET http://localhost:3000/health
```

## Database Schema

- **ExtraWork**: Main work items with title, description, status, and priority
- **Resource**: Resources attached to ExtraWorks (files, links, etc.)
- **Action**: Registered actions with intents and keywords

## Development

### Project Structure Philosophy

The project follows a modular, domain-driven design:

1. **Domain Layer**: Business logic and data access (Services)
2. **Intention Layer**: Natural language understanding (Intentions)
3. **API Layer**: HTTP endpoints and routing
4. **UI Layer**: React components and state management

This separation ensures:
- Easy testing and maintenance
- Clear separation of concerns
- Simple extension with new features
- Minimal coupling between layers

## License

MIT
