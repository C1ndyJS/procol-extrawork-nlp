# Sistema de Búsqueda con Procesamiento de Lenguaje Natural

## Extraworks App - Documentación del Core NLP

---

## 1. Resumen Ejecutivo

Este proyecto implementa un **Command Palette inteligente** que permite a los usuarios ejecutar acciones en la aplicación usando **lenguaje natural en español**. En lugar de navegar por menús o memorizar comandos, el usuario simplemente escribe lo que desea hacer.

### Ejemplo de Uso

| Input del Usuario | Acción Ejecutada |
|-------------------|------------------|
| "crear extrawork mover silla" | Abre formulario con título "mover silla" prellenado |
| "asignar carpintero a EW-001" | Asigna el recurso "carpintero" al ExtraWork EW-001 |
| "silla" | Muestra recursos que contienen "silla" con acciones contextuales |

---

## 2. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KBar (Command Palette)                        │   │
│  │  ┌─────────────────┐    ┌─────────────────┐                     │   │
│  │  │ Acciones        │    │ Acciones        │                     │   │
│  │  │ Estáticas       │    │ Dinámicas (NLP) │                     │   │
│  │  │ - Navegación    │    │ - Del Backend   │                     │   │
│  │  │ - Atajos        │    │ - Contextuales  │                     │   │
│  │  └─────────────────┘    └────────┬────────┘                     │   │
│  └──────────────────────────────────┼──────────────────────────────┘   │
│                                     │                                   │
│                          POST /api/actions/search                       │
│                          { query: "crear extrawork...", threshold: 0.15 }│
└─────────────────────────────────────┼───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        ActionFactory                             │   │
│  │                              │                                   │   │
│  │              ┌───────────────┼───────────────┐                   │   │
│  │              ▼               ▼               ▼                   │   │
│  │     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │   │
│  │     │  TextParser  │ │  Intention   │ │  Resource    │          │   │
│  │     │  (NLP Core)  │ │  Registry    │ │  Service     │          │   │
│  │     └──────────────┘ └──────────────┘ └──────────────┘          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Respuesta: [{ intent, score, title, subtitle, params }]               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Componentes del Core NLP

### 3.1 TextParser - El Cerebro del NLP

**Ubicación:** `backend/src/utils/TextParser.ts`

El TextParser es el componente central que analiza el texto del usuario y extrae:
- **Intención**: Qué quiere hacer el usuario
- **Entidades**: Datos específicos mencionados (IDs, nombres, etc.)

#### Patrones de Intención (Regex en Español)

```typescript
private readonly intentionPatterns: Map<string, RegExp[]> = new Map([
  ['create_extrawork', [
    /\b(?:crear|nuevo|nueva|añadir|agregar)\s+(?:un\s+)?(?:extrawork|trabajo|ew)\b:?/i,
    /\bquiero\s+crear\s+(?:un\s+)?(?:extrawork|trabajo):?/i,
    /\b(?:nuevo|nueva)\s+(?:extrawork|trabajo):?/i
  ]],
  ['assign_resource_to_extrawork', [
    /\basignar\s+["']?([^"']+?)["']?\s+a(?:l)?\s+(?:extrawork\s+)?(EW-\d+|\d+)/i,
    /\bañadir\s+["']?([^"']+?)["']?\s+a(?:l)?\s+(?:extrawork\s+)?(EW-\d+|\d+)/i,
  ]],
  // ... más patrones
]);
```

#### Extracción de Entidades

```typescript
// Extrae IDs de ExtraWork (formato EW-001)
private readonly extraWorkPattern = /\b(EW-\d+)\b/gi;

// Extrae títulos de queries como "crear extrawork mover silla"
private extractTitle(query: string): string | undefined {
  const patterns = [
    /\bcrear\s+(?:un\s+)?(?:extrawork|trabajo|ew):?\s+["']?(.+)["']?\s*$/i,
    // ... más patrones
  ];
  // Retorna: "mover silla"
}
```

#### Flujo del Parser

```
Input: "crear extrawork mover silla"
                    │
                    ▼
┌─────────────────────────────────────┐
│          TextParser.parse()          │
│                                      │
│  1. Buscar patrón de intención      │
│     ✓ Coincide: create_extrawork    │
│                                      │
│  2. Calcular score de coincidencia  │
│     score = match.length / query.length │
│     score = 0.9                      │
│                                      │
│  3. Extraer entidades               │
│     title = "mover silla"           │
└─────────────────────────────────────┘
                    │
                    ▼
Output: {
  intention: "create_extrawork",
  entities: { title: "mover silla" },
  originalQuery: "crear extrawork mover silla"
}
```

---

### 3.2 IntentionRegistry - Registro de Intenciones

**Ubicación:** `backend/src/intentions/IntentionRegistry.ts`

