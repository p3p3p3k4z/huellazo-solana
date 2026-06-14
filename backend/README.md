# Huellazo - Backend (Smart Contract Solana + Anchor)

## Vision General

Huellazo es un protocolo descentralizado construido sobre Solana que gamifica el turismo sostenible. Los turistas acumulan experiencia (XP) y puntos de fidelidad al visitar comercios registrados, suben de nivel (Bronce -> Plata -> Oro) y certifican acciones ecologicas directamente en la blockchain. Todo el estado del protocolo se almacena en cuentas PDA (Program Derived Addresses) gobernadas por un unico smart contract escrito en Rust con el framework Anchor.

---

## Estructura del Proyecto

```
backend/
  Anchor.toml                # Configuracion del workspace Anchor (cluster, wallet, scripts)
  Cargo.toml                 # Workspace Rust (raiz que agrupa los programas)
  idl.json                   # IDL generado (Interfaz del contrato en JSON)
  program-keypair.json       # Keypair del programa desplegado
  tsconfig.json              # Configuracion de TypeScript para tests/cliente
  migrations/
    deploy.ts                # Script de despliegue (inyecta provider desde Anchor.toml)
  programs/
    huellazo/
      Cargo.toml             # Dependencias Rust del programa (anchor-lang 0.29.0)
      Xargo.toml             # Configuracion cross-compilation para Solana
      src/
        lib.rs               # *** LOGICA PRINCIPAL DEL SMART CONTRACT ***
  client/
    client.ts                # Cliente TypeScript para interactuar con el contrato
    test_cliente.ts          # Simulacion integral del flujo completo
  tests/
    anchor.ts                # Suite de tests unitarios con Mocha/Anchor
```

---

## Archivos Relevantes y sus Responsabilidades

### 1. `programs/huellazo/src/lib.rs` - El Smart Contract

Archivo principal del programa on-chain. Escrito en Rust con Anchor 0.29.0. Define toda la logica de negocio, las cuentas y las validaciones.

**ID del Programa en Solana:** `CB2sVYQ48i3rTdM51zKxipweoFpxEEmJVC1NgxLeT5Xj`

#### Estructuras de Datos (Cuentas On-Chain)

- **`GlobalConfig`** - Configuracion global del protocolo. PDA unica con semilla `"config"`.
  - `admin` (Pubkey) - Wallet del administrador con permisos especiales.
  - `total_users` (u64) - Contador de turistas registrados.

- **`Passport`** - Pasaporte del turista. PDA derivada con semillas `["passport", user_pubkey]`.
  - `owner` (Pubkey) - Dueno del pasaporte.
  - `level` (u8) - Nivel actual: 1 = Bronce, 2 = Plata, 3 = Oro.
  - `experience` (u64) - Puntos de experiencia acumulados.
  - `fidelity_points` (u64) - Puntos de fidelidad (futuro token `$HUELLA`).
  - `eco_flags` (u8) - Registro de sellos ecologicos mediante operaciones bitwise.
  - `bump` (u8) - Semilla criptografica de la PDA.

- **`Merchant`** - Comercio registrado. PDA derivada con semillas `["merchant", authority_pubkey]`.
  - `authority` (Pubkey) - Wallet duena del comercio.
  - `name` (String) - Nombre del comercio (max 30 caracteres aprox).
  - `tier` (u8) - Categoria del comercio.
  - `is_active` (bool) - Si el comercio esta activo para otorgar puntos.

#### Instrucciones (Metodos del Contrato)

| Metodo | Tipo | Descripcion | Firmante | Argumentos |
|--------|------|-------------|----------|------------|
| `initialize_config` | CREATE | Inicializa la configuracion global del protocolo. Solo se ejecuta una vez. | admin | - |
| `initialize_passport` | CREATE | Crea un pasaporte para el turista. Incrementa `total_users` en GlobalConfig. | user | - |
| `register_merchant` | CREATE | Registra un nuevo comercio en el ecosistema. Valida que solo el admin pueda hacerlo. | admin | `name: String`, `tier: u8` |
| `record_visit` | UPDATE | Acumula XP y puntos en el pasaporte del turista. Sube de nivel automaticamente al alcanzar umbrales (1000 XP -> Plata, 5000 XP -> Oro). | authority (comercio) | `xp: u64`, `points: u64` |
| `validate_eco_action` | UPDATE | Activa un sello ecologico mediante operacion bitwise (`eco_flags |= 1 << action_id`). Solo comercios Tier 2. | authority (comercio) | `action_id: u8` |
| `update_merchant` | UPDATE | Permite al dueno del comercio modificar su nombre y/o estado de actividad. | authority (comercio) | `name: Option<String>`, `active: Option<bool>` |
| `close_passport` | DELETE | Cierra el pasaporte y devuelve el SOL de la renta al usuario. Anchor maneja el cierre automaticamente con `close = user`. | user | - |

