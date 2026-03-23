# Backend Deployment on Render

## Quick Setup

Your backend is ready to deploy on Render with the configuration in `backend/render.yaml`.

## Deployment Steps

### 1. Create Web Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Devanshprabhakar24/Child-Module`
4. Configure the service:
   - **Name**: `child-module-backend` (or `child-module`)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)` or closest to you
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### 2. Add Environment Variables

Click on **"Environment"** tab and add these variables:

#### Required - Database

```
MONGODB_URI=mongodb+srv://dev24prabhakar_db_user:wE4jJzIpb13PsDqD@ac-ip0mgfz.krj4vcz.mongodb.net/wombto18?retryWrites=true&w=majority
```

#### Required - Authentication

```
JWT_SECRET=wombto18-test-secret
```

#### Required - Payment (Razorpay)

```
RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV
RAZORPAY_KEY_SECRET=ew1iBL70jaPnfoNO5bHW2Nu4
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
PAYMENT_TEST_MODE=false
```

#### Required - Email (SMTP)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=dev24prabhakar@gmail.com
SMTP_PASS=zvfizmbnstxsgade
SMTP_FROM=noreply@wombto18.com
```

#### Required - SMS (Twilio)

```
TWILIO_ACCOUNT_SID=ACb6d2d86e9ddd5e5ea59357fb1ab65743
TWILIO_AUTH_TOKEN=318831376780da860d87b809d00e89cc
TWILIO_PHONE_NUMBER=+19862020079
USE_TWILIO=true
```

#### Required - Cloudinary

```
CLOUDINARY_CLOUD_NAME=dq9fmg62v
CLOUDINARY_API_KEY=598977526551923
CLOUDINARY_API_SECRET=OexyFdOZxx6PdIB19lQE7DKj3xk
```

#### Required - Admin

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@wombto18.com
ADMIN_PHONE=+919999999999
ADMIN_FULL_NAME=System Administrator
```

#### Required - App Configuration

```
NODE_ENV=production
PORT=8000
APP_BASE_URL=https://child-module.vercel.app
APP_NAME=WombTo18
SUBSCRIPTION_PRICE=999
CURRENCY=INR
```

#### Optional - OTP Test Mode

```
OTP_EMAIL_TEST_MODE=false
OTP_SMS_TEST_MODE=false
OTP_TEST_CODE=123456
```

### 3. Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (5-10 minutes)
3. Your backend will be live at: `https://child-module.onrender.com` (or your chosen name)

### 4. Update Frontend

After backend is deployed:

1. Go to Vercel project settings
2. Navigate to **"Environment Variables"**
3. Update `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://child-module.onrender.com
   ```
4. Click **"Save"**
5. Go to **"Deployments"** tab
6. Click **"Redeploy"** on the latest deployment

## Verify Deployment

### Test Backend Health

Visit: `https://child-module.onrender.com/health`

Should return:

```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

### Test API Endpoints

- Registration: `POST /auth/register`
- Login: `POST /auth/login`
- Dashboard: `GET /dashboard` (requires auth)

## Important Notes

### Free Tier Limitations

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Consider upgrading to paid tier for production

### CORS Configuration

The backend is configured to accept requests from:

- `https://child-module.vercel.app` (production)
- `http://localhost:3000` (development)

### Database

- Using MongoDB Atlas (already configured)
- Connection string is in environment variables
- No additional setup needed

### File Uploads

- Using Cloudinary for image storage
- Credentials are in environment variables
- No local file storage needed

## Troubleshooting

### Build Fails

- Check Node version (should be 18+)
- Review build logs in Render dashboard
- Verify all dependencies are in package.json

### App Crashes

- Check runtime logs in Render dashboard
- Verify all environment variables are set
- Check MongoDB connection string

### CORS Errors

- Verify `APP_BASE_URL` matches your Vercel URL
- Check frontend is using correct backend URL
- Review CORS configuration in `main.ts`

### Payment Issues

- Verify Razorpay credentials
- Check webhook URL is configured in Razorpay dashboard
- Test with Razorpay test cards

## Monitoring

### Render Dashboard

- View logs in real-time
- Monitor CPU and memory usage
- Check request metrics
- Set up alerts

### Health Checks

Render automatically monitors: `https://your-app.onrender.com/health`

## Scaling

To upgrade from free tier:

1. Go to service settings
2. Select a paid plan
3. Benefits:
   - No spin-down
   - More resources
   - Better performance
   - Custom domains

## Support

- Render Docs: https://render.com/docs
- NestJS Docs: https://docs.nestjs.com
- MongoDB Atlas: https://www.mongodb.com/docs/atlas

---

## Summary

✅ Backend configured for Render deployment
✅ All environment variables documented
✅ Build and start commands ready
✅ CORS configured for Vercel frontend
✅ Database connection ready
✅ Payment integration configured
✅ Email and SMS services ready

**Your backend is ready to deploy!** Just follow the steps above and your API will be live in minutes.
