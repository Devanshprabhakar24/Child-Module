# Frontend Deployment Guide - Vercel

## Prerequisites

- GitHub account
- Vercel account (https://vercel.com)
- Backend deployed on Render

## Deployment Steps

### 1. Update Environment Variables

Edit `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### 2. Push Code to GitHub

```bash
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.onrender.com`
   - Select all environments (Production, Preview, Development)

6. Click "Deploy"
7. Wait 2-3 minutes for deployment
8. Your site will be live at: `https://your-project.vercel.app`

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? wombto18-frontend
# - Directory? ./
# - Override settings? No
```

### 4. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `wombto18.com`)
3. Update DNS records as instructed:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. SSL certificate is automatically provisioned

### 5. Update Backend CORS

Update your backend `.env` on Render:

```
APP_BASE_URL=https://your-vercel-domain.vercel.app
```

Or for custom domain:

```
APP_BASE_URL=https://wombto18.com
```

Then redeploy the backend service.

### 6. Test Deployment

1. Visit your Vercel URL
2. Test registration flow
3. Test payment integration
4. Check all API calls work correctly

## Environment Variables

### Production Variables

```env
NEXT_PUBLIC_API_URL=https://wombto18-backend.onrender.com
```

### Preview/Development (Optional)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Vercel Features

### Automatic Deployments

- Every push to `main` branch triggers production deployment
- Pull requests get preview deployments
- Preview URLs: `https://your-project-git-branch.vercel.app`

### Analytics

- Enable Vercel Analytics in Project Settings
- Track page views, performance, and user behavior

### Performance Monitoring

- View Core Web Vitals
- Monitor build times
- Check deployment logs

### Edge Functions

- Automatically optimized for global CDN
- Fast response times worldwide
- Automatic caching

## Build Optimization

### Next.js Configuration

Check `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["res.cloudinary.com"], // Add Cloudinary domain
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
```

### Performance Tips

1. Use Next.js Image component for images
2. Enable SWC minification (already enabled)
3. Use dynamic imports for large components
4. Implement proper caching strategies

## Troubleshooting

### Build Fails

**Error: Module not found**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Environment variable not found**

- Check variable name starts with `NEXT_PUBLIC_`
- Verify variable is added in Vercel dashboard
- Redeploy after adding variables

### API Calls Fail

**CORS Error**

- Verify backend `APP_BASE_URL` matches frontend domain
- Check backend CORS configuration
- Ensure backend is running

**404 Not Found**

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is deployed and running
- Test backend URL directly: `curl https://backend-url.onrender.com`

### Slow Initial Load

**Render Free Tier Spin-down**

- Backend spins down after 15 minutes inactivity
- First request takes 30-60 seconds
- Solution: Upgrade to Render paid tier ($7/month)

**Large Bundle Size**

- Check bundle analyzer: `npm run build`
- Use dynamic imports for heavy components
- Optimize images and assets

### Preview Deployments Not Working

- Check GitHub integration is connected
- Verify branch protection rules
- Review deployment logs in Vercel dashboard

## Monitoring & Maintenance

### View Logs

```bash
# Install Vercel CLI
npm install -g vercel

# View logs
vercel logs your-deployment-url
```

### Redeploy

```bash
# Redeploy latest commit
vercel --prod

# Redeploy specific deployment
vercel redeploy deployment-url --prod
```

### Rollback

1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## Cost Estimation

### Vercel Pricing

- **Hobby (Free)**:
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Perfect for development/testing

- **Pro ($20/month)**:
  - 1TB bandwidth
  - Advanced analytics
  - Password protection
  - Team collaboration

### Recommended Setup

- Development: Vercel Hobby (Free)
- Production: Vercel Pro ($20/month)
- Backend: Render Starter ($7/month)
- **Total**: $27/month for production

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Vercel's environment variables
   - Rotate secrets regularly

2. **API Security**
   - Always use HTTPS
   - Implement rate limiting on backend
   - Validate all user inputs

3. **Authentication**
   - Use secure JWT tokens
   - Implement proper session management
   - Add CSRF protection

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Support: support@vercel.com
