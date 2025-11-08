# 🎨 WorkZen HRMS - Render Deployment Guide

## Free Render Deployment

### 1. Render Configuration

#### Backend Service (render-backend.yaml)
```yaml
services:
  - type: web
    name: workzen-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: MONGODB_URI
        fromDatabase:
          name: workzen-mongodb
          property: connectionString
    healthCheckPath: /api/health
```

#### Frontend Service  
```yaml
  - type: web
    name: workzen-frontend
    env: static
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: frontend/dist
    routes:
      - type: rewrite
        source: /api/*
        destination: https://workzen-backend.onrender.com/api/*
```

### 2. MongoDB Database
```yaml
databases:
  - name: workzen-mongodb
    plan: free
    databaseName: workzen_hrms
```

### 3. Deployment Steps

1. **Push to GitHub**
2. **Go to Render.com** and sign up
3. **Create Web Service** 
   - Connect GitHub repo
   - Choose "Web Service"
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
4. **Add MongoDB**
   - Create new PostgreSQL/MongoDB database
   - Copy connection string to backend env vars
5. **Deploy Frontend**
   - Create new "Static Site"
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

### 4. Environment Variables (Backend)
```
NODE_ENV=production
JWT_SECRET=your-secret-here
MONGODB_URI=mongodb://...from-render-database
PORT=10000
```

## 💰 Render Free Tier:
- ✅ 750 hours/month compute
- ✅ Free SSL certificates
- ✅ Custom domains
- ❌ Apps sleep after 15 min inactivity
- ❌ 500MB RAM limit

Your app: `https://workzen-backend.onrender.com`