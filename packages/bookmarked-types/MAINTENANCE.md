# Bookmarked Types Package Maintenance Guide

This guide provides step-by-step instructions for maintaining the `bookmarked-types` package to ensure proper builds and type distribution across the project.

## Overview

The `bookmarked-types` package is a shared TypeScript types and Zod schemas package used by both the backend and frontend applications. It's set up as a workspace package and needs to be properly built and distributed when changes are made.

## Package Structure

```
packages/bookmarked-types/
├── src/                    # Source TypeScript files
│   ├── api/               # API request/response types
│   ├── database/          # Database model types
│   ├── shared/            # Common interfaces
│   └── index.ts           # Main exports
├── dist/                  # Compiled JavaScript and declaration files
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
└── MAINTENANCE.md         # This file
```

## Common Issues and Solutions

### Issue 1: TypeScript Declaration Files Missing

**Symptoms:**
- Error: `Could not find a declaration file for module 'bookmarked-types'`
- Backend/frontend fails to start with TS7016 errors

**Root Cause:**
- The `dist/index.d.ts` file is missing
- TypeScript incremental build cache is stale
- Package wasn't properly rebuilt after changes

**Solution:**
```bash
# Navigate to the types package
cd packages/bookmarked-types

# Clean build artifacts and rebuild
rm -rf dist tsconfig.tsbuildinfo
yarn build

# Verify the dist folder contains all necessary files
ls -la dist/
# Should contain: index.d.ts, index.js, api/, database/, shared/ folders
```

### Issue 2: Workspace Dependencies Not Updated

**Symptoms:**
- Changes to schemas don't reflect in backend/frontend
- Old type definitions still being used

**Root Cause:**
- Workspace symlinks pointing to outdated build artifacts
- Node modules cache not updated

**Solution:**
```bash
# From project root
cd /path/to/bookmarked

# Rebuild the types package
yarn workspace bookmarked-types build

# Update workspace dependencies
yarn install

# If issues persist, manually sync the dist folder
cp -r packages/bookmarked-types/dist/* backend/node_modules/bookmarked-types/dist/
cp -r packages/bookmarked-types/dist/* frontend/node_modules/bookmarked-types/dist/
```

## Proper Workflow for Updates

### 1. Making Schema Changes

When updating Zod schemas or TypeScript types:

```bash
# 1. Navigate to the types package
cd packages/bookmarked-types

# 2. Make your changes to files in src/
# Example: Edit src/api/auth.ts to update RegisterSchema

# 3. Clean and rebuild
rm -rf dist tsconfig.tsbuildinfo
yarn build

# 4. Verify build output
ls -la dist/
cat dist/index.d.ts  # Should contain your exports
```

### 2. Testing Changes

```bash
# From project root
cd /path/to/bookmarked

# Test backend compilation
cd backend
yarn build

# Test backend development server
yarn dev

# Test frontend (if applicable)
cd ../frontend
yarn build
```

### 3. Updating Dependent Projects

If workspace linking doesn't work automatically:

```bash
# From project root
# Force update workspace dependencies
yarn install --force

# Or manually sync dist folders
cp -r packages/bookmarked-types/dist/* backend/node_modules/bookmarked-types/dist/
cp -r packages/bookmarked-types/dist/* frontend/node_modules/bookmarked-types/dist/
```

## Build Scripts

### Available Commands

```bash
# Build the package
yarn build

# Watch mode for development
yarn dev

# Type checking only (no output)
yarn type-check

# Lint the code
yarn lint
```

### Build Configuration

The package uses these key TypeScript compiler options:

- `declaration: true` - Generates .d.ts files
- `declarationMap: true` - Generates source maps for declarations
- `composite: true` - Enables project references
- `incremental: true` - Enables incremental compilation

## Troubleshooting

### Clean Build

If you encounter persistent issues:

```bash
# Full clean and rebuild
cd packages/bookmarked-types
rm -rf dist node_modules tsconfig.tsbuildinfo
yarn install
yarn build

# Verify output
ls -la dist/
```

### Verify Package Exports

Check that all expected types are exported:

```bash
# Check the main index.d.ts
cat dist/index.d.ts

# Check specific API types
cat dist/api/auth.d.ts
```

### Check Workspace Configuration

Ensure package.json has correct configuration:

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist/**/*"]
}
```

## Best Practices

1. **Always rebuild after schema changes**
2. **Test both backend and frontend after updates**
3. **Use clean builds when in doubt**
4. **Verify declaration files are generated**
5. **Check workspace dependencies are updated**

## Emergency Recovery

If the package is completely broken:

```bash
# 1. Clean everything
cd packages/bookmarked-types
rm -rf dist node_modules tsconfig.tsbuildinfo

# 2. Reinstall dependencies
yarn install

# 3. Rebuild from scratch
yarn build

# 4. Force update all workspaces
cd ../../
yarn install --force

# 5. Manually sync if needed
cp -r packages/bookmarked-types/dist/* backend/node_modules/bookmarked-types/dist/
cp -r packages/bookmarked-types/dist/* frontend/node_modules/bookmarked-types/dist/
```

This should resolve any TypeScript declaration file issues and restore proper type checking across the project.
