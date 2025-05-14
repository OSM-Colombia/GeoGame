# GeoGame Server

Backend del juego GeoGame desarrollado con Node.js, Express y TypeScript.

## Requisitos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)

## Instalación

```bash
# Estando en el directorio server/
# Instalar dependencias
npm install
```

## Configuración

El servidor utiliza un archivo `.env` en el directorio `server/` para la configuración. Puedes crear uno con la siguiente variable (opcional, por defecto es 5000):

```env
# Configuración del servidor
PORT=5000
# NODE_ENV=development # Opcional, puede ser útil para ciertas librerías
```

## Scripts Disponibles

### `npm run dev`

Ejecuta el servidor en modo desarrollo con recarga automática usando `ts-node-dev`.

### `npm run build`

Compila el código TypeScript a JavaScript en la carpeta `dist/`.

### `npm start`

Inicia el servidor en modo producción (ejecuta el código compilado de `dist/`).

### `npm test`

(Actualmente no implementado o configurado)

## Estructura del Proyecto

```
src/
  ├── controllers/    # Controladores de las rutas (lógica de endpoints)
  ├── data/
  │   └── categories/ # Archivos JSON con los datos de las categorías y preguntas
  ├── models/         # Interfaces de datos específicas del servidor (ej. ICategory)
  ├── routes/         # Definición de rutas de la API
  ├── services/       # Lógica de negocio o servicios externos (ej. OverpassService)
  ├── types/          # Definiciones de TypeScript compartidas o generales
  └── index.ts        # Punto de entrada del servidor Express
```

## API Endpoints

### Juego

- `POST /api/game/start`
  - Inicia un nuevo juego para una categoría.
  - Body: `{ "categoryId": "string" }`
  - Respuesta: `{ category: { categoryId: string, name: string, ... }, questions: QuestionForClient[], startTime: number }`

- `POST /api/game/answer`
  - Envía una respuesta a una pregunta.
  - Body: `{ "categoryId": "string", "questionId": "string", "answer": any, "timeTaken": number, "attempts"?: number, "hintsUsed"?: Array<{ "hintId": "string" }> }`
  - Respuesta: `{ questionScore: number, isCorrect: boolean, correctAnswer: AnswerFeedback, debug_score: { ... } }`

### Categorías

- (Futuro) `GET /api/categories`
  - Podría listar las categorías disponibles desde los archivos JSON.

## Almacenamiento de Datos

Este servidor no utiliza una base de datos persistente. Las categorías y preguntas se cargan desde archivos JSON ubicados en `src/data/categories/` en tiempo de ejecución. Los resultados de las partidas no se almacenan en el servidor; el mejor puntaje se guarda en las preferencias del usuario de OpenStreetMap a través del cliente.

## Desarrollo

### Compilación

```bash
# Compilar TypeScript
npm run build
```

### Ejecución en Desarrollo

```bash
npm run dev
```

## Despliegue

1. Compilar el proyecto:
```bash
npm run build
```

2. Configurar la variable de entorno `PORT` si es necesario para producción.

3. Iniciar el servidor:
```bash
npm start
```

## Troubleshooting

### Problemas Comunes

1. **Errores de CORS**
   - Verifica la configuración de CORS en `src/index.ts`.
   - Asegúrate de que las URLs del cliente estén permitidas si es necesario.

2. **Errores de TypeScript o al cargar datos JSON**
   - Ejecuta `npm run build` para ver errores de tipo.
   - Verifica las definiciones de tipos en `src/types/`.
   - Asegúrate de que los archivos JSON en `src/data/categories/` sean válidos y tengan la estructura esperada (definida en `src/types/index.ts`).

## Seguridad

- Considera añadir validación de entrada más robusta (ej. con `express-validator`) para los payloads de la API.
- Las variables sensibles (si las hubiera en el futuro, como claves de API externas) deberían gestionarse adecuadamente y no incluirse en el repositorio. 