#!/bin/sh

# This file is needed because the drizzle-kit CLI doesn't work
# with pnpm exec in a the Containerfile CMD instruction, so
# it needs to be run separately before running the server.

set -e
pnpm exec drizzle-kit push
pnpm exec ts-node -r tsconfig-paths/register src/db/seed.ts
node dist/main
