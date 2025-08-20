# 🚀 Deployment Guide

คู่มือการ Deploy Consent Management System Frontend

## 📋 Pre-deployment Checklist

### 1. ตรวจสอบการตั้งค่า
- [ ] Backend API ทำงานปกติ
- [ ] Environment variables ถูกต้อง
- [ ] Build ผ่านโดยไม่มี error
- [ ] ทดสอบ functionality ครบถ้วน

### 2. การตั้งค่า Environment
```bash
# สร้างไฟล์ .env สำหรับ production
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_NAME=Consent Management System
REACT_APP_VERSION=1.0.0
```

## 🏗️ Build Process

### 1. Build for Production
```bash
# ติดตั้ง dependencies
npm install

# Build application
npm run build
```

### 2. ตรวจสอบ Build
```bash
# ทดสอบ build locally
npx serve -s build -l 3001
```

## 🌐 Deployment Options

### Option 1: Netlify (แนะนำ)

#### A. Deploy ผ่าน Git
1. Push code ไป GitHub/GitLab
2. เชื่อมต่อ repository กับ Netlify
3. ตั้งค่า build command:
   ```
   Build command: npm run build
   Publish directory: build
   ```
4. ตั้งค่า Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-api.com/api
   ```

#### B. Deploy ผ่าน CLI
```bash
# ติดตั้ง Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

### Option 2: Vercel

#### A. Deploy ผ่าน Git
1. Push code ไป GitHub/GitLab
2. เชื่อมต่อ repository กับ Vercel
3. Vercel จะ auto-detect React app
4. ตั้งค่า Environment Variables

#### B. Deploy ผ่าน CLI
```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: AWS S3 + CloudFront

#### 1. สร้าง S3 Bucket
```bash
# สร้าง bucket
aws s3 mb s3://your-consent-app

# Enable static website hosting
aws s3 website s3://your-consent-app --index-document index.html --error-document index.html
```

#### 2. Upload Files
```bash
# Upload build files
aws s3 sync build/ s3://your-consent-app --delete
```

#### 3. Setup CloudFront
- สร้าง CloudFront distribution
- ตั้งค่า origin เป็น S3 bucket
- ตั้งค่า error pages สำหรับ SPA routing

### Option 4: GitHub Pages

#### 1. ติดตั้ง gh-pages
```bash
npm install --save-dev gh-pages
```

#### 2. เพิ่ม scripts ใน package.json
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  },
  "homepage": "https://yourusername.github.io/consent-frontend"
}
```

#### 3. Deploy
```bash
npm run deploy
```

## ⚙️ Configuration

### 1. Environment Variables
```env
# Required
REACT_APP_API_URL=https://api.yourbackend.com/api

# Optional
REACT_APP_GA_TRACKING_ID=GA_TRACKING_ID
REACT_APP_SENTRY_DSN=YOUR_SENTRY_DSN
```

### 2. Build Optimization
```json
// package.json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
  }
}
```

## 🔒 Security Configuration

### 1. Content Security Policy
เพิ่มใน `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' fonts.googleapis.com;
  font-src 'self' fonts.gstatic.com;
  img-src 'self' data:;
  connect-src 'self' https://your-backend-api.com;
">
```

### 2. HTTPS Redirect
สำหรับ Netlify, สร้างไฟล์ `public/_redirects`:
```
# HTTPS Redirect
http://yourdomain.com/* https://yourdomain.com/:splat 301!

# SPA Fallback
/*    /index.html   200
```

## 📊 Performance Optimization

### 1. Bundle Analysis
```bash
# วิเคราะห์ bundle size
npm run build:analyze
```

### 2. Code Splitting
แอปได้ใช้ React.lazy และ Suspense แล้ว

### 3. Image Optimization
- ใช้ WebP format สำหรับรูปภาพ
- Lazy loading สำหรับรูปภาพ

## 🔍 Monitoring

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/react @sentry/tracing
```

### 2. Analytics (Google Analytics)
```bash
npm install react-ga4
```

## 🚨 Troubleshooting

### 1. Build Errors
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated
```

### 2. Runtime Errors
- ตรวจสอบ Console logs
- ตรวจสอบ Network requests
- ตรวจสอบ CORS settings

### 3. Performance Issues
- ใช้ React DevTools Profiler
- ตรวจสอบ bundle size
- Optimize images และ assets

## 📝 Deployment Checklist

### Pre-deployment
- [ ] Code review completed
- [ ] Tests passing
- [ ] Build successful
- [ ] Environment variables set
- [ ] Backend API accessible

### Post-deployment
- [ ] Application loads correctly
- [ ] All features working
- [ ] Forms submitting properly
- [ ] API calls successful
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Error tracking active

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './build'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📞 Support

หากมีปัญหาในการ Deploy:
- ตรวจสอบ logs ของ hosting provider
- ตรวจสอบ browser console
- ติดต่อทีม DevOps หรือ Backend team

**Happy Deploying! 🚀**
