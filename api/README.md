# API - Sistema RBAC con NestJS

## Arquitectura y flujo de ejecución

### 1. Inicialización de la aplicación (una sola vez)

Cuando se inicia la API, el orden de carga es el siguiente:

1. **main.ts** - Punto de entrada
   - Crea la aplicación NestJS
   - Configura pipes globales (ValidationPipe)
   - Habilita CORS
   - Inicia el servidor en puerto 3000

2. **app.module.ts** - Módulo raíz
   - Carga ConfigModule (variables de entorno)
   - Registra AuthModule y ElementsModule
   - Registra guards globales en orden: JwtAuthGuard, luego PermissionsGuard

3. **Decoradores (@RequirePerms, @Public)** - Se ejecutan una sola vez
   - Los decoradores se ejecutan en tiempo de compilación/inicialización
   - Almacenan metadata en los métodos del controlador usando SetMetadata
   - Esta metadata queda en memoria como un simple Map/objeto
   - No se vuelven a ejecutar nunca más

4. **roles.config.ts** - Configuración de roles y permisos
   - Define el mapeo de roles a permisos (ROLE_PERMISSIONS)
   - Define el enum Perm para evitar typos
   - Se carga en memoria una sola vez

### 2. Flujo por cada petición HTTP

#### Paso 1: JwtAuthGuard (primer guard global)
- **Complejidad: O(1)**
- Lee metadata con `reflector.getAllAndOverride()` para verificar si tiene @Public
- Si es público, retorna true y termina
- Si no es público, delega a passport-jwt para verificar la firma del JWT
- Passport valida la firma del token (operación criptográfica O(1))

#### Paso 2: JwtStrategy.validate() (si el JWT es válido)
- **Complejidad: O(m)** donde m = cantidad de permisos del usuario
- Se ejecuta una sola vez por request
- Extrae el payload del JWT (sub, name, permissions[])
- **Optimización clave:** Convierte el array de permisos a Set
  ```typescript
  permissionSet: new Set<string>(payload.permissions)
  ```
- Este Set se adjunta a `request.user` y se reutiliza en el siguiente guard
- La conversión Array → Set es O(m), pero m es pequeño (típicamente 3-10 permisos)

#### Paso 3: PermissionsGuard (segundo guard global)
- **Complejidad: O(n)** donde n = cantidad de permisos requeridos por el endpoint
- Lee metadata con `reflector.getAllAndOverride()` para obtener permisos requeridos
  - Lectura de metadata: O(1)
- Si no hay permisos requeridos, retorna true (ruta pública)
- Obtiene `permissionSet` del `request.user` (ya es un Set)
- Verifica con `required.every(p => permSet.has(p))`
  - `every()` itera sobre los permisos requeridos: O(n)
  - `Set.has()` es O(1) por cada verificación
  - Total: O(n × 1) = O(n)
- En la práctica, n es muy pequeño (1-3 permisos por endpoint)

#### Paso 4: Controlador y servicio
- Ejecuta la lógica de negocio
- Accede a `request.user.sub` si necesita el ID del usuario

### 3. Análisis de complejidad total por request

**Tiempo de inicialización (una sola vez):**
- Decoradores: O(1) por cada método decorado
- Carga de configuración: O(1)

**Tiempo por request:**
- JwtAuthGuard: O(1)
- JwtStrategy.validate(): O(m) donde m = permisos del usuario (típicamente 3-10)
- PermissionsGuard: O(n) donde n = permisos requeridos (típicamente 1-3)
- **Total: O(m + n)** que en la práctica es constante porque m y n son muy pequeños

### 4. Optimizaciones de performance

#### 4.1 Uso de Set en lugar de Array
```typescript
// ❌ Lento: O(m) por cada verificación
permissions.includes(perm)

// ✅ Rápido: O(1) por cada verificación
permissionSet.has(perm)
```

Si tuviéramos que verificar 3 permisos contra un array de 10 permisos:
- Con Array: 3 × 10 = 30 comparaciones en el peor caso
- Con Set: 3 × 1 = 3 lookups constantes

#### 4.2 Metadata en memoria
- Los decoradores almacenan metadata una sola vez
- La lectura con Reflector es O(1) (simple lookup en Map interno)
- No hay procesamiento ni parsing en cada request

#### 4.3 Resolución de permisos en el login
```typescript
// En auth.service.ts
private resolvePermissions(roles: string[]): string[] {
  const merged = new Set<string>();
  for (const role of roles) {
    ROLE_PERMISSIONS[role]?.forEach((p) => merged.add(p));
  }
  return [...merged];
}
```
- Los roles se resuelven a permisos una sola vez durante el login
- El JWT ya contiene los permisos resueltos (no los roles)
- En cada request solo se verifica contra permisos, no hay resolución adicional

#### 4.4 Guards globales en orden correcto
```typescript
// En app.module.ts
{ provide: APP_GUARD, useClass: JwtAuthGuard },      // Primero
{ provide: APP_GUARD, useClass: PermissionsGuard },  // Segundo
```
- JwtAuthGuard se ejecuta primero y rechaza tokens inválidos rápidamente
- PermissionsGuard solo se ejecuta si el JWT es válido
- Evita procesamiento innecesario en requests no autenticados

### 5. Ejemplo de flujo completo

```
Request: DELETE /elements/123
Header: Authorization: Bearer <jwt>

1. JwtAuthGuard
   - Lee metadata @Public → no existe
   - Verifica firma JWT → válido
   - Pasa a JwtStrategy

2. JwtStrategy.validate()
   - Extrae payload: { sub: "user1", permissions: ["delete:element", "read:element"] }
   - Crea Set: new Set(["delete:element", "read:element"])
   - Adjunta a request.user

3. PermissionsGuard
   - Lee metadata @RequirePerms → ["delete:element"]
   - Verifica: permSet.has("delete:element") → true
   - Permite el acceso

4. ElementsController.remove()
   - Ejecuta la lógica de negocio
```

### 6. Respuesta a la pregunta sobre O(n)

La única parte que es O(n) es la verificación en PermissionsGuard:
```typescript
const hasAll = required.every((p) => permSet.has(p));
```

Donde n = cantidad de permisos requeridos por el endpoint (típicamente 1-3).

Sin embargo, cada `permSet.has(p)` es O(1) gracias al uso de Set.

Por lo tanto, la complejidad es O(n) pero con n muy pequeño y operaciones internas O(1), lo que en la práctica es casi constante.

No hay ninguna parte O(n) donde n sea el total de permisos del usuario o del sistema, que es lo importante.