Mantiene un registro de todas las intenciones disponibles y sus ejecutores.

```typescript
export class IntentionRegistry {
  private intentions: Map<string, Intention> = new Map();

  // Busca coincidencias por keywords
  findAllMatches(query: string, threshold: number): Array<{ intention, score }> {
    const matches = [];
    for (const intention of this.intentions.values()) {
      const score = intention.match(query); // Calcula similitud
      if (score >= threshold) {
        matches.push({ intention, score });
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  }
}
```

#### Intenciones Registradas

| Intent | Keywords | Descripción |
|--------|----------|-------------|
| `create_extrawork` | crear, nuevo, añadir, extrawork, trabajo | Crear nuevo ExtraWork |
| `search_extrawork` | buscar, ver, listar, mostrar | Buscar ExtraWorks |
| `assign_resource_to_extrawork` | asignar, añadir, agregar, poner | Asignar recurso |
| `view_resource` | (búsqueda por nombre) | Ver detalles de recurso |
| `open_extrawork_for_resource` | (contextual) | Ver ExtraWork de un recurso |

---

### 3.3 ActionFactory - Generador de Acciones

**Ubicación:** `backend/src/utils/ActionFactory.ts`

Coordina el TextParser y el IntentionRegistry para generar sugerencias de acciones.

#### Algoritmo de Búsqueda

```typescript
async searchActions(query: string, threshold: number = 0.3): Promise<ActionSuggestion[]> {
  // 1. Parsear la query
  const parsed = this.textParser.parse(query);

  // 2. Obtener coincidencias del registry
  const matches = this.intentionRegistry.findAllMatches(query, threshold);

  // 3. Priorizar intención parseada
  if (parsed.intention) {
    const parsedIntention = this.intentionRegistry.getIntention(parsed.intention);
    if (parsedIntention) {
      // Boost score a 0.9 para intención detectada por parser
      existingMatch.score = Math.max(existingMatch.score, 0.9);
    }
  }

  // 4. Filtrar intenciones que requieren parámetros obligatorios
  for (const match of matches) {
    if (this.requiresMandatoryParams(intention.name, params)) {
      continue; // Saltar delete_extrawork sin ID, etc.
    }
    suggestions.push(/* ... */);
  }

  // 5. Buscar recursos por nombre (si no hay intención específica)
  if (query.trim().length >= 2) {
    const resourceSuggestions = await this.searchResourcesByName(query);
    suggestions.push(...resourceSuggestions);
  }

  return suggestions.sort((a, b) => b.score - a.score);
}
```

#### Filtro de Parámetros Obligatorios

Evita mostrar acciones que no tienen sentido sin parámetros:

```typescript
private requiresMandatoryParams(intent: string, params: any): boolean {
  const requiresIdOrCode = ['delete_extrawork', 'update_extrawork', 'open_extrawork'];

  if (requiresIdOrCode.includes(intent)) {
    if (!params.id && !params.code) {
      return true; // No mostrar esta acción
    }
  }
  return false;
}
```

**Ejemplo:**
- Query: "crear extrawork silla" → Muestra `create_extrawork`
- Query: "crear extrawork silla" → NO muestra `delete_extrawork` (requiere ID)

---

### 3.4 Búsqueda Contextual de Recursos

Cuando el usuario busca algo que no es una intención clara, el sistema busca en la base de datos:

```typescript
private async searchResourcesByName(query: string): Promise<ActionSuggestion[]> {
  const resources = await this.resourceService.search(query);
  const suggestions: ActionSuggestion[] = [];

  for (const resource of resources) {
    // Sugerencia 1: Ver detalles del recurso
    suggestions.push({
      intent: 'view_resource',
      score: 0.85,
      title: `Ver recurso: "${resource.name}"`,
      subtitle: `Tipo: ${resource.type} | Disponibilidad`,
      params: { resourceId: resource.id, resourceName: resource.name }
    });

    // Sugerencia 2: Ver ExtraWork asociado (si existe)
    if (resource.extraWorkId && resource.extraWork) {
      suggestions.push({
        intent: 'open_extrawork_for_resource',
        score: 0.8,
        title: `Ver ExtraWork de "${resource.name}"`,
        subtitle: `ExtraWork: ${resource.extraWork.title}`,
        params: { extraWorkId: resource.extraWorkId }
      });
    }

    // Sugerencia 3: Asignar a ExtraWork (si disponible)
    if (resource.availability === 'available' && !resource.extraWorkId) {
      suggestions.push({
        intent: 'assign_resource_suggestion',
        score: 0.7,
        title: `Asignar "${resource.name}" a ExtraWork`,
        params: { resourceId: resource.id }
      });
    }
  }
  return suggestions;
}
```

---

## 4. Flujo Completo de una Búsqueda

### Ejemplo: "asignar carpintero a EW-001"

