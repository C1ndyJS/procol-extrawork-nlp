# 🚀 Guía del Buscador Inteligente (KBar NLP)

## Descripción

El buscador inteligente es un motor de interpretación de lenguaje natural **rule-based** (sin IA generativa) que permite controlar toda la aplicación usando lenguaje natural en español.

## ⌨️ Activación

- **Windows/Linux**: `Ctrl + K`
- **Mac**: `Cmd + K`

## 🎯 Comandos Disponibles

### 1. Crear ExtraWork

**Ejemplos:**
```
crear extrawork mover sillas
quiero crear un extrawork nuevo
nuevo extrawork instalación de ventanas
crear trabajo reparar techo
```

**Resultado**: Crea un nuevo ExtraWork con el título especificado

---

### 2. Buscar ExtraWorks

**Ejemplos:**
```
buscar extrawork silla
ver todos los extraworks
listar extraworks
mostrar trabajos
```

**Resultado**: Muestra lista de ExtraWorks (con filtro opcional)

---

### 3. Abrir ExtraWork Específico

**Ejemplos:**
```
abrir EW-001
ir a EW-123
ver EW-456
mostrar detalle EW-789
```

**Resultado**: Navega al detalle del ExtraWork especificado

---

### 4. Asignar Recurso a ExtraWork

**Ejemplos:**
```
añadir carpintero a EW-001
asignar Juan Pérez al EW-123
poner electricista en EW-456
agregar "María García" al EW-789
```

**Resultado**: Asigna el recurso mencionado al ExtraWork

---

### 5. Buscar Recursos

**Ejemplos:**
```
buscar recurso carpintero
ver todos los recursos
listar recursos
mostrar recursos disponibles
```

**Resultado**: Muestra lista de recursos

---

### 6. Crear Recurso

**Ejemplos:**
```
crear recurso
nuevo recurso
añadir recurso
```

**Resultado**: Abre el formulario para crear un nuevo recurso

---

### 7. Actualizar ExtraWork

**Ejemplos:**
```
actualizar EW-001
editar EW-123
modificar EW-456
cambiar EW-789
```

**Resultado**: Abre el formulario de edición del ExtraWork

---

### 8. Eliminar ExtraWork

**Ejemplos:**
```
eliminar EW-001
borrar EW-123
quitar EW-456
```

**Resultado**: Elimina el ExtraWork especificado

---

## 🧠 Cómo Funciona

### 1. **Parser de Texto (TextParser)**
   - Analiza la entrada del usuario
   - Detecta palabras clave y patrones usando RegEx
   - Extrae entidades (IDs, nombres, títulos)
   - Asigna una intención (intent)

### 2. **Registro de Intenciones (IntentionRegistry)**
   - Mantiene todas las intenciones disponibles
   - Evalúa qué intenciones coinciden con el query
   - Asigna un score de confianza (0-1)

### 3. **Fábrica de Acciones (ActionFactory)**
   - Convierte intenciones en acciones ejecutables
   - Genera títulos y subtítulos descriptivos
   - Proporciona sugerencias al usuario

### 4. **KBarProvider (Frontend)**
   - Escucha cambios en el input del buscador
   - Envía queries al backend vía API
   - Muestra acciones sugeridas en tiempo real
   - Ejecuta la acción seleccionada

---

## 📊 Arquitectura

```
Usuario escribe en KBar
        ↓
Frontend (KBarProvider) detecta cambio
        ↓
API Request → /api/actions/search
        ↓
Backend TextParser analiza el texto
        ↓
IntentionRegistry encuentra intenciones
        ↓
ActionFactory genera sugerencias
        ↓
Frontend muestra acciones en KBar
        ↓
Usuario selecciona acción
        ↓
API Request → /api/actions/execute/:intent
        ↓
Backend ejecuta la intención
        ↓
Resultado devuelto al frontend
```

---

## 🔧 Añadir Nueva Intención

### Paso 1: Crear clase de intención

