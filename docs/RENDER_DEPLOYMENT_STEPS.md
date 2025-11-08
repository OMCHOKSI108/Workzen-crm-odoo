# 🎯 **RENDER BACKEND DEPLOYMENT GUIDE**

## ✅ **Frontend Already Deployed to Vercel!**
🔗 **Frontend URL:** https://workzen-5if8c7a3e-om-choksi-s-projects.vercel.app

---

## 🚀 **Now Deploy Backend to Render (Step by Step)**

### **Step 1: Go to Render.com**
1. Open: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended)

### **Step 2: Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. Connect your **GitHub repository**: `OMCHOKSI108/Workzen-crm-odoo`
3. Choose **this repository** from the list

### **Step 3: Configure Service**
Fill in these settings:

**Basic Info:**
- **Name:** `workzen-backend`
- **Region:** `Oregon (US West)`
- **Branch:** `master`
- **Root Directory:** `backend`

**Build & Deploy:**
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Pricing:**
- **Instance Type:** `Free` ✅

### **Step 4: Environment Variables**
Click **"Advanced"** and add these variables:

```
NODE_ENV=production
JWT_SECRET=workzen-super-secret-jwt-key-production-2024
PORT=10000
```

### **Step 5: Add Database**
1. Go to **Dashboard** → **"New +"** → **"PostgreSQL"**
2. **Name:** `workzen-database`
3. **Plan:** `Free` ✅
4. Click **"Create Database"**

### **Step 6: Connect Database**
1. Go back to your **Web Service**
2. Go to **"Environment"** tab
3. Add variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Copy from your PostgreSQL database's "External Database URL"

### **Step 7: Deploy!**
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend will be live at: `https://workzen-backend.onrender.com`

---

## 🔗 **Update Frontend to Use Backend**

Once backend is deployed, update the frontend environment:

1. Go to **Vercel Dashboard**
2. Find your **workzen-crm** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://workzen-backend.onrender.com/api`
5. **Redeploy** the frontend

---

## ✅ **Final URLs:**
- **Frontend:** https://workzen-5if8c7a3e-om-choksi-s-projects.vercel.app
- **Backend:** https://workzen-backend.onrender.com (after deployment)
- **API:** https://workzen-backend.onrender.com/api

---

## 🎉 **You'll Have:**
✅ **Live HRMS Application**  
✅ **Multi-tenant Support**  
✅ **User Authentication**  
✅ **Employee Management**  
✅ **Attendance Tracking**  
✅ **Leave Management**  
✅ **Dashboard Analytics**  
✅ **100% Free Hosting**  

---

## 💡 **Pro Tips:**
- Render free tier: Apps sleep after 15 min of inactivity
- First request may be slow (cold start)
- Database included: 1GB PostgreSQL free
- SSL certificates: Automatic HTTPS

**Need help?** All your code is ready - just follow the steps above!