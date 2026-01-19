# Quick Start Guide

Get up and running with ExtraWorks in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/C1ndyJS/procol-extrawork-nlp.git
cd procol-extrawork-nlp
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3000

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

## Using the Application

### 1. Natural Language Search

1. Navigate to http://localhost:5173
2. You'll see the "NLP Search" tab (default)
3. Type a natural language query like:
   - "create new task"
   - "search extrawork"
   - "find all works"
4. Click "Search Actions"
5. View matching actions with confidence scores
6. Click "Execute" to run the action

### 2. Manage ExtraWorks

1. Click the "Manage ExtraWorks" tab
2. Click "New ExtraWork" to create a work item
3. Fill in:
   - Title (required)
   - Description (required)
   - Status (pending/in-progress/completed)
   - Priority (low/medium/high)
4. Click "Create ExtraWork"
5. View all ExtraWorks in the list
6. Click "Delete" to remove an ExtraWork

## API Endpoints

Test the API directly:

### Health Check
```bash
curl http://localhost:3000/health
```

### List All Intentions
```bash
curl http://localhost:3000/api/intentions
```

### Search Actions
```bash
curl -X POST http://localhost:3000/api/actions/search \
  -H "Content-Type: application/json" \
  -d '{"query": "create new task"}'
```

### List ExtraWorks
```bash
curl http://localhost:3000/api/extraworks
```

### Create ExtraWork
```bash
curl -X POST http://localhost:3000/api/extraworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Task",
    "description": "Task description",
    "status": "pending",
    "priority": "high"
  }'
```

### Execute Action by Intent
```bash
curl -X POST http://localhost:3000/api/actions/execute/search_extrawork \
  -H "Content-Type: application/json" \
  -d '{"params": {}}'
```

## Example Queries

The NLP system recognizes these types of queries:

### Create Operations
- "create new extrawork"
- "add a task"
- "new work item"

### Search Operations
- "search extrawork"
- "find tasks"
- "list all works"

### Update Operations
- "update extrawork"
- "modify task"
- "edit work"

### Delete Operations
- "delete extrawork"
- "remove task"

### Resource Operations
- "add resource"
- "attach file"
- "add link"

## Troubleshooting

### Backend won't start
- Check that port 3000 is not in use
- Ensure database migrations ran successfully
- Check `backend/.env` file exists

### Frontend won't start
- Check that port 5173 is not in use
- Ensure dependencies are installed
- Check `frontend/.env` file has correct API URL

### Database errors
- Delete `backend/dev.db` and run migrations again:
  ```bash
  cd backend
  rm dev.db
  npm run prisma:migrate
  ```

### Type errors in frontend
- Clear Vite cache:
  ```bash
  cd frontend
  rm -rf node_modules/.vite
  npm run dev
  ```

## Next Steps

1. Read [README.md](./README.md) for detailed documentation
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
3. Try adding your own intention module (see ARCHITECTURE.md for guide)
4. Explore the REST API endpoints
5. Customize the UI components

## Development Tips

### Watch mode
Both backend and frontend run in watch mode by default. Changes will auto-reload.

### Database browser
View the database with Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

### Build for production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Support

For issues or questions, please check:
- README.md - Setup instructions
- ARCHITECTURE.md - System design
- GitHub Issues - Report bugs

## License

MIT
