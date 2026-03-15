# WombTo18 Backend Setup Guide

## Prerequisites

Before setting up the backend, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **MongoDB Atlas Account** (or local MongoDB)
   - Sign up at: https://www.mongodb.com/cloud/atlas

## Step 1: Clone/Copy the Project

```bash
# If using Git
git clone <repository-url>
cd backend

# Or simply copy the backend folder to your new device
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:

- NestJS framework
- MongoDB/Mongoose
- Cloudinary
- Nodemailer
- Razorpay
- And other dependencies

## Step 3: Configure Environment Variables

Create a `.env` file in the `backend` folder with the following configuration:

```env
# Test Environment Configuration
PAYMENT_TEST_MODE=true
OTP_TEST_MODE=false
OTP_TEST_CODE=123456
JWT_SECRET=wombto18-test-secret

# RazorPay
RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV
RAZORPAY_KEY_SECRET=ew1iBL70jaPnfoNO5bHW2Nu4
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/wombto18?retryWrites=true&w=majority

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@wombto18.com

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# MSG91 SMS Configuration
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_SENDER_ID=WOMBTO

# App Base URL
APP_BASE_URL=http://localhost:3001
```

### Important: Replace the following values:

1. **MongoDB URI**:
   - Go to MongoDB Atlas → Connect → Connect your application
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<cluster>` with your values

2. **Gmail SMTP**:
   - Use your Gmail address
   - Generate an App Password: Google Account → Security → 2-Step Verification → App passwords
   - Use the generated 16-character password

3. **Cloudinary**:
   - Sign up at: https://cloudinary.com/
   - Dashboard → Account Details
   - Copy Cloud Name, API Key, and API Secret

4. **MSG91** (Optional for SMS):
   - Sign up at: https://msg91.com/
   - Get your Auth Key from dashboard

## Step 4: Build the Project

```bash
npm run build
```

This compiles the TypeScript code to JavaScript in the `dist` folder.

## Step 5: Run the Backend

### Development Mode (with auto-reload):

```bash
npm run start:dev
```

### Production Mode:

```bash
npm run start:prod
```

The backend will start on: **http://localhost:8000**

## Step 6: Verify Installation

1. Open your browser and go to: `http://localhost:8000`
2. You should see the NestJS application running
3. Test an endpoint: `http://localhost:8000/auth/profile` (should return 401 Unauthorized - this is correct)

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error

**Error**: `MongooseServerSelectionError: Could not connect to any servers`

**Solution**:

- Check your MongoDB URI is correct
- Ensure your IP address is whitelisted in MongoDB Atlas:
  - MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

### Issue 2: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

Or change the port in `src/main.ts`:

```typescript
await app.listen(3001); // Change to different port
```

### Issue 3: Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Cloudinary Upload Fails

**Error**: `Must supply api_key`

**Solution**:

- Verify Cloudinary credentials in `.env`
- Restart the backend after updating `.env`

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication & user management
│   ├── registration/      # Child registration
│   ├── dashboard/         # Dashboard & vaccination tracking
│   ├── payments/          # Payment processing
│   ├── notifications/     # Email & SMS services
│   ├── reminders/         # Vaccination reminders
│   └── main.ts           # Application entry point
├── dist/                  # Compiled JavaScript (after build)
├── node_modules/          # Dependencies
├── .env                   # Environment variables (create this)
├── package.json           # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Available Scripts

```bash
# Development
npm run start:dev          # Start with auto-reload

# Production
npm run build             # Compile TypeScript
npm run start:prod        # Run compiled code

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode

# Linting
npm run lint              # Check code quality
```

## API Endpoints

Once running, the backend provides these main endpoints:

- `POST /auth/send-otp` - Send OTP for login
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/admin-login` - Admin login (username: admin, password: admin123)
- `POST /registration/register` - Register new child
- `GET /dashboard/family` - Get family dashboard
- `GET /dashboard/vaccination/:registrationId` - Get vaccination tracker
- `PATCH /dashboard/milestones/:milestoneId` - Update milestone status
- `GET /dashboard/admin/all-children` - Admin: Get all children
- `GET /dashboard/admin/stats` - Admin: Get statistics

## Database Collections

The backend uses these MongoDB collections:

- `users` - Parent/admin user accounts
- `child_registrations` - Child registration records
- `milestones` - Vaccination milestones
- `otp_records` - OTP verification records
- `payments` - Payment transactions
- `reminders` - Scheduled reminders

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong JWT_SECRET** in production
3. **Enable MongoDB IP whitelist** for production
4. **Use environment-specific credentials** (test vs production)
5. **Keep dependencies updated**: `npm audit fix`

## Production Deployment

For production deployment:

1. Set `OTP_TEST_MODE=false` in `.env`
2. Set `PAYMENT_TEST_MODE=false` for live payments
3. Use production MongoDB cluster
4. Use production Razorpay keys
5. Configure proper CORS settings
6. Use HTTPS for all endpoints
7. Set up proper logging and monitoring

## Support

For issues or questions:

- Check the logs in the console
- Review the `.env` configuration
- Ensure all services (MongoDB, Cloudinary, etc.) are accessible
- Verify network connectivity

## Next Steps

After backend is running:

1. Set up the frontend (see frontend/README.md)
2. Configure frontend API URL to point to backend
3. Test the complete flow: Registration → Payment → Dashboard
4. Set up admin panel access

---

**Backend is now ready!** 🚀

The backend should be running on http://localhost:3000
