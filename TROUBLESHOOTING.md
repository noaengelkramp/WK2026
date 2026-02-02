# 🔧 Troubleshooting Guide - WK2026 Prediction Game

This document contains solutions to common issues encountered during development and deployment.

## Table of Contents

- [Build Issues](#build-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Deployment Issues](#deployment-issues)

---

## Build Issues

### TypeScript Error: Cannot find module 'pg' (TS7016)

**Symptom:**
```
TypeScript fails during npm run build:netlify because it cannot find type declarations 
for the pg module in src/scripts/migrate-email-verification.ts (line 92). 
This triggers compiler error TS7016, causing the build to exit with code 2.
```

**Root Cause:**
The migration script imports the `pg` module, but TypeScript cannot find the type definitions (`@types/pg`) because they're not installed or not in the correct package.json.

**Solution Option 1: Install @types/pg (Recommended)**

Add the missing type definitions by installing `@types/pg` as a dev dependency:

```bash
cd server
npm install --save-dev @types/pg
```

If you want to commit the lockfile (not required for Netlify):
```bash
git add server/package.json server/package-lock.json
git commit -m "Add @types/pg for TypeScript"
git push origin main
```

**Solution Option 2: Create Custom Declaration File**

If you prefer not to install the types package, create a custom declaration file:

1. Create `server/types/pg.d.ts`:
```typescript
declare module 'pg';
```

2. Update `server/tsconfig.json` to include custom type roots:
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./types"]
  }
}
```

**Verification:**

After applying either fix, verify the build works:
```bash
npm run build:netlify
```

If successful, push the changes and Netlify will automatically trigger a new build.

---

### Migration Script Compilation Errors

**Symptom:**
Migration scripts in `server/src/scripts/` fail to compile with various TypeScript errors.

**Solution:**

Ensure all required dependencies are installed in the server package.json:
```bash
cd server
npm install --save-dev @types/pg @types/node
npm install pg dotenv
```

Verify tsconfig.json includes the scripts directory:
```json
{
  "include": ["src/**/*"]
}
```

---

## Database Issues

### Column Does Not Exist Error

**Symptom:**
```
SequelizeDatabaseError: column User.is_email_verified does not exist
```

**Root Cause:**
The User model was updated with new columns, but the database schema was not migrated.

**Solution:**

Run the email verification migration script:
```bash
cd server
npx ts-node src/scripts/migrate-email-verification.ts
```

**General Migration Process:**

1. Check if migrations directory exists: `ls server/migrations/`
2. Review the SQL migration file
3. Run the migration script
4. Verify columns were added:
```bash
psql $DATABASE_URL -c "\d users"
```

---

### Database Connection Failed in Production

**Symptom:**
Health check shows `"database": "disconnected"` or database queries timeout.

**Root Cause:**
- DATABASE_URL environment variable not set in Netlify
- Database firewall blocking Netlify IPs
- SSL configuration incorrect

**Solution:**

1. **Check Netlify Environment Variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Verify `DATABASE_URL` is set correctly
   - Format: `postgresql://user:password@host:port/database?sslmode=require`

2. **Check Database Firewall:**
   - For Neon: Database should allow all connections by default
   - For AWS RDS: Add 0.0.0.0/0 to security group (production should use Netlify IPs)
   - For other providers: Check IP whitelist settings

3. **Test Connection:**
```bash
curl https://your-site.netlify.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## Authentication Issues

### Login Returns 500 Error

**Symptom:**
Login endpoint returns HTTP 500 with no specific error message.

**Investigation Steps:**

1. **Check Netlify Function Logs:**
   - Go to Netlify Dashboard → Functions → api
   - Look for error messages in recent invocations
   - Search for "Login error:" prefix

2. **Test Health Endpoint:**
```bash
curl https://your-site.netlify.app/api/health
```

3. **Check Error Logs Locally:**
```bash
cd server
npm run dev

