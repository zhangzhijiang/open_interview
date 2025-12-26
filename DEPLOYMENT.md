# Deployment Guide

This guide explains how to build and deploy the application to `https://www.idatagear.com/interview`.

## Important Security Note

⚠️ **API Key Exposure**: Since this is a client-side React application, your `GEMINI_API_KEY` will be embedded in the JavaScript bundle and visible to anyone who views the page source. For production, consider:

1. **Recommended**: Create a backend proxy API that keeps the API key server-side
2. **Alternative**: Use API key restrictions in Google Cloud Console to limit usage by domain
3. **Current approach**: Accept that the key will be visible (only suitable if you trust your users and have proper API key restrictions)

## Build Steps

### 1. Set Production Environment Variable

For production build, you need to set the `GEMINI_API_KEY` environment variable. You can do this in several ways:

**Option A: Create `.env.production` file** (recommended for build scripts)

```bash
# .env.production
GEMINI_API_KEY=your_production_api_key_here
```

**Option B: Set environment variable during build** (recommended for CI/CD)

```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your_production_api_key_here"; npm run build

# Windows CMD
set GEMINI_API_KEY=your_production_api_key_here && npm run build

# Linux/Mac
GEMINI_API_KEY=your_production_api_key_here npm run build
```

### 2. Build the Application

Run the build command:

```bash
npm run build
```

This creates a `dist/` folder containing the production-ready static files.

### 3. Verify the Build

Before deploying, you can preview the production build locally:

```bash
npm run preview
```

Then visit `http://localhost:4173/interview/` to test.

## Deployment Options

### Option 1: Direct FTP/SFTP Upload (Traditional Web Hosting)

1. Upload the contents of the `dist/` folder to your web server
2. Place them in the `/interview/` directory on your server
3. Ensure your web server is configured to serve static files from that directory

**Server Configuration Example (Apache `.htaccess`):**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /interview/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /interview/index.html [L]
</IfModule>
```

**Server Configuration Example (Nginx):**

```nginx
location /interview/ {
  alias /var/www/idatagear.com/interview/;
  try_files $uri $uri/ /interview/index.html;
}
```

### Option 2: CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: npm run build

      - name: Deploy to server
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /interview/
```

### Option 3: Cloud Hosting (Vercel, Netlify, etc.)

**For Vercel:**

1. Install Vercel CLI: `npm i -g vercel`
2. Set environment variable in Vercel dashboard or during deployment:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

**For Netlify:**

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Set environment variable in Netlify dashboard: `GEMINI_API_KEY`
4. Base directory: Leave empty or set to `/` if deploying to root

Note: For cloud hosting, you'll need to configure the base path differently or use their routing rules.

## Firebase Configuration (Required for Authentication)

⚠️ **Important**: Before users can sign in with Google, you must add your domain to Firebase's authorized domains list:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`idatagear-open-interview`)
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add the following domains:
   - `www.idatagear.com`
   - `idatagear.com` (optional, if you want to support both with/without www)
6. Click **Done**

Without this configuration, users will see `auth/unauthorized-domain` errors when trying to sign in.

## Post-Deployment Checklist

- [ ] ✅ **Add deployment domain to Firebase authorized domains** (see above)
- [ ] Verify the app loads at `https://www.idatagear.com/interview/`
- [ ] Test that the API key is working (try starting an interview)
- [ ] Test Google sign-in authentication
- [ ] Check browser console for any errors
- [ ] Verify all static assets (CSS, JS, images) load correctly
- [ ] Test on different browsers and devices

## Troubleshooting

### 404 Errors on Refresh

If you get 404 errors when refreshing the page or navigating directly to routes, your server needs to be configured to serve `index.html` for all routes (see server configuration examples above).

### API Key Not Working

- Verify the environment variable was set during build
- Check that the API key is valid and not expired
- Ensure API key restrictions allow requests from `www.idatagear.com`

### Assets Not Loading

- Verify the `base: '/interview/'` setting in `vite.config.ts`
- Check that all assets are in the correct relative paths
- Clear browser cache and try again
- Remove any hardcoded CSS links from `index.html` (Vite injects CSS automatically)

### Firebase Authentication Errors

**Error: `auth/unauthorized-domain`**

- This means your domain is not authorized in Firebase Console
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add `www.idatagear.com` (and optionally `idatagear.com`) to the list
- Wait a few minutes for changes to propagate
- Clear browser cache and try again

## Next Steps: Secure API Key Handling (Recommended)

For better security, consider implementing a backend API:

1. Create a Node.js/Express backend
2. Store the API key only on the server
3. Create API endpoints that proxy requests to Gemini API
4. Call your backend API instead of directly calling Gemini from the frontend

This ensures the API key is never exposed to the client.
