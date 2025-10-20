# Netlify Deployment Guide

This guide will help you deploy the SACCO app to Netlify.

## Prerequisites

- Netlify account
- Backend API URL (production)
- Git repository (optional, but recommended)

## Deployment Steps

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize the site**:
   ```bash
   netlify init
   ```

4. **Set environment variables**:
   ```bash
   netlify env:set VITE_API_URL "https://your-backend-domain.com/api"
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Go to Netlify Dashboard**: https://app.netlify.com/

2. **Click "Add new site" → "Deploy manually"**

3. **Drag and drop the `dist` folder** after building:
   ```bash
   npm run build
   ```

4. **Set Environment Variables**:
   - Go to Site settings → Build & deploy → Environment
   - Add: `VITE_API_URL` = `https://your-backend-domain.com/api`

5. **Trigger a redeploy** if you uploaded before setting env variables

### Option 3: Deploy from Git Repository

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Netlify**:
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect your repository

3. **Configure build settings** (should be auto-detected from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**:
   - Go to Site settings → Build & deploy → Environment
   - Add: `VITE_API_URL` = `https://your-backend-domain.com/api`

5. **Deploy**

## Environment Variables

The app requires the following environment variable:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://api.yourdomain.com/api` |

**Important Notes:**
- In Vite, environment variables must be prefixed with `VITE_` to be exposed to the client
- The variable should include `/api` at the end
- Make sure your backend has CORS configured to allow requests from your Netlify domain

## Post-Deployment Checklist

- [ ] Verify the app loads correctly
- [ ] Test login functionality
- [ ] Verify API calls are working (check Network tab in DevTools)
- [ ] Test all major features (members, meetings, loans, etc.)
- [ ] Verify authentication and token refresh work properly
- [ ] Check that routing works (refresh page on different routes)

## Backend CORS Configuration

Make sure your Django backend allows requests from your Netlify domain. In `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-netlify-site.netlify.app",
    # Add your custom domain if you have one
    "https://yourdomain.com",
]

# Or for testing (NOT recommended for production):
# CORS_ALLOW_ALL_ORIGINS = True
```

Also ensure `CSRF_TRUSTED_ORIGINS` includes your frontend domain:

```python
CSRF_TRUSTED_ORIGINS = [
    "https://your-netlify-site.netlify.app",
    "https://yourdomain.com",
]
```

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS

## Troubleshooting

### API calls failing
- Check that `VITE_API_URL` is set correctly in Netlify
- Verify CORS is configured on backend
- Check browser console for errors

### 404 on page refresh
- Verify `netlify.toml` redirects are configured
- Check that the redirects section is properly set

### Environment variable not working
- Ensure variable is prefixed with `VITE_`
- Redeploy after setting environment variables
- Clear browser cache

## Files Added for Deployment

- `.env.example` - Template for environment variables
- `netlify.toml` - Netlify build configuration
- `DEPLOYMENT.md` - This guide

## Security Notes

- ✅ `.env` file is now gitignored (contains sensitive data)
- ✅ Use `.env.example` as a template (safe to commit)
- ✅ Set actual values in Netlify dashboard
- ⚠️ Never commit `.env` files to version control