```
┌─────────────────────────────────────────────────────────────────┐
│ PASO 1: Usuario escribe en KBar                                  │
│         Input: "asignar carpintero a EW-001"                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (debounce 300ms)
┌─────────────────────────────────────────────────────────────────┐
│ PASO 2: Frontend envía request                                   │
│         POST /api/actions/search                                │
│         Body: { query: "asignar carpintero a EW-001",           │
│                threshold: 0.15 }                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 3: TextParser analiza la query                              │
│                                                                  │
│   Patrón encontrado:                                            │
│   /\basignar\s+["']?([^"']+?)["']?\s+a(?:l)?\s+...?(EW-\d+)/i  │
│                                                                  │
│   Grupos capturados:                                            │
│   - match[1] = "carpintero" (nombre del recurso)                │
│   - match[2] = "EW-001" (ID del ExtraWork)                      │
│                                                                  │
│   Resultado:                                                    │
│   {                                                             │
│     intention: "assign_resource_to_extrawork",                  │
│     entities: {                                                 │
│       resourceName: "carpintero",                               │
│       extraWorkId: "EW-001"                                     │
│     }                                                           │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 4: ActionFactory genera sugerencias                         │
│                                                                  │
│   - Intención detectada: assign_resource_to_extrawork           │
│   - Score boosteado a 0.9                                       │
│   - Parámetros extraídos: { resourceName, extraWorkId }         │
│                                                                  │
│   Sugerencia generada:                                          │
│   {                                                             │
│     intent: "assign_resource_to_extrawork",                     │
│     score: 0.9,                                                 │
│     title: 'Asignar "carpintero" a EW-001',                     │
│     subtitle: "Asignar recurso a ExtraWork",                    │
│     params: { resourceName: "carpintero", extraWorkId: "EW-001" }│
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ PASO 5: Frontend recibe y muestra                                │
│                                                                  │
│   ┌─────────────────────────────────────────────┐              │
│   │ ⚡ Asignar "carpintero" a EW-001            │              │
│   │    Asignar recurso a ExtraWork              │              │
│   └─────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (usuario selecciona)
┌─────────────────────────────────────────────────────────────────┐
│ PASO 6: Ejecución de la acción                                   │
│                                                                  │
│   KBarProvider ejecuta perform():                               │
│   - Navega a vista de recursos                                  │
│   - Dispara evento CustomEvent('openAssignResource', params)    │
│   - El componente Recursos escucha y procesa                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Sistema de Scoring

El sistema usa múltiples factores para calcular la relevancia:

### 5.1 Score por Coincidencia de Patrón

```typescript
// TextParser: Score basado en longitud del match
const score = match[0].length / query.length;
// "crear extrawork" en "crear extrawork silla" = 15/22 = 0.68
```

### 5.2 Score por Keywords

```typescript
// BaseIntention: Score basado en keywords coincidentes
match(query: string): number {
  let matchCount = 0;
  for (const keyword of this.keywords) {
    if (query.includes(keyword)) matchCount++;
  }
  return matchCount / this.keywords.length;
}
// "crear extrawork" con keywords [crear, nuevo, extrawork] = 2/3 = 0.67
```

### 5.3 Score Boost para Parser

```typescript
// ActionFactory: Boost para intención detectada por parser
if (parsed.intention === intention.name) {
  existingMatch.score = Math.max(existingMatch.score, 0.9);
}
```

### 5.4 Scores para Búsqueda de Recursos

| Tipo de Sugerencia | Score |
|--------------------|-------|
| Ver recurso encontrado | 0.85 |
| Ver ExtraWork asociado | 0.80 |
| Asignar recurso disponible | 0.70 |

---

## 6. Intenciones Soportadas

### 6.1 Crear ExtraWork

```
Queries válidas:
- "crear extrawork mover silla"
- "nuevo trabajo pintar pared"
- "añadir extrawork reparar techo"
- "quiero crear un trabajo instalar luz"

Resultado:
- Navega a Extraworks
- Abre modal de creación
- Prellena título extraído
```

### 6.2 Buscar ExtraWorks

```
Queries válidas:
- "ver extraworks"
- "listar trabajos"
- "mostrar todos los extraworks"
- "buscar extrawork"

Resultado:
- Navega a vista Extraworks
```

### 6.3 Asignar Recurso a ExtraWork

```
Queries válidas:
- "asignar carpintero a EW-001"
- "añadir pintor al extrawork EW-002"
- "poner electricista en EW-003"

Resultado:
- Ejecuta asignación vía API
- O navega para selección manual
```

### 6.4 Búsqueda por Nombre de Recurso

```
Query: "silla"

