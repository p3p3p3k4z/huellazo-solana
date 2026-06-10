# Documentación del Backend (Smart Contracts)

El núcleo descentralizado de Huellazo se basa en programas (Smart Contracts) desarrollados sobre la red de Solana, utilizando el framework **Anchor** para Rust.

> **⚠️ Nota de Prototipo:**
> Actualmente, la arquitectura del Smart Contract y las reglas de negocio on-chain se encuentran en fase de **prototipo iterativo**. Esto significa que las instrucciones, modelos de datos y lógicas aquí descritas **no son definitivas**. A medida que el proyecto crezca y surjan nuevas ideas o mecánicas para el ecosistema, los contratos sufrirán constantes refactorizaciones, adiciones de funciones y actualizaciones de esquemas.

## Arquitectura del Programa (Anchor/Rust)

Ubicado en el directorio `/backend`, este espacio contiene toda la lógica on-chain para gestionar a los turistas y los comercios.

### Características Clave Implementadas

1. **Pasaporte NFT Dinámico**
   - El estado de la cuenta del usuario guarda la experiencia y el nivel (Bronce, Plata, Oro).
   - Se actualiza dinámicamente según el usuario visita comercios y gana Puntos Eco.

2. **Optimización de Costos y Almacenamiento (Bitwise)**
   - El modelo de datos está optimizado para minimizar el pago de la renta en Solana.
   - Los "Eco-Sellos" (insignias como "Cero Plásticos") se almacenan usando operaciones bit a bit sobre un tipo de dato reducido (`u8`).

3. **Restricciones (Constraints) de Seguridad**
   - Se utilizan de forma exhaustiva las macros de Anchor (`#[account(...)]`) para asegurar que solo los comercios validados pueden otorgar puntos y sellos a los usuarios.
   - Verificación de signers (firmantes) para garantizar que las operaciones están autorizadas por el usuario.

### Estructura de Archivos Principal

- `programs/huellazo/src/lib.rs`: Contiene las instrucciones del programa de Solana (inicialización, ganar puntos, evolucionar nivel, etc.).
- `programs/huellazo/src/state.rs` o `state/`: Modelos de las cuentas almacenadas en la blockchain (PDAs).
- `tests/`: 
  - Pruebas E2E robustas escritas en TypeScript/Mocha para validar el ciclo de vida del usuario, interacciones on-chain y manejo de PDAs.
  - Ejemplos: `anchor.test.ts`

### Flujo de Desarrollo del Contract

1. Escribir o modificar instrucciones en `lib.rs`.
2. Compilar con `anchor build`.
3. Esto generará o actualizará el archivo `target/idl/huellazo.json` (IDL).
4. Ejecutar los tests con `anchor test`.
5. Si el contrato está listo, desplegar con `anchor deploy` a Devnet y sincronizar el nuevo IDL con el Frontend (vía Codama).
