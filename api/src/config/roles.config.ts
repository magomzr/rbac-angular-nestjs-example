// Mapa de los roles. Permisos. Este es el único lugar donde
// debe vivir la lógica (sea aquí o en DB)

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['insert:element', 'update:element', 'delete:element', 'read:element'],
  editor: ['insert:element', 'update:element', 'read:element'],
  viewer: ['read:element'],
};

// Opcional: un enum para evitar typos en decorators
export enum Perm {
  INSERT = 'insert:element',
  UPDATE = 'update:element',
  DELETE = 'delete:element',
  READ = 'read:element',
}

/* 
Con el enum, el controller queda:

@RequirePerms(Perm.DELETE)
@Delete(':id')
remove(...) { ... }
*/
