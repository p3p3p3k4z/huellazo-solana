# Guía de Instalación y Configuración

Esta guía te ayudará a poner en marcha el entorno de desarrollo de Huellazo en tu máquina local.

## Prerrequisitos

Asegúrate de tener instalados los siguientes componentes:
- **Node.js** (versión 18 o superior) y **npm** / **yarn** / **pnpm**.
- **Rust** y **Cargo** (para compilación local de smart contracts, si aplica).
- **Solana CLI** (para interactuar con la devnet y manejar wallets locales).
- **Anchor CLI** (versión compatible con el proyecto, ej. `0.29.0`).
- Una billetera de Solana compatible (como Phantom o Solflare) configurada en la red **Devnet**.

## Configuración del Backend (Smart Contracts)

El código del programa reside en la carpeta `/backend`.

1. **Instalación de dependencias**:
   Navega al directorio `backend` y corre:
   ```bash
   cd backend
   yarn install
   ```

2. **Compilar el programa**:
   Puedes usar Anchor para compilar (si estás desarrollando localmente y no en Solana Playground):
   ```bash
   anchor build
   ```

3. **Desplegar el programa**:
   Asegúrate de tener configurado Solana en `devnet`:
   ```bash
   solana config set --url devnet
   anchor deploy
   ```
   *Nota: Recuerda actualizar el Program ID en el código fuente (`lib.rs` y `Anchor.toml`) y en el Frontend si el ID cambia durante el despliegue.*

## Configuración del Frontend (Huellazo App)

El código del cliente web reside en la carpeta `/huellazo-app`.

1. **Instalación de dependencias**:
   ```bash
   cd huellazo-app
   npm install
   ```

2. **Generación del Cliente (Codama)**:
   Si has modificado el smart contract, debes copiar el nuevo `idl.json` y volver a generar los clientes TypeScript de Codama:
   ```bash
   npm run codama:js
   ```

3. **Ejecutar en Entorno de Desarrollo**:
   ```bash
   npm run dev
   ```
   Esto iniciará Vite, y la dApp estará disponible (usualmente en `http://localhost:5173`).

## Buenas Prácticas y Contribución

- **Commits:** Mantén un formato claro en los mensajes de commit.
- **Formateo:** El frontend usa Prettier y ESLint. Ejecuta el formateo antes de hacer PR.
- **Red:** Todas las pruebas y desarrollos principales se realizan actualmente sobre **Solana Devnet**.
