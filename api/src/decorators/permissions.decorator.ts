// The PERMISSIONS_KEY is a metadata key. This is a constant string.

// The RequirePerms function is a decorator factory. It takes a variable
// number of string arguments (the permissions) and returns a decorator
// function that sets the metadata for the permissions on the target
// (handler or class) using the SetMetadata function from NestJS.

// To use it in a controller, it would look like this:

// @RequirePerms('delete:element')
// @Delete(':id')
// remove(@Param('id) id: string) { ... }

// NestJS stores the required permissions as metadata on the handler or class.
// The guard will read this metadata using the Reflector in each request.
// api/src/guards/permissions.guard.ts

// This decorator is executed one single time, when the application starts.
// Fast store, fast access.
// This metadata will be later read by the PermissionsGuard to check if the
// user has the required permissions to access.

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePerms = (...perms: string[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);
