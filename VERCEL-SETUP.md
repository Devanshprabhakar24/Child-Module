# Vercel Configuration Guide

## Current Settings to Configure

Based on your Vercel dashboard, here's what you need to set:

### 1. Framework Preset

- Change from "Other" to **Next.js**
- This will auto-configure build commands

### 2. Root Directory

- Set to: `frontend`
- This tells Vercel where your Next.js app is located

### 3. Build Command (Auto-configured with Next.js preset)

- Should be: `npm run build`
- Or: `cd frontend && npm run build`

### 4. Output Directory (Auto-configured)

- Should be: `.next`

### 5. Install Command (Auto-configured)

- Should be: `npm install`

### 6. Development Command (Optional)

- Should be: `npm run dev`

## Environment Variables

After configuring the framework, go to "Environment Variables" tab and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

**Important**:

- Replace `your-backend-url.onrender.com` with your actual Render backend URL
- Make sure the variable name starts with `NEXT_PUBLIC_` (required for Next.js)
- Add it to all environments (Production, Preview, Development)

## Step-by-Step Configuration

1. **Framework Preset**:
   - Click on the "Framework Preset" dropdown
   - Select "Next.js"
   - This will automatically configure most settings

2. **Root Directory**:
   - Click "Edit" next to "Root Directory"
   - Enter: `frontend`
   - Click "Save"

3. **Environment Variables**:
   - Go to "Settings" → "Environment Variables"
   - Click "Add New"
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://wombto18-backend.onrender.com` (or your backend URL)
   - Select all environments
   - Click "Save"

4. **Deploy**:
   - Click "Deploy" or "Redeploy"
   - Wait 2-3 minutes for build to complete

## Verification

After deployment, test your site:

1. Visit your Vercel URL (e.g., `https://child-module.vercel.app`)
2. Check if the site loads
3. Test API calls (registration, login, etc.)
4. Check browser console for any errors

## Troubleshooting

### Build Fails

- Check if "Root Directory" is set to `frontend`
- Verify "Framework Preset" is "Next.js"
- Check build logs for specific errors

### API Calls Fail

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check if backend is running on Render
- Test backend URL directly in browser

### 404 Errors

- Ensure Next.js framework preset is selected
- Check if `.next` is the output directory
- Verify all pages are in `frontend/src/app` directory

## Quick Commands

If you prefer using Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
```

## Next Steps

1. Configure settings as described above
2. Deploy the project
3. Get your Vercel URL
4. Update backend CORS settings with your Vercel URL
5. Test the complete application

## Support

If you encounter issues:

- Check Vercel deployment logs
- Review build output for errors
- Verify all environment variables are set
- Test backend API independently
