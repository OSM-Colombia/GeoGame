# GeoGame Client

Frontend del juego GeoGame desarrollado con React y TypeScript.

## Requisitos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)

## Instalación

```bash
# Estando en el directorio client/
# Instalar dependencias
npm install
```
Nota: Si encuentras conflictos de dependencias (especialmente con TypeScript) durante la instalación, puedes intentar usar la opción `--legacy-peer-deps`:
`npm install --legacy-peer-deps`

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm start`

Ejecuta la aplicación en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

### `npm test`

Ejecuta los tests en modo interactivo.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.\
Optimiza la build para mejor rendimiento.

### `npm run eject`

**Nota: esta es una operación unidireccional. Una vez que ejecutes `eject`, no podrás volver atrás.**

Si no estás satisfecho con la herramienta de build y las configuraciones, puedes "eject" en cualquier momento.

## Estructura del Proyecto

```
src/
  ├── components/     # Componentes React
  ├── services/       # Servicios (ej. osmAuth.ts para la autenticación con OSM)
  ├── store/          # Estado global (Redux Toolkit)
  ├── styles/         # Archivos CSS y de estilo
  ├── types/          # Definiciones de TypeScript
  ├── App.tsx         # Componente principal de la aplicación
  └── index.tsx       # Punto de entrada de React
```

## Tecnologías Principales

- React 19
- TypeScript
- Redux Toolkit para manejo de estado
- Leaflet para mapas interactivos
- Tailwind CSS para estilos

## Desarrollo

El proyecto usa Create React App con TypeScript. Para más información, consulta la [documentación de Create React App](https://facebook.github.io/create-react-app/docs/getting-started).

## Variables de Entorno

El cliente puede configurarse con las siguientes variables de entorno (creando un archivo `.env` en el directorio `client/`):

- `REACT_APP_API_URL`: URL base del backend. Si no se especifica, por defecto se intentará conectar a `http://localhost:5000/api` (o el valor configurado en el código fuente como fallback).

Adicionalmente, para la funcionalidad de guardar el mejor puntaje, las credenciales de OAuth 2.0 de OpenStreetMap deben configurarse directamente en el archivo `src/services/osmAuth.ts`, como se detalla en el README principal del proyecto.

## Despliegue

Para desplegar la aplicación:

1. Ejecuta `npm run build`
2. Los archivos estáticos se generarán en la carpeta `build/`
3. Sirve estos archivos con tu servidor web preferido

## Troubleshooting

### Problemas Comunes

1. **Error de íconos de Leaflet**
   - Los íconos de Leaflet están preconfigurados en `src/components/Game.tsx`. Si surgen problemas, verifica que las rutas a las imágenes en `L.Icon.Default.mergeOptions` sean correctas y que los paquetes de Leaflet estén instalados.

2. **Errores de TypeScript**
   - Ejecuta `npm run build` para ver errores de tipo
   - Verifica las definiciones de tipos en `src/types/`

3. **Problemas de CORS**
   - Verifica que el backend esté configurado correctamente
   - Asegúrate de que las URLs de la API sean correctas
