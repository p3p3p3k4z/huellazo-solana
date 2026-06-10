# Análisis de Migración a React Native (Mobile)

Este documento evalúa la viabilidad de migrar el prototipo web de Huellazo (React + Vite) a una aplicación móvil nativa utilizando **React Native**, con un enfoque particular en la integración con wallets de Solana (como Phantom) en entornos móviles.

## 1. Viabilidad General: Alta 🟢

Migrar a React Native es **altamente viable y es el camino recomendado** para un proyecto turístico como Huellazo, donde los usuarios interactuarán con la app mientras caminan por la ciudad. 

Solana tiene un ecosistema muy maduro para el desarrollo móvil gracias al **Solana Mobile Stack (SMS)**.

## 2. Gestión de Wallets en Móviles (Phantom y otras)

La forma en la que las wallets funcionan en móviles es radicalmente distinta a la web:
- **En la Web**: Se inyecta un objeto global (ej. `window.solana`) a través de la extensión del navegador.
- **En React Native**: Se utiliza el **Mobile Wallet Adapter (MWA)**. 
  - **Android**: Funciona mediante *Intents* del sistema operativo. Tu app solicita una firma, Android abre la app de Phantom instalada en el teléfono, el usuario firma con su huella digital/PIN, y Android devuelve el control a tu app.
  - **iOS**: Utiliza *Universal Links*.
- **Soporte de Wallets**: El MWA es un estándar. Si integras el `@solana-mobile/mobile-wallet-adapter-protocol`, soportarás automáticamente Phantom, Solflare, Backpack y cualquier otra wallet que siga el estándar móvil. No necesitas integrar cada una por separado.

## 3. ¿Qué código se puede reciclar del Prototipo Web?

**Lo que SÍ puedes reutilizar (Lógica de Negocio):**
- Todo el código autogenerado por **Codama** (`src/generated`).
- El IDL de Anchor.
- La lógica de conexión RPC de Solana (`@solana/web3.js` funciona perfectamente en React Native gracias a polyfills o en sus versiones recientes).
- Hooks personalizados de estado global o fetch.

**Lo que NO puedes reutilizar (Interfaz Gráfica):**
- Etiquetas HTML (`<div>`, `<span>`, `<canvas>`). Debes cambiarlas por componentes nativos (`<View>`, `<Text>`).
- **El Mapa Interactivo (GameCanvas)**: El `<canvas>` HTML5 no existe en React Native de la misma forma. Tendrás que migrar este componente a librerías nativas como **React Native Skia** (altamente recomendada para gráficos 2D fluidos y gamificación) o usar una Webview (menos recomendado por rendimiento).
- Tailwind CSS: Aunque existen librerías como `NativeWind` que emulan Tailwind en RN, la estructura de estilos es fundamentalmente diferente (Flexbox de Yoga).

## 4. Recomendaciones Técnicas para la Migración

1. **Usa Expo con Custom Dev Clients**:
   No uses React Native CLI tradicional a menos que sea estrictamente necesario. Usa **Expo**. Sin embargo, como el Mobile Wallet Adapter requiere código nativo (Kotlin/Swift), no podrás usar "Expo Go". Deberás compilar clientes de desarrollo personalizados usando **EAS Build** (`npx expo run:android`).

2. **Cuidado con los Polyfills de Criptografía**:
   `@solana/web3.js` en sus versiones antiguas requería polyfills para funciones de criptografía (`crypto`, `Buffer`) en React Native. Si usas el nuevo cliente experimental de Solana o configuras correctamente Expo, esto es más sencillo, pero es un punto crítico a tener en cuenta al configurar el proyecto.

3. **Arquitectura Monorepo (Estrategia de Código Compartido)**:
   Si planeas mantener la versión Web y construir la versión Móvil en paralelo sin duplicar código, te recomiendo encarecidamente utilizar un **Monorepo** (por ejemplo, con **Turborepo** o **Yarn Workspaces**). 
   
   La estructura sugerida sería:
   
   ```text
   huellazo-solana/
   ├── backend/                      # Smart Contracts en Rust / Anchor
   ├── packages/                     # Código compartido (Librerías locales)
   │   ├── solana-client/            # Cliente de Solana
   │   │   ├── src/generated/        # SDK autogenerado por Codama
   │   │   ├── idl/                  # idl.json
   │   │   └── package.json          
   │   └── shared-hooks/             # (Opcional) Hooks de React reutilizables (ej. useHuellazoWeb3)
   │
   └── apps/                         # Aplicaciones consumibles
       ├── web/                      # Tu proyecto actual (React + Vite)
       │   ├── src/                  
       │   │   ├── components/       # Componentes HTML/CSS (GameCanvas, etc)
       │   │   └── views/            
       │   └── package.json          # Depende de "@huellazo/solana-client"
       │
       └── mobile/                   # Nuevo proyecto React Native (Expo)
           ├── src/
           │   ├── components/       # Componentes nativos (View, Text, RN Skia)
           │   └── screens/          
           └── package.json          # Depende de "@huellazo/solana-client"
   ```

   *Beneficio*: Cuando actualices tu Smart Contract (Backend en Rust), solo tendrás que correr `codama` una vez en tu paquete compartido (`packages/solana-client`), y **ambas aplicaciones (Web y Móvil) recibirán la actualización inmediatamente**, evitando bugs de desincronización y reduciendo el mantenimiento a la mitad.

## 5. Alternativa Rápida (PWA)

Dado que actualmente es un prototipo, antes de hacer una migración completa a React Native, podrías convertir la web actual en una **Progressive Web App (PWA)**. 
- **Ventaja**: El usuario puede "instalarla" en su pantalla de inicio desde el navegador. 
- **Desventaja**: En iOS, las PWAs tienen restricciones para interactuar fluidamente con la app de Phantom debido a las políticas de Apple sobre deeplinking en PWAs. En Android funciona mejor.
