// This is the role-permissions map. There MUST be only one place where this logic lives
// (either here or in the DB), as this is also what the @RequirePerms decorator will use to check permissions
// and what the frontend will recieve to know what the user should be able to do or not do.

// This follows the [action:resource] format, a good practice for consistency with permission naming.

// Another good practice is to have an enum for permissions so that we can avoid typos in the codebase,
// as this is an input for the @RequirePerms decorator.

// With this enum, the controller can use it as follows:
// @RequirePerms(Perm.DELETE)
// @Delete(':id')
// remove( ... ) { ... }

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['insert:element', 'update:element', 'delete:element', 'read:element'],
  editor: ['insert:element', 'update:element', 'read:element'],
  viewer: ['read:element'],
};

export enum Perm {
  INSERT = 'insert:element',
  UPDATE = 'update:element',
  DELETE = 'delete:element',
  READ = 'read:element',
}
