# Referencia del Smart Contract (API On-Chain)

Este documento detalla las instrucciones disponibles en el Smart Contract de **Huellazo** y las estructuras de datos (Cuentas/PDAs) que se almacenan en la blockchain de Solana. Los desarrolladores del frontend y móvil usarán el SDK de Codama para interactuar con estas funciones.

> **⚠️ Importante (Fase de Prototipo):** Todo el contenido de este documento está sujeto a cambios. Las instrucciones y cuentas actuales son la base inicial del proyecto. Constantemente se estarán añadiendo nuevas mecánicas, variables de estado y reglas de negocio al contrato según surjan nuevas ideas para potenciar el proyecto.

## 📦 Estructuras de Datos (Cuentas)

El contrato gestiona 3 tipos principales de cuentas:

### 1. `GlobalConfig`
Almacena la configuración global del protocolo.
- `admin` (PublicKey): Billetera con permisos de administrador.
- `totalUsers` (u64): Contador total de usuarios registrados en la plataforma.

### 2. `Passport`
El "Pasaporte NFT" dinámico de cada turista. Se deriva como una PDA ligada a su billetera.
- `owner` (PublicKey): Dueño del pasaporte.
- `level` (u8): Nivel actual (Ej: 1=Bronce, 2=Plata, 3=Oro).
- `experience` (u64): Puntos de experiencia (XP) acumulados.
- `fidelityPoints` (u64): Puntos Eco canjeables (futuro `$HUELLA`).
- `ecoFlags` (u8): Registro optimizado (bitwise) de los "Eco-Sellos" ganados (ej. Cero Plástico, Reciclaje).
- `bump` (u8): Semilla criptográfica de la PDA.

### 3. `Merchant`
Datos del comercio registrado y validado en el ecosistema.
- `authority` (PublicKey): Wallet del dueño del comercio, única con permiso para otorgar puntos.
- `name` (String): Nombre del negocio.
- `tier` (u8): Nivel o categoría del comercio.
- `isActive` (bool): Estado del comercio.

---

## ⚡ Instrucciones (Métodos RPC)

Los métodos que puedes llamar usando el cliente generado por Codama:

### `initializeConfig`
- **Descripción**: Inicializa el estado global del protocolo.
- **Requiere Firma**: `admin`.

### `initializePassport`
- **Descripción**: Crea un nuevo Pasaporte NFT para el turista (usuario final). Se debe pagar la renta inicial.
- **Requiere Firma**: `user`.

### `registerMerchant`
- **Descripción**: Registra un nuevo comercio en la red. Únicamente puede ser llamado por el administrador para evitar que actores maliciosos se registren y otorguen puntos falsos.
- **Argumentos**: `name` (String), `tier` (u8).
- **Requiere Firma**: `admin`.

### `recordVisit`
- **Descripción**: Instrucción core del juego. Permite a un comercio validar la visita o compra de un usuario, otorgándole experiencia y Puntos Eco.
- **Argumentos**: `xp` (u64), `points` (u64).
- **Requiere Firma**: `authority` (La wallet dueña del `Merchant`). El usuario solo recibe el estado pasivamente en su `Passport`.

### `validateEcoAction`
- **Descripción**: Modifica la variable `ecoFlags` (usando operaciones a nivel de bits) en el pasaporte del turista cuando éste cumple una meta ecológica específica en el negocio (ej. usar termo propio).
- **Argumentos**: `actionId` (u8) - El bit específico a activar.
- **Requiere Firma**: `authority` (La wallet dueña del `Merchant`).

### `updateMerchant`
- **Descripción**: Permite a un comercio editar su nombre o activar/desactivar temporalmente su cuenta.
- **Argumentos**: Opcionales para `name` y `active`.
- **Requiere Firma**: `authority`.

### `closePassport`
- **Descripción**: Elimina de forma segura la cuenta del pasaporte del usuario, devolviéndole la totalidad del SOL que dejó en depósito (renta) a su billetera principal.
- **Requiere Firma**: `user`.
