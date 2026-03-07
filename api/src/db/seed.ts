import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcrypt';
import * as schema from './schema';

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['insert:element', 'update:element', 'delete:element', 'read:element'],
  editor: ['insert:element', 'update:element', 'read:element'],
  viewer: ['read:element'],
};

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  // Roles
  const roleRows = Object.keys(ROLE_PERMISSIONS).map((name) => ({
    id: name,
    name,
  }));
  await db.insert(schema.roles).values(roleRows).onConflictDoNothing();

  // Permissions
  const allPerms = [...new Set(Object.values(ROLE_PERMISSIONS).flat())];
  const permRows = allPerms.map((name) => ({ id: name, name }));
  await db.insert(schema.permissions).values(permRows).onConflictDoNothing();

  // Role-permissions
  const rpRows = Object.entries(ROLE_PERMISSIONS).flatMap(([roleId, perms]) =>
    perms.map((permissionId) => ({ roleId, permissionId })),
  );
  await db.insert(schema.rolePermissions).values(rpRows).onConflictDoNothing();

  // Users
  const userRows = [
    { id: '1', name: 'Bob', email: 'bob@test.com', roleId: 'admin' },
    { id: '2', name: 'Charlie', email: 'charlie@test.com', roleId: 'editor' },
    { id: '3', name: 'Dana', email: 'dana@test.com', roleId: 'viewer' },
  ];
  for (const u of userRows) {
    await db
      .insert(schema.users)
      .values({ ...u, password: await bcrypt.hash('secret123', 10) })
      .onConflictDoNothing();
  }

  // Elements
  const elementRows = [
    {
      id: '1',
      name: 'Element Alpha',
      description: 'First test element',
      createdBy: '1',
      status: 'published',
    },
    {
      id: '2',
      name: 'Element Beta',
      description: 'Second test element',
      createdBy: '2',
      status: 'draft',
    },
  ];
  await db.insert(schema.elements).values(elementRows).onConflictDoNothing();

  await client.end();
  console.log('Seed complete');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
