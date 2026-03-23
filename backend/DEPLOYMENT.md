# Backend Deployment Guide - Render

## Prerequisites

- GitHub account
- Render account (https://render.com)
- MongoDB Atlas database
- All environment variables ready

## Deployment Steps

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `wombto18-backend`
   - **Region**: Singapore (or closest to your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Starter (or Free for testing)

### 3. Add Environment Variables

Go to "Environment" tab and add these variables:

#### Required Variables

```
NODE_ENV=production
PORT=8000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string_min_32_chars
JWT_EXPIRES_IN=7d
```

#### Payment (Razorpay)

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PAYMENT_TEST_MODE=false
```

#### Email (SMTP)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@wombto18.com
```

#### Application

```
APP_BASE_URL=https://your-frontend-domain.vercel.app
```

#### Cloudinary (Optional)

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Twilio (Optional - for SMS)

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

#### WhatsApp (Optional)

```
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_API_KEY=your_whatsapp_api_key
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (5-10 minutes)
4. Your backend will be available at: `https://wombto18-backend.onrender.com`

### 5. Health Check

Test your deployment:

```bash
curl https://wombto18-backend.onrender.com/
```

### 6. Update Frontend Environment Variable

Update your frontend `.env.production` with the backend URL:

```
NEXT_PUBLIC_API_URL=https://wombto18-backend.onrender.com
```

## Important Notes

### Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for 1 service)

### Paid Tier Benefits ($7/month)

- Always running (no spin-down)
- Faster response times
- More resources (512MB RAM → 2GB RAM)

### MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Add IP whitelist: `0.0.0.0/0` (allow all IPs)
3. Create database user
4. Get connection string
5. Replace `<password>` with your database password

### Monitoring

- View logs: Render Dashboard → Your Service → Logs
- Monitor metrics: Dashboard → Metrics tab
- Set up alerts: Dashboard → Settings → Notifications

### Custom Domain (Optional)

1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Troubleshooting

### Build Fails

- Check Node version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Service Won't Start

- Verify PORT environment variable is set to 8000
- Check MongoDB connection string
- Review startup logs

### Database Connection Issues

- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has correct permissions

### Environment Variables Not Working

- Ensure no trailing spaces in values
- Restart service after adding new variables
- Check variable names match exactly

## Useful Commands

### View Logs

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# View logs
render logs -s wombto18-backend
```

### Manual Deploy

```bash
render deploy -s wombto18-backend
```

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