Resultados contextuales:
1. Ver recurso: "Silla de oficina" (si existe)
2. Ver ExtraWork de "Silla..." (si está asignada)
3. Asignar "Silla..." a ExtraWork (si disponible)
```

---

## 7. Configuración del Threshold

El threshold determina la sensibilidad de la búsqueda:

| Threshold | Comportamiento |
|-----------|----------------|
| 0.1 | Muy permisivo, muchos falsos positivos |
| **0.15** | Configuración actual - balance óptimo |
| 0.3 | Más estricto, requiere coincidencias más exactas |
| 0.5+ | Muy estricto, solo coincidencias casi exactas |

```typescript
// Frontend: KBarProvider.tsx
const suggestions = await apiService.searchActions(trimmedQuery, 0.15);
```

---

## 8. Extensibilidad

### Agregar Nueva Intención

1. **Crear la clase de intención:**

```typescript
// backend/src/intentions/modules/NewIntention.ts
export class NewIntention extends BaseIntention {
  name = 'new_action';
  keywords = ['palabra1', 'palabra2', 'keyword'];
  description = 'Descripción de la acción';

  async execute(params: { /* ... */ }): Promise<any> {
    // Lógica de ejecución
  }
}
```

2. **Registrar en el registry:**

```typescript
// backend/src/index.ts
intentionRegistry.register(new NewIntention(/* dependencies */));
```

3. **Agregar patrón en TextParser (opcional):**

```typescript
['new_action', [
  /\bpatrón\s+regex\s+específico/i,
]]
```

4. **Agregar handler en Frontend:**

```typescript
// KBarProvider.tsx
if (suggestion.intent === 'new_action') {
  // Ejecutar acción en frontend
}
```

---

## 9. Métricas y Logging

El sistema incluye logging para debugging:

```typescript
// ActionFactory
console.log('[ActionFactory] Parsed intention:', parsed.intention);
console.log('[ActionFactory] Parsed entities:', parsed.entities);
console.log(`[ActionFactory] Checking ${intention.name}, params:`, params);
console.log(`[ActionFactory] Filtering out ${intention.name} - missing required params`);

// Frontend
console.log('[KBar] Query changed:', query);
console.log('[KBar] Fetching actions for:', trimmedQuery);
console.log('[KBar] Backend returned:', suggestions);
console.log('[KBar] Converted to actions:', actions.length);
```

---

## 10. Casos de Uso Demostrativos

### Caso 1: Crear ExtraWork con título

```
Usuario escribe: "crear extrawork instalar aire acondicionado"

Sistema detecta:
- Intención: create_extrawork
- Título: "instalar aire acondicionado"

Acción:
- Navega a Extraworks
- Abre formulario
- Campo título = "instalar aire acondicionado"
```

### Caso 2: Búsqueda de recurso existente

```
Usuario escribe: "grúa"

Sistema busca en BD:
- Encuentra: "Grúa Torre GT-500" asignada a EW-001

Sugerencias mostradas:
1. Ver recurso: "Grúa Torre GT-500" (equipment)
2. Ver ExtraWork de "Grúa Torre GT-500" → EW-001
```

### Caso 3: Asignación directa

```
Usuario escribe: "asignar pintor a EW-002"

Sistema detecta:
- Intención: assign_resource_to_extrawork
- Recurso: "pintor"
- ExtraWork: "EW-002"

Acción:
- Ejecuta asignación via API
- O presenta opciones de pintores disponibles
```

---

## 11. Ventajas del Sistema

| Característica | Beneficio |
|----------------|-----------|
| **Lenguaje Natural** | No requiere memorizar comandos |
| **Español Nativo** | Adaptado al idioma del usuario |
| **Búsqueda Contextual** | Sugerencias inteligentes basadas en datos |
| **Debouncing** | Optimiza llamadas al servidor |
| **Filtro de Acciones** | Solo muestra acciones ejecutables |
| **Extensible** | Fácil agregar nuevas intenciones |
| **Scores de Relevancia** | Ordena por probabilidad de intención |

---

## 12. Tecnologías Utilizadas

| Componente | Tecnología |
|------------|------------|
| Command Palette | KBar (React) |
| NLP Parser | Regex + TypeScript |
| Backend | Express + TypeScript |
| Base de Datos | MySQL + Prisma ORM |
| Comunicación | REST API + JSON |

---

## 13. Conclusión

El sistema de búsqueda NLP de Extraworks App demuestra cómo combinar:

1. **Parsing basado en patrones regex** para detectar intenciones en español
2. **Búsqueda por keywords** como fallback para coincidencias parciales
3. **Búsqueda contextual en BD** para sugerencias basadas en datos reales
4. **Sistema de scoring** para ordenar resultados por relevancia
5. **Filtros inteligentes** para evitar acciones sin sentido

El resultado es una experiencia de usuario fluida donde el usuario puede expresar lo que quiere hacer en lenguaje natural y el sistema responde con acciones relevantes y ejecutables.
