# Vercel Deployment Troubleshooting

## Current Status

Your Vercel deployment is live but showing a blank page. This guide will help you diagnose and fix the issue.

## Quick Diagnostics

### 1. Test Page

Visit: https://child-module.vercel.app/test

This page will show:

- ✅ If the deployment is working
- ✅ Environment variables status
- ✅ Basic React rendering

### 2. Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for errors (red text)
4. Common errors:
   - API connection errors
   - Missing environment variables
   - Component rendering errors

### 3. Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for failed requests (red status codes)

## Common Issues & Fixes

### Issue 1: Blank White Page

**Possible Causes:**

- JavaScript error preventing render
- Missing environment variables
- API connection timeout

**Fix:**

1. Check browser console for errors
2. Verify environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Ensure `NEXT_PUBLIC_API_URL` is set
   - Value should be: `https://child-module.onrender.com`
3. Redeploy after adding variables

### Issue 2: API Connection Errors

**Symptoms:**

- Console shows "Failed to fetch"
- Network errors to backend

**Fix:**

1. Verify backend is running:
   - Visit: https://child-module.onrender.com/health
   - Should return: `{"status":"ok"}`
2. If backend is down:
   - Deploy backend on Render first
   - Follow `RENDER_BACKEND_SETUP.md`
3. Check CORS:
   - Backend `.env` should have: `APP_BASE_URL=https://child-module.vercel.app`

### Issue 3: Build Succeeded But Page Won't Load

**Fix:**

1. Check Vercel Function Logs:
   - Go to Vercel Dashboard
   - Click on your project
   - Go to **Deployments** → Click latest
   - Check **Function Logs** tab
2. Look for runtime errors
3. Common fixes:
   - Add missing environment variables
   - Check for server-side rendering errors
   - Verify all imports are correct

### Issue 4: 404 on All Pages

**Fix:**

- Root Directory not set correctly
- Go to Settings → General → Root Directory
- Set to: `frontend`
- Redeploy

## Environment Variables Checklist

Verify these are set in Vercel:

### Required

- ✅ `NEXT_PUBLIC_API_URL` = `https://child-module.onrender.com`
- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_test_SQSUtij8FkBpFV`

### How to Add

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter key and value
6. Select **Production**, **Preview**, **Development**
7. Click **Save**
8. **Redeploy** for changes to take effect

## Step-by-Step Debug Process

### Step 1: Verify Deployment

```
Visit: https://child-module.vercel.app/test
```

- If this loads → Deployment is working
- If blank → Check browser console

### Step 2: Check Environment Variables

```
The test page will show if variables are set
```

- If "Not set" → Add them in Vercel dashboard
- If showing values → Variables are correct

### Step 3: Test Backend Connection

```
Visit: https://child-module.onrender.com/health
```

- If returns JSON → Backend is working
- If error → Deploy backend first

### Step 4: Check Homepage

```
Visit: https://child-module.vercel.app
```

- If loads → Everything is working!
- If blank → Check console for specific errors

## Getting Detailed Logs

### Vercel Logs

1. Go to Vercel Dashboard
2. Click your project
3. Go to **Deployments**
4. Click on latest deployment
5. Check tabs:
   - **Build Logs** - Build time errors
   - **Function Logs** - Runtime errors
   - **Static** - Static file serving

### Browser Console

1. Press F12
2. Go to Console tab
3. Look for errors
4. Copy error messages for debugging

## Still Not Working?

### Check These:

1. **Root Directory**
   - Settings → General → Root Directory = `frontend`

2. **Build Command**
   - Should be: `npm run build` (auto-detected)

3. **Output Directory**
   - Should be: `.next` (auto-detected)

4. **Node Version**
   - Should be: 18.x or higher

5. **Environment Variables**
   - Must include `NEXT_PUBLIC_API_URL`
   - Must redeploy after adding

### Force Clean Deploy

1. Go to Deployments
2. Click "..." on latest
3. Click "Redeploy"
4. **Uncheck** "Use existing Build Cache"
5. Click "Redeploy"

## Success Indicators

When everything is working:

✅ Test page loads and shows environment variables
✅ Homepage loads with all components
✅ No errors in browser console
✅ Backend health check returns OK
✅ Can navigate to /register, /login, etc.

## Next Steps After Fix

1. Test registration flow
2. Test payment integration
3. Test dashboard access
4. Test admin panel
5. Monitor for errors

## Support

If you're still stuck:

1. Check Vercel build logs
2. Check browser console errors
3. Verify backend is deployed and running
4. Ensure all environment variables are set
5. Try a clean redeploy

---

## Quick Reference

**Test URL**: https://child-module.vercel.app/test
**Backend Health**: https://child-module.onrender.com/health
**Main Site**: https://child-module.vercel.app

**Required Env Vars**:

- `NEXT_PUBLIC_API_URL=https://child-module.onrender.com`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV`
