# Fix Render Backend 404 Error

## The Problem

You're seeing "Cannot GET /" with 404 error because Render doesn't know your backend code is in the `backend` folder.

## The Solution

### Step 1: Update Render Service Settings

1. **Go to**: https://dashboard.render.com
2. **Click** on your service: `child-module` (or whatever you named it)
3. **Click**: "Settings" (left sidebar)
4. **Find**: "Root Directory" section
5. **Click**: "Edit"
6. **Enter**: `backend`
7. **Click**: "Save Changes"

### Step 2: Trigger Manual Deploy

1. **Go to**: "Manual Deploy" section (top right)
2. **Click**: "Deploy latest commit"
3. **Wait**: 5-10 minutes for build to complete

### Step 3: Verify Deployment

Visit: `https://child-module.onrender.com/health`

Should return:

```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

## If You Haven't Created the Service Yet

Follow these steps to create it correctly:

### 1. Create New Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Devanshprabhakar24/Child-Module`

### 2. Configure Service

**Basic Settings:**

- **Name**: `child-module` (or your preferred name)
- **Root Directory**: `backend` ⚠️ CRITICAL
- **Environment**: `Node`
- **Region**: `Oregon (US West)` or closest to you
- **Branch**: `main`

**Build & Deploy:**

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### 3. Add Environment Variables

Click "Advanced" → "Add Environment Variable" and add all these:

#### Database

```
MONGODB_URI=mongodb+srv://dev24prabhakar_db_user:wE4jJzIpb13PsDqD@ac-ip0mgfz.krj4vcz.mongodb.net/wombto18?retryWrites=true&w=majority
```

#### Authentication

```
JWT_SECRET=wombto18-test-secret
```

#### App Configuration

```
NODE_ENV=production
PORT=8000
APP_BASE_URL=https://child-module.vercel.app
APP_NAME=WombTo18
SUBSCRIPTION_PRICE=999
CURRENCY=INR
```

#### Payment (Razorpay)

```
RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV
RAZORPAY_KEY_SECRET=ew1iBL70jaPnfoNO5bHW2Nu4
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PAYMENT_TEST_MODE=false
```

#### Email (SMTP)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=dev24prabhakar@gmail.com
SMTP_PASS=zvfizmbnstxsgade
SMTP_FROM=noreply@wombto18.com
```

#### SMS (Twilio)

```
TWILIO_ACCOUNT_SID=ACb6d2d86e9ddd5e5ea59357fb1ab65743
TWILIO_AUTH_TOKEN=318831376780da860d87b809d00e89cc
TWILIO_PHONE_NUMBER=+19862020079
USE_TWILIO=true
```

#### Cloudinary

```
CLOUDINARY_CLOUD_NAME=dq9fmg62v
CLOUDINARY_API_KEY=598977526551923
CLOUDINARY_API_SECRET=OexyFdOZxx6PdIB19lQE7DKj3xk
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dq9fmg62v
```

#### Admin

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@wombto18.com
ADMIN_PHONE=+919999999999
ADMIN_FULL_NAME=System Administrator
```

#### OTP Configuration

```
OTP_EMAIL_TEST_MODE=false
OTP_SMS_TEST_MODE=false
OTP_TEST_CODE=123456
```

### 4. Create Service

Click "Create Web Service" and wait for deployment (5-10 minutes)

## Verify Backend is Working

### Test Health Endpoint

```
https://child-module.onrender.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Test API Documentation

```
https://child-module.onrender.com/api
```

Should show Swagger API documentation

## Common Issues

### Issue: "Cannot GET /"

**Cause**: Root Directory not set to `backend`
**Fix**: Update Root Directory in Settings → Save → Redeploy

### Issue: Build Fails

**Cause**: Missing dependencies or wrong Node version
**Fix**:

- Check build logs
- Ensure Node 18+ is being used
- Verify package.json is in backend folder

### Issue: App Crashes After Deploy

**Cause**: Missing environment variables or database connection
**Fix**:

- Check all environment variables are set
- Verify MongoDB connection string
- Check runtime logs for specific errors

### Issue: 503 Service Unavailable

**Cause**: Free tier spinning down (normal behavior)
**Fix**:

- Wait 30-60 seconds for service to spin up
- First request after inactivity takes longer
- Consider upgrading to paid tier for always-on

## After Backend is Live

### Update Frontend

1. Go to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Verify `NEXT_PUBLIC_API_URL=https://child-module.onrender.com`
4. Redeploy frontend

### Test Integration

1. Visit frontend: https://child-module.vercel.app
2. Try registration
3. Test payment flow
4. Check dashboard features

## Monitoring

### Render Dashboard

- View real-time logs
- Monitor resource usage
- Check request metrics
- Set up alerts

### Health Checks

Render automatically monitors your `/health` endpoint

## Support

- Render Docs: https://render.com/docs
- NestJS Docs: https://docs.nestjs.com
- MongoDB Atlas: https://www.mongodb.com/docs/atlas

---

## Quick Checklist

- [ ] Root Directory set to `backend` in Render
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Health endpoint returns OK
- [ ] Frontend updated with backend URL
- [ ] End-to-end testing completed

**Once the Root Directory is set to `backend`, your API will work!** 🚀
