# Build, Deployment & Release Instructions

This document provides comprehensive instructions for building, deploying, and releasing the Open Interview application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Building for Production](#building-for-production)
5. [Deployment Methods](#deployment-methods)
6. [Release Process](#release-process)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

---

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js (or use yarn/pnpm)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with TypeScript extensions)

### Required Accounts & Services
- **Google Cloud Platform Account**: For Gemini API key
- **Firebase Account**: For authentication and Firestore database
- **Web Hosting**: Server/cloud hosting for production deployment

### Required API Keys & Configuration

1. **Gemini API Key**:
   - Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Required for AI interviews and evaluation reports

2. **Firebase Configuration**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Anonymous & Google Sign-In)
   - Create Firestore database
   - Get configuration values (see `.env.local` structure below)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd open_interview
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important**: 
- `.env.local` is gitignored - never commit API keys
- Use `VITE_` prefix for variables exposed to client-side code
- For production builds, see [Building for Production](#building-for-production)

### 4. Firebase Setup

#### Enable Authentication Methods

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable **Anonymous** authentication
3. Enable **Google** authentication:
   - Add project support email
   - Configure OAuth consent screen (if needed)

#### Configure Authorized Domains (Required for Production)

**Important**: Before deploying, add your production domain to Firebase authorized domains:

1. Go to Firebase Console > Authentication > Settings > **Authorized domains**
2. Click **Add domain**
3. Add your deployment domain (e.g., `www.idatagear.com`)
4. Optionally add domain without www (e.g., `idatagear.com`)
5. Click **Done**

Without this, users will see `auth/unauthorized-domain` errors when trying to sign in with Google.

#### Configure Firestore

1. Go to Firebase Console > Firestore Database
2. Create database (start in test mode for development)
3. Set up security rules (production example):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Enable Offline Persistence

Offline persistence is automatically enabled in the code (`services/firebase/config.ts`). No additional configuration needed.

---

## Local Development

### Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Local**: `http://localhost:3000/interview/`
- **Network**: Accessible on your local network at `http://<your-ip>:3000/interview/`

### Development Features

- **Hot Module Replacement (HMR)**: Code changes reflect immediately
- **Type Checking**: TypeScript errors shown in console
- **Source Maps**: Easier debugging
- **Auto-reload**: Browser refreshes on file changes

### Testing Checklist

Before building for production, test:

- [ ] User can sign in (Anonymous and Google)
- [ ] User profile loads and saves correctly
- [ ] Jobs display properly
- [ ] Interview session connects successfully
- [ ] Evaluation report generates after interview
- [ ] Interview history saves correctly
- [ ] BYOK (Bring Your Own Key) feature works
- [ ] Timer works correctly (starts after connection)
- [ ] Camera and microphone permissions work
- [ ] Mobile responsiveness

---

## Building for Production

### 1. Set Production Environment Variables

You have two options:

#### Option A: `.env.production` File (Recommended for CI/CD)

Create `.env.production` in project root:

```env
GEMINI_API_KEY=your_production_api_key
VITE_FIREBASE_API_KEY=your_production_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Option B: Environment Variables in Shell (Recommended for Manual Builds)

**Windows PowerShell**:
```powershell
$env:GEMINI_API_KEY="your_production_api_key"
$env:VITE_FIREBASE_API_KEY="your_production_firebase_api_key"
# ... set other variables
npm run build
```

**Windows CMD**:
```cmd
set GEMINI_API_KEY=your_production_api_key
set VITE_FIREBASE_API_KEY=your_production_firebase_api_key
# ... set other variables
npm run build
```

**Linux/Mac**:
```bash
export GEMINI_API_KEY="your_production_api_key"
export VITE_FIREBASE_API_KEY="your_production_firebase_api_key"
# ... set other variables
npm run build
```

### 2. Build the Application

```bash
npm run build
```

This command:
- Compiles TypeScript to JavaScript
- Bundles all assets
- Minifies code for production
- Generates source maps (for debugging)
- Outputs to `dist/` directory

### 3. Verify Build Output

The `dist/` folder should contain:
```
dist/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   ├── index-[hash].css
  │   └── ...
  └── manifest.json (if exists)
```

### 4. Preview Production Build Locally

Before deploying, preview the production build:

```bash
npm run preview
```

Visit `http://localhost:4173/interview/` to test.

**Important**: Test thoroughly:
- Verify API keys work
- Test all authentication flows
- Confirm Firebase connectivity
- Test interview session
- Verify evaluation reports generate

---

## Deployment Methods

### Method 1: Traditional Web Server (FTP/SFTP)

#### Step 1: Prepare Files
Upload all contents of the `dist/` folder to your web server.

#### Step 2: Server Configuration

**Apache (.htaccess)**:
Create/update `.htaccess` in the deployment directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /interview/
  
  # Handle Angular and React Router
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /interview/index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Nginx**:
Add to your Nginx configuration:

```nginx
location /interview/ {
  alias /var/www/idatagear.com/interview/;
  try_files $uri $uri/ /interview/index.html;
  
  # Enable gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
  
  # Cache static assets
  location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

#### Step 3: Upload Files

Using FTP/SFTP client:
1. Connect to your server
2. Navigate to web root directory
3. Create `interview/` folder (if doesn't exist)
4. Upload all files from `dist/` to `interview/`

### Method 2: Cloud Hosting Platforms

#### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add VITE_FIREBASE_API_KEY
   # ... add all Firebase variables
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

5. **Configure Base Path**:
   - In Vercel dashboard, set base path to `/interview`
   - Or update `vite.config.ts` base path for Vercel

#### Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Set Environment Variables** (in Netlify dashboard or CLI):
   ```bash
   netlify env:set GEMINI_API_KEY "your_key"
   netlify env:set VITE_FIREBASE_API_KEY "your_key"
   # ... set all variables
   ```

5. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

#### GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to `package.json`**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

**Note**: GitHub Pages requires base path configuration and API key handling through build-time environment variables.

### Method 3: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
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

**Configure GitHub Secrets**:
- Go to repository Settings > Secrets and variables > Actions
- Add all required secrets (API keys, FTP credentials, etc.)

---

## Release Process

### Version Management

Update version in `package.json`:
```json
{
  "version": "1.0.0"
}
```

### Pre-Release Checklist

- [ ] All tests pass locally
- [ ] Production build succeeds without errors
- [ ] All environment variables configured
- [ ] Firebase rules updated for production
- [ ] API key restrictions configured (see Security)
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Changelog updated

### Release Steps

1. **Update Version**:
   ```bash
   # Update version in package.json
   npm version patch  # or minor, major
   ```

2. **Create Release Branch**:
   ```bash
   git checkout -b release/v1.0.0
   ```

3. **Build and Test**:
   ```bash
   npm run build
   npm run preview
   # Test thoroughly
   ```

4. **Merge to Main**:
   ```bash
   git checkout main
   git merge release/v1.0.0
   git push origin main
   ```

5. **Tag Release**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

6. **Deploy**:
   - If using CI/CD, deployment triggers automatically
   - If manual, follow deployment method above

7. **Post-Deployment Verification**:
   - [ ] Application loads at production URL
   - [ ] Authentication works
   - [ ] Interviews connect successfully
   - [ ] Evaluation reports generate
   - [ ] No console errors
   - [ ] All features functional

### Rollback Procedure

If issues are found after deployment:

1. **Immediate Rollback**:
   - Restore previous version from backup
   - Or revert Git commit and redeploy

2. **Hotfix Process**:
   ```bash
   git checkout -b hotfix/critical-fix
   # Make fixes
   git commit -m "Fix: description"
   git checkout main
   git merge hotfix/critical-fix
   # Deploy
   ```

---

## Troubleshooting

### Build Issues

#### "Cannot find module" errors
- **Solution**: Delete `node_modules` and `package-lock.json`, then `npm install`

#### TypeScript errors
- **Solution**: Run `npm run build` to see full error messages
- Check `tsconfig.json` configuration

#### Environment variables not loading
- **Solution**: Ensure `VITE_` prefix for client-side variables
- Restart dev server after changing `.env.local`
- For production, set variables before build command

### Deployment Issues

#### 404 Errors on Refresh
- **Cause**: Server not configured for SPA routing
- **Solution**: Configure server to serve `index.html` for all routes (see server config above)

#### API Key Not Working
- **Solution**: 
  - Verify environment variable set during build
  - Check API key restrictions in Google Cloud Console
  - Ensure key is valid and not expired
  - Check browser console for errors

#### Assets Not Loading (404s)
- **Solution**:
  - Verify `base: '/interview/'` in `vite.config.ts`
  - Check asset paths in build output
  - Clear browser cache
  - Verify server serves static files correctly

#### Firebase Connection Errors
- **Solution**:
  - Verify Firebase config variables in environment
  - Check Firebase project is active
  - Verify authentication methods enabled
  - Check Firestore rules allow access

#### Firebase Authentication: `auth/unauthorized-domain` Error
- **Cause**: Your deployment domain is not authorized in Firebase Console
- **Solution**:
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Select your project
  3. Go to **Authentication** → **Settings** → **Authorized domains**
  4. Click **Add domain**
  5. Add your deployment domain (e.g., `www.idatagear.com`)
  6. Optionally add domain without www (e.g., `idatagear.com`)
  7. Click **Done**
  8. Wait a few minutes for changes to propagate
  9. Clear browser cache and try again

#### CORS Errors
- **Solution**:
  - Configure CORS on your server
  - Add Firebase domains to allowed origins
  - Check API key restrictions allow your domain

### Runtime Issues

#### Interview Won't Connect
- **Check**: 
  - API key is valid
  - Browser permissions (camera/microphone)
  - Network connectivity
  - Browser console for errors

#### Timer Starts Before Connection
- **Status**: Fixed - timer now starts only after successful connection
- **If still happens**: Check `isConnected` state logic

#### Interview History Not Saving
- **Check**:
  - Firebase authentication is working
  - Firestore rules allow write access
  - Network connectivity
  - Browser console for errors

---

## Security Considerations

### API Key Security

⚠️ **IMPORTANT**: Since this is a client-side React application, API keys are embedded in the JavaScript bundle and visible to anyone.

#### Current Approach (Acceptable for MVP)
- API keys are in client-side code
- Suitable if you trust users and have proper restrictions

#### Recommended Improvements

1. **API Key Restrictions** (Minimum):
   - In Google Cloud Console, restrict API key to:
     - Specific HTTP referrers (your domain)
     - Specific APIs (only Gemini API)
   - Set usage quotas and limits

2. **Backend Proxy** (Recommended for Production):
   - Create Node.js/Express backend
   - Store API keys server-side only
   - Create API endpoints that proxy requests to Gemini
   - Frontend calls your backend, not Gemini directly

   Example structure:
   ```
   Frontend → Your Backend API → Gemini API
   ```

3. **Environment Variable Best Practices**:
   - Never commit `.env.local` or `.env.production`
   - Use secrets management in CI/CD
   - Rotate keys regularly
   - Use different keys for dev/staging/production

### Firebase Security Rules

**Production Firestore Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### HTTPS Requirement

- **Always use HTTPS in production**
- Required for:
  - WebRTC (camera/microphone)
  - Secure authentication
  - API key transmission
  - Firebase connections

### Content Security Policy

Consider adding CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline';
```

---

## Performance Optimization

### Build Optimizations

- Vite automatically:
  - Code splitting
  - Tree shaking
  - Minification
  - Asset optimization

### Runtime Optimizations

- Lazy load components where possible
- Optimize images and assets
- Enable browser caching (see server config)
- Use CDN for static assets if needed

### Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Firebase Analytics, Google Analytics)
- Performance monitoring
- API usage tracking

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [React Documentation](https://react.dev/)

---

## Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check GitHub issues
4. Contact development team

