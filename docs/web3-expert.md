# Detalles Técnicos para Expertos Web3 y Blockchain

Este documento está dirigido a desarrolladores con experiencia en Web3 y Solana que deseen comprender a fondo las decisiones arquitectónicas del protocolo, la gestión de estado *on-chain* y cómo Huellazo interactúa con la blockchain.

## 1. Gestión de Cuentas y Estado (PDAs)

Huellazo abandona los modelos tradicionales de bases de datos centralizadas en favor del almacenamiento de estado directamente en la blockchain, haciendo un uso extensivo de **Program Derived Addresses (PDAs)**. 

- **Pasaporte NFT (User State PDA)**: En lugar de crear un NFT estándar (SPL Token) que podría implicar costos de acuñación más altos y fragmentación, el "Pasaporte" se almacena como el estado de una PDA derivada de la `pubkey` de la wallet del usuario y de una semilla (seed) constante. Esto permite actualizaciones de estado constantes y económicas (como sumar "Puntos Eco").
- **Comercios y Negocios**: Se gestionan también mediante PDAs, lo cual permite tener un control de acceso centralizado sin que las cuentas dependan de las claves privadas del frontend.

## 2. Optimización de Rent (Alquiler de Cuentas)

Solana cobra una tasa ("rent") por mantener datos vivos en la red. Dado que la escalabilidad a miles de turistas es vital, la estructura de las cuentas (estructuras en Rust) está fuertemente empaquetada:
- **Bitwise / Banderas Booleanas**: En vez de almacenar un arreglo (array) de IDs de "Eco-Sellos" o un vector (que aumentaría considerablemente los bytes requeridos), se utiliza un solo byte (`u8`). Los distintos sellos adquiridos por el usuario (ej. Cero Plásticos, Comercio Justo) se registran activando bits específicos dentro de ese `u8` a través de operaciones a nivel de bits (*bitwise*). Esto minimiza el tamaño en bytes de la PDA del usuario, reduciendo el costo del depósito de rent de forma drástica.

## 3. Seguridad del Smart Contract (Anchor Constraints)

El proyecto utiliza el framework **Anchor** para asegurar la fiabilidad matemática del Smart Contract:
- **Validación Estricta de Signers**: Se utilizan las macros `#[account(mut, has_one = authority)]` y `Signer<'info>` para validar que solo las entidades correctas puedan modificar saldos (por ejemplo, evitar que un usuario manipule sus puntos de forma arbitraria).
- **Semillas de PDA protegidas**: Las semillas (`seeds`) están restringidas en el IDL y validadas mediante el contexto de Anchor (`#[account(seeds = [b"user", user.key().as_ref()], bump)]`). Esto garantiza que los clientes Web3 interactúen de forma predecible sin colisiones de memoria.
- **Recuperación de SOL**: El protocolo implementa instrucciones seguras de cierre de cuenta (`close = authority`), garantizando que cuando un usuario deba destruir su pasaporte, recupere la cantidad de SOL depositada para la renta.

## 4. Integración Frontend y Codama

Para la interacción asíncrona entre la dApp (React/Vite) y el nodo RPC, el proyecto utiliza el enfoque más moderno del ecosistema:
- **Codama (antes Kinobi)**: En lugar de usar métodos RPC en crudo y serialización manual de Borsh en el cliente, el archivo `idl.json` se procesa a través de Codama, generándose un cliente fuertemente tipado en TypeScript. 
- **Conexión de Wallets**: El stack del cliente favorece `@solana/wallet-adapter` junto a conectores estándar, lo que permite que el GameCanvas orqueste firmas de transacciones transparentemente, minimizando la "fricción" del usuario tradicional para interactuar con la blockchain.

## 5. Escalabilidad Hacia Solana Blinks y Actions

Huellazo no se queda únicamente en la experiencia de dApp en el navegador. La lógica y los programas de Anchor están diseñados para ser consumibles a futuro a través de **Solana Actions** y **Blinks**.
- Esto permitirá, por ejemplo, que los turistas adquieran paquetes de servicios turísticos o validen sellos de un comercio directamente interactuando con un enlace URL en redes sociales (como X), sin salir de la plataforma y firmando transacciones on-chain instantáneas.

## 6. Por Qué Solana

- **Finalidad Rápida y Costos Bajos**: Un punto de fricción típico en Web3 (el costo de gas) se reduce a fracciones de centavo, haciendo factibles las microtransacciones (ganar unos pocos puntos en un café local).
- **Ejecución Paralela (Sealevel)**: La arquitectura de Huellazo, basada en PDAs separadas por usuario y comercio, permite que miles de turistas interactúen con comercios y sumen puntos de forma completamente paralela sin congestionar un único estado global.
