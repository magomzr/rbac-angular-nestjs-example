import { SetMetadata } from '@nestjs/common';

// Clave de metada - string constante.
export const PERMISSIONS_KEY = 'permissions';

// Decorador a utilizar en cada endpoint
export const RequirePerms = (...perms: string[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);

/* Para usarlo en el controller, queda:

@RequirePerms('delete:element')
@Delete(':id')
remove(@Param('id) id: string) { ... }

NestJS guarda los permisos requeridos como metadata
en el handler o clase. El guard los va a leer con 
Reflector en cada request.
api/src/guards/permissions.guard.ts
*/