#### Sistema de Niveles (Logica de Negocio)

El nivel del pasaporte se actualiza automaticamente en `record_visit` segun estos umbrales:
- **Bronce (Nivel 1):** 0 - 999 XP
- **Plata (Nivel 2):** 1000 - 4999 XP
- **Oro (Nivel 3):** 5000+ XP

#### Eco-Flags (Sistema de Sellos Ecologicos)

`eco_flags` es un unico byte donde cada bit representa una accion ecologica diferente:

| Bit | Accion |
|-----|--------|
| 0 | Sin plasticos de un solo uso |
| 1 | Transporte ecologico |
| 2 | Reciclaje |
| 3 | Uso de termo propio |
| 4-7 | Futuras acciones |

Las validaciones usan andamiaje (`#[account(...)]`) de Anchor:
- `RegisterMerchant` requiere que el admin firmante coincida con el `admin` de `GlobalConfig` (`has_one = admin`).
- `RecordVisit` requiere que el comercio este activo (`merchant.is_active == true`).
- `ValidateEcoAction` solo permite comercios Tier 2 (`merchant.tier == 2`).

---

### 2. `client/client.ts` - Cliente de Interaccion exporta `getHuellazoClient`

Cliente TypeScript listo para integrarse en cualquier frontend o servicio. Exporta una funcion `getHuellazoClient(program)` que devuelve un objeto con metodos para interactuar con el contrato.

**Helpers de derivacion de direcciones (funciones puras, no requieren RPC):**
- `getConfigAddress()` - Deriva la PDA de configuracion global.
- `getPassportAddress(userWallet)` - Deriva la PDA del pasaporte de un turista.
- `getMerchantAddress(merchantAuthority)` - Deriva la PDA de un comercio.

**Metodos del cliente:**

| Metodo | Descripcion |
|--------|-------------|
| `fetchPassport(userWallet)` | Lee los datos del pasaporte de un turista desde la blockchain. Devuelve null si no existe. |
| `fetchGlobalConfig()` | Lee la configuracion global del protocolo. |
| `initializePassport(userWallet)` | Envia transaccion para crear un pasaporte. |
| `recordVisit(userWallet, merchantAuthority, xp, points)` | Envia transaccion para registrar una visita (XP + puntos). |
| `validateEcoAction(userWallet, merchantAuthority, actionId)` | Envia transaccion para certificar una accion ecologica. |
| `closePassport(userWallet)` | Envia transaccion para cerrar el pasaporte y recuperar el SOL. |

---

### 3. `client/test_cliente.ts` - Simulacion Integral

Script de simulacion que ejecuta el flujo completo del protocolo:

1. Configura el protocolo (`initializeConfig`).
2. Fondea wallets de prueba (hotel + turista) desde el admin.
3. Registra un comercio tipo hotel (`registerMerchant`).
4. Actualiza el nombre del comercio (`updateMerchant`).
5. Crea un pasaporte para el turista (`initializePassport`).
6. Registra una visita con 2500 XP y 500 puntos (`recordVisit`).
7. Certifica una accion ecologica (`validateEcoAction`).
8. Verifica todos los datos on-chain.
9. Cierra el pasaporte y recupera el SOL (`closePassport`).

**Ejecucion:**
```bash
anchor run client
```

---

### 4. `tests/anchor.ts` - Suite de Tests Unitarios

Tests automatizados con Mocha que validan cada instruccion del contrato de forma aislada. Usa el patron Arrange-Act-Assert.

**Escenarios cubiertos:**

