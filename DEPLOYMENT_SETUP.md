# Deployment Setup

## Current Configuration

### Frontend (Vercel)

- **URL**: https://child-module.vercel.app
- **Status**: Deployed
- **Backend API**: https://child-module.onrender.com

### Backend (Render)

- **URL**: https://child-module.onrender.com
- **Status**: Needs deployment
- **Frontend URL**: https://child-module.vercel.app

## Backend Deployment on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: child-module
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
5. Add all environment variables from `backend/.env`
6. Click "Create Web Service"

## Important: Update Vercel Environment Variable

After backend is deployed on Render:

1. Go to Vercel project settings
2. Navigate to "Environment Variables"
3. Update or add:
   ```
   NEXT_PUBLIC_API_URL=https://child-module.onrender.com
   ```
4. Redeploy frontend

## CORS Configuration

The backend `.env` is already configured with:

```
APP_BASE_URL=https://child-module.vercel.app
```

This allows your Vercel frontend to make API calls to the Render backend.

## Testing

After both are deployed:

1. Visit https://child-module.vercel.app
2. Test registration flow
3. Test payment integration
4. Test dashboard features
5. Test real-time notifications

## Notes

- Frontend is already deployed on Vercel ✅
- Backend needs to be deployed on Render
- Both URLs are configured in respective .env files
- CORS is configured to allow communication between them
