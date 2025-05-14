# GeoGame
Juego de preguntas usando datos de OSM y Wikimedia. Se va a hacer la prueba de hacer el juego usando un documento de requerimientos - SRS bien descrito para que con herramientas de inteligencia artifical escriban el código.

La descripción del SRS está en: https://pad.osm.lat/s/rhptvATer

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm (incluido con Node.js)

Para la funcionalidad de guardar el mejor puntaje, necesitarás registrar una aplicación OAuth 2.0 en OpenStreetMap y configurar las credenciales en el cliente.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- `client/`: Frontend en React/TypeScript
- `server/`: Backend en Node.js/TypeScript

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/GeoGame.git
cd GeoGame
```

2. Instalar dependencias del servidor:
```bash
cd server
npm install
```

3. Instalar dependencias del cliente:
```bash
cd ../client
npm install
```

Nota: Si encuentras conflictos de dependencias (especialmente con TypeScript) durante la instalación, puedes intentar usar la opción `--legacy-peer-deps`:
`npm install --legacy-peer-deps`

## Configuración

### Servidor

El servidor se ejecuta en el puerto 5000 por defecto. Puedes cambiar esto configurando la variable de entorno `PORT` en un archivo `.env` en el directorio `server/`:

```env
PORT=5000
```

### Cliente

Para habilitar el guardado de mejores puntajes en OpenStreetMap, debes configurar tus credenciales de aplicación OAuth 2.0. Registra tu aplicación en [OpenStreetMap OAuth applications](https://www.openstreetmap.org/user/your_username/oauth_clients) (reemplaza `your_username` con tu usuario de OSM).

Luego, edita el archivo `client/src/services/osmAuth.ts` y reemplaza los placeholders `tu_consumer_key` y `tu_consumer_secret` con tus credenciales:

```typescript
// client/src/services/osmAuth.ts
const osmAuthConfig = {
  oauth_consumer_key: 'TU_CONSUMER_KEY_AQUI', // Reemplaza con tu Clave de Consumidor OAuth
  oauth_secret: 'TU_SECRET_AQUI',         // Reemplaza con tu Secreto de Consumidor OAuth
  oauth_url: 'https://www.openstreetmap.org/oauth', // URL de OAuth de OSM (generalmente no cambia)
  // ... otras opciones
};
```
Asegúrate de que la "Redirect URI" configurada en OSM coincida con la URL donde se ejecuta tu aplicación cliente durante el desarrollo y producción (ej. `http://localhost:3000` para desarrollo si usas el modo no `singlepage`).

## Ejecución

### Desarrollo

1. Iniciar el servidor (en una terminal):
```bash
cd server
npm run dev
```
El script `dev` utiliza `ts-node-dev` para reiniciar automáticamente el servidor ante cambios.

2. Iniciar el cliente (en otra terminal):
```bash
cd client
npm start
```

El cliente estará disponible en http://localhost:3000
El servidor estará disponible en http://localhost:5000

### Producción

1. Compilar el cliente:
```bash
cd client
npm run build
```

2. Iniciar el servidor en modo producción:
```bash
cd server
npm run build
npm start
```

## Características

- Juego de preguntas geográficas usando datos de OpenStreetMap.
- Preguntas cargadas desde archivos JSON locales.
- Interfaz interactiva con mapa usando Leaflet.
- Sistema de puntuación por precisión y tiempo.
- Autenticación con OpenStreetMap (OAuth 2.0) para guardar el mejor puntaje del usuario en sus preferencias de OSM.
- Preguntas basadas en ubicaciones reales y geometrías OSM.

## Tecnologías Utilizadas

- Frontend:
  - React
  - TypeScript
  - Redux Toolkit
  - Leaflet
  - Tailwind CSS

- Backend:
  - Node.js
  - Express
  - TypeScript
  - @turf/turf (para operaciones geoespaciales)

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