# In another terminal:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wk2026.com","password":"password123"}'
```

**Common Causes:**

- **Missing Database Columns**: Run migrations (see Database Issues section)
- **Invalid Customer Number**: Ensure user's customerNumber exists in customers table
- **Model Association Error**: Check User.belongsTo(Customer) in models/index.ts

---

### JWT Token Invalid or Expired

**Symptom:**
API returns 401 Unauthorized even with valid token.

**Solution:**

1. **Check Token Expiration:**
   - Access tokens expire after 7 days
   - Refresh tokens expire after 30 days

2. **Use Refresh Token:**
```bash
curl -X POST https://your-site.netlify.app/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```

3. **Check JWT Secrets:**
   - Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in Netlify
   - Secrets must be the same across deployments

---

## Deployment Issues

### Netlify Build Fails with TypeScript Errors

**General Troubleshooting:**

1. **Test Build Locally:**
```bash
npm run build:netlify
```

2. **Check Node Version:**
   - Netlify uses Node.js 18 (set in netlify.toml)
   - Verify locally: `node --version`

3. **Clear Netlify Cache:**
   - Go to Netlify Dashboard → Deploys → Trigger deploy → Clear cache and deploy

4. **Review Build Logs:**
   - Look for the first error (subsequent errors often cascade)
   - Check for missing dependencies
   - Verify all import paths are correct

---

### Netlify Functions Timeout

**Symptom:**
API requests return 502 or timeout after 10 seconds.

**Solution:**

1. **Check Function Execution Time:**
   - Netlify functions have 10s timeout on free tier, 26s on paid
   - Optimize slow database queries
   - Add database indexes for frequently queried columns

2. **Add Loading States:**
   - Don't block on external API calls
   - Use background jobs for long-running tasks

3. **Monitor Function Logs:**
```bash
netlify functions:log api
```

---

### Environment Variables Not Loading

**Symptom:**
Application can't find environment variables in production.

**Solution:**

1. **Set in Netlify Dashboard:**
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.example`
   - Click "Save"

2. **Required Variables:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
NODE_ENV=production
NETLIFY=true
```

3. **Redeploy After Changes:**
   - Changing env vars doesn't auto-redeploy
   - Go to Deploys → Trigger deploy

---

## Development Issues

### Port Already in Use

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

Find and kill the process using the port:
```bash
# Find process
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)

# Or use a different port
PORT=5001 npm run dev
```

---

### Database Connection Refused Locally

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

1. **Start PostgreSQL:**
```bash
# macOS (Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Check status
psql --version
```

2. **Create Database:**
```bash
createdb wk2026
```

3. **Update .env:**
```
DATABASE_URL=postgresql://localhost:5432/wk2026
```

---

## Getting Help

If you encounter an issue not covered here:

1. **Check Recent Changes:**
```bash
git log --oneline -10
git diff HEAD~1
```

2. **Review Session Notes:**
```bash
cat agent-progress.txt | tail -100
```

3. **Search Documentation:**
- README.md - General overview
- API_FOOTBALL_INTEGRATION_REPORT.md - API integration
- EMAIL_VERIFICATION_COMPLETE.md - Email system
- NETLIFY_DEPLOYMENT.md - Deployment guide

4. **Enable Debug Logging:**
```bash
# Server
DEBUG=* npm run dev

# Client  
VITE_DEBUG=true npm run dev
```

---

## Prevention Checklist

Before committing changes:

- [ ] Run `npm run build:netlify` successfully
- [ ] Test locally with `npm run dev`
- [ ] Check for TypeScript errors
- [ ] Verify all imports are correct
- [ ] Test API endpoints with curl
- [ ] Review git diff for unintended changes
- [ ] Update agent-progress.txt with changes

Before deploying to production:

- [ ] All tests passing locally
- [ ] Database migrations executed
- [ ] Environment variables set in Netlify
- [ ] Health check endpoint returns "ok"
- [ ] Login and authentication working
- [ ] No console errors in browser

---

**Last Updated:** February 2, 2026  
**Contributors:** auto-coder-coding agent, development team

For more information, see the main [README.md](./README.md) or contact the project administrator.