| Test | Descripcion |
|------|-------------|
| 1. SETUP - Inicializa el protocolo | Ejecuta `initializeConfig` y verifica que `totalUsers` sea 0. |
| 2. CREATE - El turista obtiene su Pasaporte | Fondea la wallet del turista, crea el pasaporte y verifica nivel inicial 1 (Bronce). |
| 3. CREATE - Registro de Comercio | Registra un comercio y verifica su nombre. |
| 4. UPDATE - El Huellazo (XP + Subida de Nivel) | Otorga 1200 XP y verifica la subida a nivel 2 (Plata). |
| 5. UPDATE - Accion Sustentable | Activa un sello ecologico y verifica que `ecoFlags` se actualice. |
| 6. DELETE - Cierre de cuenta | Cierra el pasaporte y verifica que los fondos se devuelvan. |

**Ejecucion:**
```bash
anchor test
```

---

### 5. `migrations/deploy.ts` - Script de Despliegue

Script boilerplate que Anchor invoca durante el despliegue. Actualmente es un placeholder que recibe el provider desde `Anchor.toml`. Se puede extender para ejecutar migraciones de datos on-chain.

---

### 6. Archivos de Configuracion

#### `Anchor.toml`
- **Cluster:** Localnet (desarrollo local)
- **Wallet:** `~/.config/solana/id.json`
- **Program ID:** `CB2sVYQ48i3rTdM51zKxipweoFpxEEmJVC1NgxLeT5Xj`
- **Scripts:**
  - `test`: Ejecuta la suite de tests con `ts-mocha`.
  - `client`: Ejecuta el script de simulacion con `ts-node`.

#### `programs/huellazo/Cargo.toml`
- Dependencia unica: `anchor-lang = "0.29.0"`
- Compilacion como `cdylib` (biblioteca compartida para Solana).

#### `Cargo.toml` (raiz del workspace)
- Define el workspace con `members = ["programs/*"]`.
- Optimizaciones para release: overflow-checks, LTO fat, codegen-units=1.

---

## Flujo de Datos (Ejemplo Completo)

```
1. Admin ejecuta initializeConfig()
   -> Crea cuenta GlobalConfig con admin=adminPubkey, totalUsers=0

2. Turista ejecuta initializePassport()
   -> Crea cuenta Passport: owner=turista, level=1, xp=0, points=0, ecoFlags=0
   -> GlobalConfig.totalUsers += 1

3. Admin ejecuta registerMerchant("Eco-Hotel", tier=2)
   -> Crea cuenta Merchant: authority=hotel, name="Eco-Hotel", tier=2, isActive=true

4. Comercio ejecuta recordVisit(turista_pubkey, xp=1200, points=50)
   -> Passport.experience += 1200
   -> Passport.fidelity_points += 50
   -> Como xp >= 1000, passport.level = 2 (Plata)

5. Comercio ejecuta validateEcoAction(turista_pubkey, actionId=0)
   -> Passport.eco_flags |= 1 << 0  (activa bit 0)

6. Turista ejecuta closePassport()
   -> Anchor cierra la cuenta y transfiere la renta al turista
```

---

## Comandos Utiles

```bash
# Compilar el programa
anchor build

# Ejecutar tests
anchor test

# Ejecutar simulacion cliente
anchor run client

# Desplegar en localnet
anchor deploy

# Obtener IDL actualizado
anchor idl parse -f programs/huellazo/src/lib.rs -o idl.json
```

---

## Notas Tecnicas

- **PDAs:** Todas las cuentas se derivan como PDA usando `findProgramAddressSync`. Las semillas deben coincidir exactamente entre Rust y TypeScript.
- **Rent (Renta):** En Solana, crear una cuenta requiere un deposito de SOL (renta). Al cerrar el pasaporte con `close = user`, Anchor devuelve automaticamente ese SOL.
- **Commitment:** Los tests usan `commitment: "confirmed"` para evitar errores de lectura antes de que la transaccion se finalice.
- **Seguridad:** Solo el admin puede registrar comercios. Solo la autoridad del comercio puede otorgar puntos. Solo comercios Tier 2 pueden validar acciones ecologicas.
- **Espacio de cuentas:** Los tamanos de cuenta se calculan manualmente en los contextos de Anchor (`space = 8 + ...`). El `8` inicial corresponde al discriminador de Anchor.
