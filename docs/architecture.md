# Huellazo - Arquitectura General

El proyecto **Huellazo** está diseñado utilizando una arquitectura moderna de dApp (Aplicación Descentralizada) en la blockchain de Solana. El objetivo de la plataforma es incentivar la economía circular y la gamificación para turistas.

## Componentes Principales

La arquitectura consta de tres piezas fundamentales:

1. **Frontend (App Web / Híbrida)**
   - Creado con **React**, **Vite** y **Tailwind CSS**.
   - Integración directa con Solana a través de `@solana/web3.js` y clientes autogenerados con **Codama**.
   - Incorpora un mapa interactivo (renderizado en un `GameCanvas`).

2. **Backend (Smart Contracts / Programas de Solana)**
   - Escrito en **Rust** usando el framework **Anchor**.
   - Gestiona el estado y la lógica de negocio *on-chain*, como la emisión de insignias (Eco-Sellos) y el pasaporte NFT dinámico del usuario.
   - Contiene mecanismos de optimización de costos, como el uso de variables `u8` para almacenamiento *bitwise* de sellos.

3. **Conexión Blockchain (Codama / IDL)**
   - La comunicación entre el frontend y el backend está fuertemente tipada.
   - El IDL (`idl.json`) generado en Anchor se procesa a través de **Codama** en el frontend (`npm run codama:js`) para generar un SDK de cliente robusto.

## Flujo de Trabajo y Datos

1. **Interacción del Usuario**: El usuario interactúa con la interfaz (mapa, vista de perfil, vista de recompensas) desde su navegador móvil o de escritorio.
2. **Conexión de Wallet**: La wallet del usuario firma transacciones para verificar su identidad y crear su "Pasaporte NFT" on-chain.
3. **Smart Contract (Backend)**: El programa de Solana valida la transacción, actualiza los *Puntos Eco* o nivel (Bronce, Plata, Oro), y guarda los datos on-chain de forma inmutable.
4. **Respuesta Visual**: El frontend escucha los cambios en las cuentas de Solana y actualiza el mapa o el perfil del usuario en tiempo real.
