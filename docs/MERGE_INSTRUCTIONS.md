# Secure Merge Instructions (2.J.08)

To merge the current database architecture changes into the main development branch (`dev`), follow these secure steps:

```bash
# 1. Ensure you are on the target branch (dev) and it is up-to-date
git checkout dev
git pull origin dev

# 2. Merge the feature branch (use --no-ff to preserve feature history)
# Replace 'feature/finalize-database-architecture' with your actual feature branch name
git merge --no-ff feature/finalize-database-architecture

# 3. Verify the merge (Optional but recommended)
# Run tests to ensure no regressions
npm run build --prefix apps/backend
# npx prisma generate --prefix apps/backend (Verify Prisma Client generation)

# 4. Push the merged changes
git push origin dev
```

**Note:** Ensure all Pre-Commit hooks pass before pushing.