```typescript
// backend/src/intentions/modules/MiNuevaIntention.ts
import { BaseIntention } from '../Intention';

export class MiNuevaIntention extends BaseIntention {
  name = 'mi_nueva_intencion';
  keywords = ['palabra1', 'palabra2', 'palabra3'];
  description = 'Descripción de lo que hace';

  constructor(private servicio: MiServicio) {
    super();
  }

  async execute(params: { param1: string }): Promise<any> {
    // Lógica aquí
    return {
      success: true,
      data: result,
      message: 'Operación exitosa'
    };
  }
}
```

### Paso 2: Registrar en TextParser

```typescript
// backend/src/utils/TextParser.ts
private readonly intentionPatterns: Map<string, RegExp[]> = new Map([
  // ... existentes
  ['mi_nueva_intencion', [
    /patrón1/i,
    /patrón2/i,
  ]]
]);
```

### Paso 3: Registrar en el servidor

```typescript
// backend/src/index.ts
intentionRegistry.register(new MiNuevaIntention(miServicio));
```

### Paso 4: Actualizar ActionFactory labels (opcional)

```typescript
// backend/src/utils/ActionFactory.ts
case 'mi_nueva_intencion':
  return { title: 'Título descriptivo' };
```

### Paso 5: Añadir icono en KBarProvider (opcional)

```typescript
// Frontend/src/components/KBarProvider.tsx
case 'mi_nueva_intencion':
  return <MiIcono className="w-5 h-5" />;
```

---

## 📝 Ejemplos de Testing

### Test con cURL

```bash
# Buscar acciones
curl -X POST http://localhost:3000/api/actions/search \
  -H "Content-Type: application/json" \
  -d '{"query": "crear extrawork mover sillas"}'

# Ejecutar acción
curl -X POST http://localhost:3000/api/actions/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "crear extrawork prueba"}'
```

### Test desde Frontend

```typescript
// En consola del navegador
const api = await import('./services/api');
const actions = await api.apiService.searchActions('buscar extrawork');
console.log(actions);
```

---

## 🎨 Personalización

### Cambiar threshold de confianza

```typescript
// En KBarProvider.tsx
const suggestions = await apiService.searchActions(trimmedQuery, 0.2); // Cambiar 0.2
```

### Modificar tiempo de debounce

```typescript
// En KBarProvider.tsx
}, 300); // Cambiar 300ms
```

---

## 🐛 Troubleshooting

### Las acciones no aparecen
1. Verificar que el backend esté corriendo en `http://localhost:3000`
2. Revisar la consola del navegador para errores
3. Verificar que `.env` tenga `VITE_API_URL` correcto

### Backend no reconoce intención
1. Verificar que los patrones RegEx en TextParser sean correctos
2. Probar con `/api/actions/search` directamente
3. Revisar logs del backend

### Acción no se ejecuta
1. Verificar que la intención esté registrada en `IntentionRegistry`
2. Comprobar que el método `execute()` no tenga errores
3. Revisar que los parámetros sean correctos

---

## 💡 Mejores Prácticas

1. **Patrones RegEx**:
   - Usar `\b` para límites de palabra
   - Usar `?` para partes opcionales
   - Usar grupos `()` para capturar entidades

2. **Keywords**:
   - Incluir sinónimos en español e inglés
   - Palabras clave deben ser específicas pero no demasiado

3. **Score de confianza**:
   - 0.7+ = Alta confianza
   - 0.4-0.7 = Media confianza
   - <0.4 = Baja confianza (puede ignorarse)

4. **UX**:
   - Proveer feedback claro al usuario
   - Mostrar mensajes de error comprensibles
   - Usar íconos descriptivos

---

## 📚 Referencias

- **KBar**: https://kbar.vercel.app/
- **RegEx Testing**: https://regex101.com/
- **Lucide Icons**: https://lucide.dev/

---

## 🚀 Próximos Pasos (Extensiones Futuras)

- [ ] Historial de comandos
- [ ] Favoritos/frecuentes
- [ ] Autocompletar más inteligente
- [ ] Soporte para comandos encadenados
- [ ] Exportar/importar configuración
- [ ] Temas personalizables
- [ ] Soporte multi-idioma
- [ ] Atajos de teclado personalizables
