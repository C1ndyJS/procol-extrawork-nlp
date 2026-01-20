# API Documentation - ExtraWorks CRUD

## Base URL
```
http://localhost:3000/api
```

## Health Check
```
GET /health
```

---

## ExtraWorks Endpoints

### 1. Get All ExtraWorks
```
GET /extraworks
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Extrawork A",
      "description": "Description",
      "status": "pending",
      "priority": "high",
      "startDate": "2026-01-20T00:00:00Z",
      "endDate": "2026-02-20T00:00:00Z",
      "createdAt": "2026-01-20T12:00:00Z",
      "updatedAt": "2026-01-20T12:00:00Z",
      "resources": []
    }
  ]
}
```

### 2. Get ExtraWork by ID
```
GET /extraworks/:id
```

### 3. Get ExtraWorks by Status
```
GET /extraworks/status/:status
```
**Valid statuses:** `pending`, `in_progress`, `completed`, `cancelled`, `on_hold`

### 4. Create ExtraWork
```
POST /extraworks
```
**Request Body:**
```json
{
  "title": "New Extrawork",
  "description": "All about Extrawork",
  "priority": "high",
  "startDate": "2026-02-01",
  "endDate": "2026-03-01"
}
```

### 5. Update ExtraWork
```
PUT /extraworks/:id
```
**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated Description",
  "priority": "medium",
  "startDate": "2026-02-05",
  "endDate": "2026-03-05"
}
```

### 6. Change ExtraWork Status
```
PATCH /extraworks/:id/status
```
**Request Body:**
```json
{
  "status": "in_progress"
}
```

### 7. Delete ExtraWork
```
DELETE /extraworks/:id
```

## Resources Endpoints
### 1. Get All Resources
```
GET /resources
```

### 2. Get Resources by ExtraWork ID
```
GET /resources/extrawork/:extraWorkId
```

### 3. Get Resource by ID
```
GET /resources/:id
```

### 4. Create Resource
```
POST /resources
```
**Request Body:**
```json
{
  "name": "Team A",
  "type": "personnel",
  "url": "https://example.com/resource",
  "metadata": "{\"department\": \"engineering\"}",
  "extraWorkId": "extrawork-uuid"
}
```

### 5. Update Resource
```
PUT /resources/:id
```
**Request Body:** (all fields optional)
```json
{
  "name": "Updated Team A",
  "type": "personnel",
  "url": "https://example.com/resource-updated",
  "metadata": "{\"department\": \"management\"}"
}
```

### 6. Assign Resource to ExtraWork
```
POST /resources/:id/assign/:extraWorkId
```

### 7. Delete Resource
```
DELETE /resources/:id
```

---

## Actions Endpoints (Natural Language Processing)

### 1. Search Actions
```
POST /actions/search
```
**Request Body:**
```json
{
  "query": "create new extrawork",
  "threshold": 0.3
}
```

### 2. Execute Action by Query
```
POST /actions/execute
```
**Request Body:**
```json
{
  "query": "create new extrawork titled Marketing Campaign",
  "params": {
    "title": "Marketing Campaign",
    "description": "Q1 Marketing Activities",
    "priority": "high"
  }
}
```

### 3. Execute Action by Intent Name
```
POST /actions/execute/:intent
```
**Request Body:**
```json
{
  "params": {
    "id": "extrawork-uuid",
    "status": "in_progress"
  }
}
```
---

## Available Intentions

```
GET /api/intentions
```
Current intentions:
- `create_extrawork` - Create a new ExtraWork
- `search_extrawork` - Search ExtraWorks
- `update_extrawork` - Update ExtraWork details
- `delete_extrawork` - Delete ExtraWork
- `change_extrawork_status` - Change ExtraWork status
- `add_resource` - Add resource to ExtraWork
- `create_resource` - Create and assign resource

---

## Example Workflows

### Workflow 1: Create ExtraWork with Resources

1. **Create ExtraWork:**
```bash
curl -X POST http://localhost:3000/api/extraworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Website Redesign",
    "description": "Redesign company website",
    "priority": "high"
  }'
```

2. **Create and Assign Resource:**
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Team",
    "type": "personnel",
    "url": "https://example.com/team",
    "extraWorkId": "EXTRAWORK_ID_FROM_STEP_1"
  }'
```

3. **Change Status to In Progress:**
```bash
curl -X PATCH http://localhost:3000/api/extraworks/EXTRAWORK_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

### Workflow 2: Search and Filter

1. **Get all ExtraWorks in progress:**
```bash
curl http://localhost:3000/api/extraworks/status/in_progress
```

2. **Get all resources for a specific ExtraWork:**
```bash
curl http://localhost:3000/api/resources/extrawork/EXTRAWORK_ID
```

---

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema

### ExtraWork Model
- `id` - UUID (Primary Key)
- `title` - String (required)
- `description` - String (required)
- `status` - String (default: "pending")
- `priority` - String (default: "medium")
- `startDate` - DateTime (optional)
- `endDate` - DateTime (optional)
- `createdAt` - DateTime (auto)
- `updatedAt` - DateTime (auto)
- `resources` - Relation to Resource[]

### Resource Model
- `id` - UUID (Primary Key)
- `name` - String (required)
- `type` - String (required)
- `url` - String (optional)
- `metadata` - String (optional)
- `extraWorkId` - String (Foreign Key, required)
- `extraWork` - Relation to ExtraWork
- `createdAt` - DateTime (auto)
- `updatedAt` - DateTime (auto)

---

## Running the Server

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database
npm run prisma:migrate  # Run migrations
npm run prisma:studio  # Open Prisma Studio
```
