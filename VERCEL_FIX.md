# Fix: "No Next.js version detected" Error

## Problem

```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```

## Root Cause

Vercel is looking at the root directory of your repository, but your Next.js app is in the `frontend` subfolder.

## Solution

### Option 1: Configure in Vercel Dashboard (Recommended)

1. Go to your Vercel project
2. Click **Settings** (top navigation)
3. Click **General** (left sidebar)
4. Scroll down to **Root Directory**
5. Click **Edit**
6. Enter: `frontend`
7. Click **Save**
8. Go to **Deployments** tab
9. Click **Redeploy** on the latest deployment

### Option 2: Using vercel.json (Alternative)

If you prefer configuration file, create `vercel.json` at the root:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs"
}
```

But **Option 1 is cleaner and recommended**.

## Verification

After setting Root Directory to `frontend`, Vercel should:

- ✅ Detect Next.js automatically
- ✅ Find `package.json` with Next.js dependency
- ✅ Use correct build commands
- ✅ Deploy successfully

## Project Structure

Your repository structure:

```
Child-Module/
├── backend/           # NestJS backend
│   └── package.json   # Has @nestjs dependencies
├── frontend/          # Next.js frontend ← SET THIS AS ROOT
│   ├── package.json   # Has "next" dependency
│   ├── next.config.ts
│   └── src/
├── package.json       # Root package.json (not used by Vercel)
└── README.md
```

## Common Mistakes

❌ **Wrong:** Root Directory = `.` or empty
✅ **Correct:** Root Directory = `frontend`

❌ **Wrong:** Build Command = `npm run build`
✅ **Correct:** Auto-detected (Vercel handles this when Root Directory is set)

## Still Having Issues?

### Check These:

1. **Verify Root Directory is saved:**
   - Go to Settings → General
   - Root Directory should show: `frontend`

2. **Clear Build Cache:**
   - Go to Settings → General
   - Scroll to "Build & Development Settings"
   - Click "Clear Build Cache"

3. **Check package.json:**

   ```bash
   cd frontend
   cat package.json | grep "next"
   ```

   Should show: `"next": "16.1.6"` or similar

4. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## Alternative: Deploy from Frontend Folder

If you want to deploy only the frontend folder:

1. Create a separate GitHub repository for frontend only
2. Copy `frontend/*` to new repo
3. Deploy that repo to Vercel (no Root Directory needed)

But this is more complex and not recommended for monorepo setups.

## Summary

**Quick Fix:**

1. Vercel Dashboard → Settings → General
2. Root Directory → Edit → Enter `frontend` → Save
3. Deployments → Redeploy

That's it! Your deployment should work now. 🚀
