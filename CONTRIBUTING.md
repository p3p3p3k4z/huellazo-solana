# Guía de Contribución a Huellazo

¡Bienvenido al proyecto Huellazo! Apreciamos mucho tu interés en colaborar con nuestro ecosistema de turismo Web3. Para mantener un repositorio organizado y un código limpio, te pedimos que sigas estas directrices.

## 🌳 Flujo de Trabajo (Git Flow)

Tenemos un flujo de ramificación estricto para proteger la rama principal:

- **`main`**: El código en producción. Siempre debe ser estable. **NO hacer commits directos aquí**.
- **`dev` / `develop`**: Rama de integración donde se fusionan (merge) las nuevas características antes del despliegue oficial.
- Ramas de características (**Feature branches**):
  - Creación: Deben partir de `dev`.
  - Nomenclatura: Usa prefijos descriptivos.
    - `feature/nombre-de-la-tarea` (Nuevas funcionalidades).
    - `fix/descripcion-del-bug` (Corrección de errores).
    - `docs/nombre-del-documento` (Cambios en la documentación).

## 💻 Estándares de Código y Commits

### Cómo hacer un buen Commit
Utilizamos la convención de **Commits Convencionales** para generar historiales claros y automatizar versiones. Un buen commit no solo dice *qué* cambió, sino *por qué*.

**Estructura del mensaje:**
```text
tipo(contexto): descripción corta en imperativo

[Cuerpo opcional detallando el porqué de los cambios y cómo afecta a otras partes]

[Pie opcional para cerrar issues, ej: Closes #123]
```

**Tipos permitidos:**
- `feat`: Una nueva funcionalidad (ej. nuevo componente en React o instrucción en Rust).
- `fix`: Corrección de un error (bug).
- `docs`: Cambios exclusivos en la documentación.
- `style`: Cambios de formato, espacios, comas faltantes (sin impacto en lógica).
- `refactor`: Refactorización de código que no arregla un bug ni añade una feature.
- `test`: Añadir o corregir pruebas (ej. tests de Anchor).
- `chore`: Tareas de mantenimiento, actualización de dependencias, etc.

**Reglas de Oro:**
1. **Sé atómico:** Un commit debe abarcar un solo cambio lógico. Si arreglas un bug y agregas una vista nueva, divídelo en dos commits distintos.
2. **Usa el imperativo en la descripción corta:** "agregar renderizado" en lugar de "agregado renderizado" o "agrega renderizado" (como si le dieras una orden al repositorio de qué hacer).
3. **Límite de caracteres:** La primera línea no debe superar los 50 caracteres.
4. **Contexto (scope):** Úsalo para indicar qué parte del proyecto se afectó (ej. `feat(smart-contract):...` o `fix(map-canvas):...`).

**Ejemplos Reales:**
- ✅ *BIEN:* `feat(map): agregar renderizado de comercios cercanos en GameCanvas`
- ✅ *BIEN:* `fix(smart-contract): corregir validación de authority en recordVisit`
- ❌ *MAL:* `fix: arregle unas cositas en los archivos de rust y actualice dependencias`

### Formateo y Linting
Todo el proyecto (tanto Web como Backend) cuenta con herramientas de calidad.
- En el frontend (`huellazo-app`), asegúrate de ejecutar `npm run lint` y `npm run format` (Prettier) antes de subir tus cambios.
- En el backend (Rust), ejecuta `cargo clippy` y `cargo fmt` en la carpeta `/backend` para mantener las convenciones de Rust.

## 🚀 Cómo enviar un Pull Request (PR)

1. Haz un **fork** del repositorio (si no eres parte del equipo principal) o crea tu rama local.
2. Realiza tus cambios y asegúrate de añadir **tests** si has modificado la lógica crítica (especialmente en el Smart Contract).
3. Asegúrate de que las pruebas automatizadas pasen (`anchor test` en el backend, y los tests del frontend).
4. Crea un Pull Request apuntando a la rama `dev`.
5. En la descripción del PR, incluye:
   - Qué problema resuelve tu código.
   - Enlace al issue (si aplica).
   - Pruebas realizadas para comprobar su correcto funcionamiento.
6. Espera la revisión de código por parte de al menos un *Code Owner*.

## 🏗️ Actualización de Smart Contracts
Si tu PR implica un cambio en las instrucciones o estructuras de datos en `/backend` (Anchor/Rust):
1. Debes generar el nuevo archivo `idl.json`.
2. Debes ejecutar la regeneración del cliente SDK (`npm run codama:js` o similar).
3. Tu PR **debe incluir obligatoriamente** tanto el código en Rust modificado, como el IDL actualizado y el código de Codama generado, para que el frontend no se rompa al integrar tus cambios.

---
*Gracias por ayudar a construir un turismo más sostenible con Solana.* 🍃
