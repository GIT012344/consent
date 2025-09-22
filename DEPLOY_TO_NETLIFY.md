# 📚 Deploy to Netlify Guide

## 🚀 Quick Deploy (Manual)

### Step 1: Build Project
```bash
npm install
npm run build
```

### Step 2: Deploy to Netlify

#### Option A: Drag & Drop
1. Go to https://app.netlify.com
2. Login/Sign up
3. Drag the `build` folder to the deployment area

#### Option B: GitHub Integration
1. Push code to GitHub
2. In Netlify, click "New site from Git"
3. Connect to GitHub
4. Select repository: `GIT012344/Consect`
5. Build settings:
   - Base directory: `consent`
   - Build command: `npm run build`
   - Publish directory: `consent/build`

### Step 3: Environment Variables
In Netlify Dashboard > Site settings > Environment variables:

```
REACT_APP_API_URL = https://consent-backend-0wmk.onrender.com
NODE_ENV = production
GENERATE_SOURCEMAP = false
```

## 🔗 Database Connection
Backend API: `https://consent-backend-0wmk.onrender.com`
Database: PostgreSQL on Render
- Host: `dpg-d35njbripnbc739k71mg-a.singapore-postgres.render.com`
- Database: `consent_uw4t`
- User: `consent_user`

## ✅ Features Added
1. **Admin Button**: ปุ่ม Admin ที่มุมขวาบน ในทุกหน้า
2. **API Proxy**: Redirect API calls ผ่าน Netlify
3. **SPA Support**: รองรับ React Router

## 🎯 Test Links
- Homepage: `https://[your-site].netlify.app/`
- Admin: `https://[your-site].netlify.app/admin/dashboard`
- Consent Form: `https://[your-site].netlify.app/consent/customer?lang=th`

## 📝 Notes
- ระบบทำงานกับ Backend บน Render
- Database เชื่อมต่อผ่าน Backend API
- ไม่ต้องตั้งค่า Database connection ที่ Frontend
