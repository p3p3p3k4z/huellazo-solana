# Documentación del Frontend (Huellazo App)

El Frontend de Huellazo está construido para ofrecer una experiencia fluida (fricción cero) al usuario final, combinando una interfaz web moderna y capacidades de dApp de Solana.

## Stack Tecnológico

- **Framework**: React 18+ y Vite.
- **Estilos**: Tailwind CSS.
- **Web3 / Solana**: 
  - `@solana/web3.js` para conexión nativa.
  - SDK autogenerado con **Codama** (ubicado típicamente en `src/generated/`).
- **Navegación / Vistas**: Integrado para gestionar diferentes pantallas de la gamificación.

## Estructura de Directorios (`/huellazo-app/src`)

- `components/`: Componentes reutilizables de UI. Destaca el subdirectorio `Map/` donde se ubica el `GameCanvas.tsx` para el mapa interactivo 2D de turismo.
- `views/`: Vistas completas de la aplicación:
  - `ProfileView.tsx`: Muestra la información del usuario y su pasaporte NFT dinámico.
  - `RewardsView.tsx`: Visualización de puntos eco y opciones de recompensas.
  - `BadgesView.tsx`: Muestra los "Eco-Sellos" o insignias ganadas por el usuario.
- `hooks/`: Contiene lógica reutilizable.
  - `useHuellazoWeb3.ts` (o similares): Gestiona la conexión de la wallet y envuelve las llamadas al SDK de Codama.
  - `useGameEngine.ts`: Gestiona la lógica principal y el estado del mapa 2D del canvas.
- `generated/`: Código TypeScript autogenerado a partir del IDL de Anchor usando la herramienta Codama.

## Principios de Desarrollo

1. **Gestión de Estado de Web3**: Las llamadas a la red de Solana se abstraen en hooks personalizados. Asegúrate de manejar los estados de carga y error (especialmente cuando el usuario rechaza una transacción).
2. **Generación con Codama**: Cualquier cambio en el smart contract (backend) implica generar un nuevo `idl.json`. Este archivo debe usarse para regenerar el cliente usando `npm run codama:js`.
3. **Mapas y Canvas**: Para la gamificación, el frontend utiliza un elemento de Canvas manejado por React. Las optimizaciones de rendimiento son clave al dibujar los *sprites* y manejar eventos de interacción en `GameCanvas.tsx`.
