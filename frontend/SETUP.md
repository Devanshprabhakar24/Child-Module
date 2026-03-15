# WombTo18 Frontend Setup Guide

## Prerequisites

Before setting up the frontend, ensure you have:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **npm** (comes with Node.js)
   - Verify: `npm --version`

3. **Backend running** on http://localhost:3000
   - See backend/SETUP.md for backend setup

## Step 1: Clone/Copy the Project

```bash
# If using Git
git clone <repository-url>
cd frontend

# Or simply copy the frontend folder to your new device
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install:

- Next.js 15
- React 19
- TailwindCSS
- Lucide Icons
- And other dependencies

## Step 3: Configure Environment Variables

Create a `.env.local` file in the `frontend` folder:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# Razorpay (for payment integration)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SQSUtij8FkBpFV

# Cloudinary (optional - for direct uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Important Notes:

1. **NEXT_PUBLIC_API_URL**: Must match your backend URL
   - Local development: `http://localhost:3000`
   - Production: Your deployed backend URL

2. **NEXT_PUBLIC_RAZORPAY_KEY_ID**: Get from Razorpay dashboard
   - Test mode: `rzp_test_...`
   - Live mode: `rzp_live_...`

## Step 4: Run the Frontend

### Development Mode (with hot reload):

```bash
npm run dev
```

The frontend will start on: **http://localhost:3001**

### Production Build:

```bash
npm run build
npm run start
```

## Step 5: Verify Installation

1. Open browser: `http://localhost:3001`
2. You should see the WombTo18 homepage
3. Test navigation:
   - `/login` - Parent login page
   - `/register` - Child registration
   - `/admin/login` - Admin login (username: admin, password: admin123)

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Homepage
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration flow
│   │   ├── dashboard/         # Parent dashboard
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── vaccinations/  # Vaccination tracker
│   │   │   ├── settings/      # Settings page
│   │   │   └── layout.tsx     # Dashboard layout
│   │   └── admin/             # Admin panel
│   │       ├── login/         # Admin login
│   │       ├── page.tsx       # Admin dashboard
│   │       ├── vaccinations/  # Manage vaccinations
│   │       ├── children/      # Manage children
│   │       └── layout.tsx     # Admin layout
│   ├── components/            # Reusable components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── login/             # Login components
│   │   └── register/          # Registration components
│   └── hooks/                 # Custom React hooks
│       └── useChildData.ts    # Fetch child data
├── public/                    # Static assets
├── .env.local                 # Environment variables (create this)
├── package.json              # Dependencies
├── tailwind.config.ts        # TailwindCSS config
└── next.config.ts            # Next.js config
```

## Available Pages

### Public Pages:

- `/` - Homepage
- `/login` - Parent login
- `/register` - Child registration
- `/admin/login` - Admin login

### Parent Dashboard (requires login):

- `/dashboard` - Dashboard home
- `/dashboard/vaccinations` - Vaccination tracker
- `/dashboard/milestones` - Developmental milestones
- `/dashboard/records` - Health records
- `/dashboard/settings` - Profile settings

### Admin Panel (requires admin login):

- `/admin` - Admin dashboard
- `/admin/vaccinations` - Manage all vaccinations
- `/admin/children` - Manage all children (view, delete, export CSV)
- `/admin/reports` - Reports (coming soon)
- `/admin/settings` - Admin settings (coming soon)

## Common Issues & Solutions

### Issue 1: Cannot Connect to Backend

**Error**: `Failed to fetch` or `Network error`

**Solution**:

- Ensure backend is running on http://localhost:3000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in backend

### Issue 2: Port Already in Use

**Error**: `Port 3001 is already in use`

**Solution**:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

Or change port:

```bash
npm run dev -- -p 3002
```

### Issue 3: Module Not Found

**Error**: `Cannot find module 'xyz'`

**Solution**:

```bash
rm -rf node_modules .next package-lock.json
npm install
```

### Issue 4: Razorpay Not Loading

**Error**: Payment modal doesn't open

**Solution**:

- Check `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env.local`
- Ensure Razorpay script is loaded (check browser console)
- Verify backend payment endpoint is working

### Issue 5: Images Not Loading

**Error**: Profile pictures not displaying

**Solution**:

- Check Cloudinary configuration in backend
- Verify image URLs are accessible
- Check browser console for CORS errors

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
```

## User Flows

### Parent Registration Flow:

1. Go to `/register`
2. Fill Step 1: Child details
3. Fill Step 2: Parent details
4. Fill Step 3: Payment (test mode)
5. Redirected to `/dashboard`

### Parent Login Flow:

1. Go to `/login`
2. Choose login method:
   - Registration ID + Email + OTP
   - Email + OTP only
3. Enter OTP (test mode: 123456)
4. Redirected to `/dashboard`

### Admin Login Flow:

1. Go to `/admin/login`
2. Username: `admin`
3. Password: `admin123`
4. Redirected to `/admin`

## Testing Credentials

### Test Parent Account:

- Email: Any email you registered with
- OTP: `123456` (when OTP_TEST_MODE=true in backend)

### Admin Account:

- Username: `admin`
- Password: `admin123`

### Test Payment:

- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

## Styling & Customization

The app uses TailwindCSS for styling:

### Primary Color:

Defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: '#10b981', // Green
}
```

### Fonts:

- Display: Inter (headings, UI)
- Body: System fonts

### Responsive Breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Environment-Specific Configuration

### Development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
```

## Performance Optimization

The app includes:

- Server-side rendering (SSR)
- Image optimization with Next.js Image
- Code splitting
- Lazy loading components
- Caching strategies

## Security Features

- JWT token authentication
- Role-based access control (Parent/Admin)
- Secure payment integration
- XSS protection
- CSRF protection

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness

All pages are fully responsive:

- Mobile-first design
- Touch-friendly UI
- Optimized for small screens
- Hamburger menu on mobile

## Deployment

### Vercel (Recommended):

```bash
npm install -g vercel
vercel
```

### Other Platforms:

```bash
npm run build
# Deploy the .next folder
```

## Troubleshooting Checklist

- [ ] Backend is running on correct port
- [ ] `.env.local` file exists with correct values
- [ ] Dependencies are installed (`npm install`)
- [ ] No port conflicts
- [ ] Browser cache cleared
- [ ] Console shows no errors

## Next Steps

After frontend is running:

1. Test parent registration flow
2. Test parent login
3. Test admin login
4. Verify vaccination tracker works
5. Test profile picture upload
6. Test CSV export in admin panel

---

**Frontend is now ready!** 🎉

The application should be running on http://localhost:3001

**Quick Links:**

- Parent Login: http://localhost:3001/login
- Admin Login: http://localhost:3001/admin/login
- Register Child: http://localhost:3001/register
