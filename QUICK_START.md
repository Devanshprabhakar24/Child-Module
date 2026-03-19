# WombTo18 - Quick Start Guide

Complete setup guide for running the WombTo18 application on a new device.

## 📋 Prerequisites

Install these before starting:

1. **Node.js v18+** - https://nodejs.org/
2. **MongoDB Atlas Account** - https://www.mongodb.com/cloud/atlas (or local MongoDB)
3. **Code Editor** - VS Code recommended

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Configure Backend

Create `backend/.env`:

```env
# MongoDB (REQUIRED - Get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wombto18

# Email (REQUIRED - Use Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Cloudinary (REQUIRED - Get from cloudinary.com)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Test Mode Settings
OTP_TEST_MODE=false
PAYMENT_TEST_MODE=true
JWT_SECRET=wombto18-secret

# Razorpay (Optional for payments)
RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV
RAZORPAY_KEY_SECRET=ew1iBL70jaPnfoNO5bHW2Nu4

# MSG91 (Optional for SMS)
MSG91_AUTH_KEY=your-msg91-key
MSG91_SENDER_ID=WOMBTO

# Other
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_FROM=noreply@wombto18.com
APP_BASE_URL=http://localhost:3001
```

### Step 3: Configure Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV
```

### Step 4: Start Backend

```bash
cd backend
npm run build
npm run start:dev
```

✅ Backend running on: http://localhost:3000

### Step 5: Start Frontend

```bash
cd frontend
npm run dev
```

✅ Frontend running on: http://localhost:3001

## 🔑 Getting Required Credentials

### 1. MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Login
3. Create a free cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<username>` and `<password>` with your credentials
7. Add to `MONGODB_URI` in backend/.env

**Important**: Whitelist your IP

- Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

### 2. Gmail SMTP (Free)

1. Use your Gmail account
2. Enable 2-Step Verification: https://myaccount.google.com/security
3. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
4. Add to `SMTP_USER` and `SMTP_PASS` in backend/.env

### 3. Cloudinary (Free)

1. Sign up at https://cloudinary.com/
2. Go to Dashboard
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add to backend/.env

### 4. Razorpay (Optional - for payments)

1. Sign up at https://razorpay.com/
2. Use test credentials for development
3. Get from Dashboard → Settings → API Keys

### 5. MSG91 (Optional - for SMS)

1. Sign up at https://msg91.com/
2. Get Auth Key from dashboard
3. Whitelist your IP address

## 🧪 Test the Application

### Test Parent Flow:

1. Open http://localhost:3001/register
2. Register a child
3. Complete payment (test mode)
4. Login at http://localhost:3001/login
5. View dashboard

### Test Admin Flow:

1. Open http://localhost:3001/admin/login
2. Username: `admin`
3. Password: `admin123`
4. Manage vaccinations and children

## 📱 Test Credentials

### OTP (when OTP_TEST_MODE=true):

- Any email
- OTP: `123456`

### Admin Login:

- Username: `admin`
- Password: `admin123`

### Test Payment Card:

- Card: `4111 1111 1111 1111`
- CVV: `123`
- Expiry: Any future date

## 🐛 Common Issues

### Backend won't start:

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000  # Windows
lsof -ti:3000                 # Mac/Linux

# Kill the process or change port in src/main.ts
```

### Frontend won't start:

```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001  # Windows
lsof -ti:3001                 # Mac/Linux

# Or run on different port
npm run dev -- -p 3002
```

### MongoDB connection error:

- Check MONGODB_URI is correct
- Whitelist IP in MongoDB Atlas
- Check username/password

### Cannot upload images:

- Check Cloudinary credentials
- Restart backend after updating .env

### Email not sending:

- Check Gmail App Password (not regular password)
- Enable 2-Step Verification first
- Check SMTP settings

## 📁 Project Structure

```
wombto18/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── registration/# Child registration
│   │   ├── dashboard/   # Dashboard & vaccinations
│   │   ├── payments/    # Payment processing
│   │   └── notifications/# Email & SMS
│   ├── .env             # Backend config (create this)
│   └── SETUP.md         # Detailed backend setup
│
├── frontend/            # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/  # Parent dashboard
│   │   │   ├── admin/      # Admin panel
│   │   │   ├── login/      # Login pages
│   │   │   └── register/   # Registration
│   │   └── components/     # Reusable components
│   ├── .env.local       # Frontend config (create this)
│   └── SETUP.md         # Detailed frontend setup
│
└── QUICK_START.md       # This file
```

## 🎯 Key Features

### Parent Features:

- Child registration with payment
- OTP-based login
- Vaccination tracker
- Milestone tracking
- Profile management
- SMS/Email reminders

### Admin Features:

- View all children
- Manage vaccinations (mark done/undone)
- Delete children
- Export data to CSV
- System statistics

## 📚 Detailed Documentation

For more detailed setup instructions:

- Backend: See `backend/SETUP.md`
- Frontend: See `frontend/SETUP.md`

## 🆘 Need Help?

1. Check console logs for errors
2. Verify all .env variables are set
3. Ensure all services are running
4. Check network connectivity
5. Review detailed setup guides

## 🚢 Production Deployment

Before deploying to production:

1. Set `OTP_TEST_MODE=false`
2. Set `PAYMENT_TEST_MODE=false`
3. Use production MongoDB cluster
4. Use production Razorpay keys
5. Configure proper CORS
6. Use HTTPS
7. Set strong JWT_SECRET

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB Atlas account created
- [ ] Gmail App Password generated
- [ ] Cloudinary account created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] Backend running on :3000
- [ ] Frontend running on :3001
- [ ] Can access homepage
- [ ] Can register a child
- [ ] Can login as parent
- [ ] Can login as admin

---

**You're all set!** 🎉

- Parent Portal: http://localhost:3001
- Admin Portal: http://localhost:3001/admin/login
- Backend API: http://localhost:3000

Happy coding! 🚀
