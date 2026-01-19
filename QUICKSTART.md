# Guía de Inicio Rápido

¡Pon en marcha ExtraWorks en 5 minutos!

## Prerrequisitos

- Node.js 18 o superior
- npm o yarn

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/C1ndyJS/procol-extrawork-nlp.git
cd procol-extrawork-nlp
```

### 2. Configurar Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

## Ejecutar la Aplicación

### Iniciar Backend (Terminal 1)

```bash
cd backend
npm run dev
```

El backend se iniciará en http://localhost:3000

### Iniciar Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

El frontend se iniciará en http://localhost:5173

## Usar la Aplicación

### 1. Búsqueda en Lenguaje Natural

1. Navega a http://localhost:5173
2. Verás la pestaña "NLP Search" (predeterminada)
3. Escribe una consulta en lenguaje natural como:
   - "crear nueva tarea"
   - "buscar extrawork"
   - "encontrar todos los trabajos"
4. Haz clic en "Search Actions"
5. Ve las acciones coincidentes con puntajes de confianza
6. Haz clic en "Execute" para ejecutar la acción

### 2. Administrar ExtraWorks

1. Haz clic en la pestaña "Manage ExtraWorks"
2. Haz clic en "New ExtraWork" para crear un elemento de trabajo
3. Completa:
   - Title (obligatorio)
   - Description (obligatorio)
   - Status (pending/in-progress/completed)
   - Priority (low/medium/high)
4. Haz clic en "Create ExtraWork"
5. Ve todos los ExtraWorks en la lista
6. Haz clic en "Delete" para eliminar un ExtraWork

## Endpoints de API

Prueba la API directamente:

### Verificación de Salud
```bash
curl http://localhost:3000/health
```

### Listar Todas las Intenciones
```bash
curl http://localhost:3000/api/intentions
```

### Buscar Acciones
```bash
curl -X POST http://localhost:3000/api/actions/search \
  -H "Content-Type: application/json" \
  -d '{"query": "crear nueva tarea"}'
```

### Listar ExtraWorks
```bash
curl http://localhost:3000/api/extraworks
```

### Crear ExtraWork
```bash
curl -X POST http://localhost:3000/api/extraworks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi Tarea",
    "description": "Descripción de la tarea",
    "status": "pending",
    "priority": "high"
  }'
```

### Ejecutar Acción por Intención
```bash
curl -X POST http://localhost:3000/api/actions/execute/search_extrawork \
  -H "Content-Type: application/json" \
  -d '{"params": {}}'
```

## Ejemplos de Consultas

El sistema NLP reconoce estos tipos de consultas:

### Operaciones de Creación
- "crear nuevo extrawork"
- "agregar una tarea"
- "nuevo elemento de trabajo"

### Operaciones de Búsqueda
- "buscar extrawork"
- "encontrar tareas"
- "listar todos los trabajos"

### Operaciones de Actualización
- "actualizar extrawork"
- "modificar tarea"
- "editar trabajo"

### Operaciones de Eliminación
- "eliminar extrawork"
- "remover tarea"

### Operaciones de Recursos
- "agregar recurso"
- "adjuntar archivo"
- "agregar enlace"

## Solución de Problemas

### El backend no inicia
- Verifica que el puerto 3000 no esté en uso
- Asegúrate de que las migraciones de base de datos se ejecutaron correctamente
- Verifica que el archivo `backend/.env` exista

### El frontend no inicia
- Verifica que el puerto 5173 no esté en uso
- Asegúrate de que las dependencias estén instaladas
- Verifica que `frontend/.env` tenga la URL correcta de la API

### Errores de base de datos
- Elimina `backend/dev.db` y ejecuta las migraciones nuevamente:
  ```bash
  cd backend
  rm dev.db
  npm run prisma:migrate
  ```

### Errores de tipo en el frontend
- Limpia el caché de Vite:
  ```bash
  cd frontend
  rm -rf node_modules/.vite
  npm run dev
  ```

## Próximos Pasos

1. Lee [README.md](./README.md) para documentación detallada
2. Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) para entender el diseño del sistema
3. Intenta agregar tu propio módulo de intención (ver guía en ARCHITECTURE.md)
4. Explora los endpoints de la API REST
5. Personaliza los componentes de la UI

## Consejos de Desarrollo

### Modo de vigilancia
Tanto el backend como el frontend se ejecutan en modo de vigilancia por defecto. Los cambios se recargarán automáticamente.

### Explorador de base de datos
Ve la base de datos con Prisma Studio:
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
