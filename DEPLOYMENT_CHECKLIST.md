# 🚀 Deployment Checklist

## Current Configuration

### ✅ Frontend (Vercel)

- **URL**: https://child-module.vercel.app
- **Backend API**: https://child-module.onrender.com
- **Status**: Deployed (needs redeploy after backend is live)

### ⏳ Backend (Render)

- **URL**: https://child-module.onrender.com
- **Frontend URL**: https://child-module.vercel.app
- **Status**: Ready to deploy

---

## Step 1: Deploy Backend on Render

### 1.1 Create Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub: `Devanshprabhakar24/Child-Module`
4. Settings:
   - **Name**: `child-module`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### 1.2 Add Environment Variables

Copy all variables from `backend/.env` or use the list in `RENDER_BACKEND_SETUP.md`

**Critical Variables:**

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - wombto18-test-secret
- `APP_BASE_URL` - https://child-module.vercel.app
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`
- `SMTP_USER` & `SMTP_PASS`
- All other variables from backend/.env

### 1.3 Deploy

Click "Create Web Service" and wait 5-10 minutes

### 1.4 Verify Backend

Visit: https://child-module.onrender.com/health

Should return:

```json
{ "status": "ok", "timestamp": "..." }
```

---

## Step 2: Update Frontend on Vercel

### 2.1 Add/Update Environment Variable

1. Go to Vercel project: https://vercel.com/dashboard
2. Select your project: `child-module`
3. Go to "Settings" → "Environment Variables"
4. Add or update:
   ```
   NEXT_PUBLIC_API_URL=https://child-module.onrender.com
   ```
5. Click "Save"

### 2.2 Redeploy Frontend

1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Uncheck "Use existing Build Cache"
5. Click "Redeploy"

### 2.3 Verify Frontend

Visit: https://child-module.vercel.app

Should load the homepage properly

---

## Step 3: Test Complete Flow

### 3.1 Registration

1. Go to https://child-module.vercel.app
2. Click "Register"
3. Fill in child details
4. Complete registration

### 3.2 Payment

1. Select a plan (₹249 or ₹999)
2. Test payment with Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

### 3.3 Dashboard

1. Login with registered email
2. Check dashboard loads
3. Test features:
   - Vaccinations
   - Milestones
   - Health Records
   - Go Green
   - Settings

### 3.4 Real-time Notifications

1. Go to `/dashboard/test-notifications`
2. Click "Test Notification"
3. Verify notification appears in bell icon

### 3.5 Admin Panel

1. Go to https://child-module.vercel.app/admin/login
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Test admin features

---

## Step 4: Production Checklist

### Security

- [ ] Change default admin password
- [ ] Update JWT_SECRET to a strong random string
- [ ] Verify CORS settings
- [ ] Enable HTTPS only
- [ ] Review API rate limits

### Payment

- [ ] Switch to Razorpay live keys (when ready)
- [ ] Set `PAYMENT_TEST_MODE=false`
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Test live payment flow

### Email & SMS

- [ ] Verify SMTP credentials
- [ ] Test email delivery
- [ ] Verify Twilio credentials
- [ ] Test SMS delivery
- [ ] Set `OTP_EMAIL_TEST_MODE=false`
- [ ] Set `OTP_SMS_TEST_MODE=false`

### Database

- [ ] Verify MongoDB Atlas connection
- [ ] Set up database backups
- [ ] Monitor database usage
- [ ] Review indexes

### Monitoring

- [ ] Set up Render alerts
- [ ] Monitor backend logs
- [ ] Monitor Vercel analytics
- [ ] Set up error tracking (optional: Sentry)

### Performance

- [ ] Test page load times
- [ ] Verify API response times
- [ ] Check WebSocket connections
- [ ] Test on mobile devices

---

## Troubleshooting

### Backend Issues

- **503 Error**: Backend is spinning up (free tier), wait 30-60 seconds
- **CORS Error**: Verify `APP_BASE_URL` in backend matches Vercel URL
- **Database Error**: Check MongoDB connection string

### Frontend Issues

- **API Errors**: Verify `NEXT_PUBLIC_API_URL` in Vercel
- **404 Error**: Check Root Directory is set to `frontend`
- **Build Error**: Review build logs in Vercel

### Payment Issues

- **Payment Fails**: Check Razorpay credentials
- **Webhook Error**: Configure webhook URL in Razorpay dashboard

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Next.js Docs**: https://nextjs.org/docs
- **Razorpay Docs**: https://razorpay.com/docs

---

## Summary

✅ All configurations are ready
✅ Backend configured for Render
✅ Frontend configured for Vercel
✅ Environment variables documented
✅ CORS properly configured
✅ Payment integration ready
✅ Real-time notifications configured

**Follow the steps above and your application will be fully deployed and functional!** 🎉
