# Deployment Guide for WorkZen HRMS

## Overview
This guide covers deploying the WorkZen HRMS application with:
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Node.js + Express)
- **Database**: MongoDB Atlas (Cloud)

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **MongoDB Atlas Account**: Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
4. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Setup MongoDB Atlas

1. Create a new cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
4. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
   ```

## Step 2: Deploy Backend to Render

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the backend folder if needed

2. **Configure Service**:
   - **Name**: `workzen-hrms-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if applicable)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   CORS_ORIGIN=https://your-frontend-app.vercel.app
   ```

4. **Deploy**: Click "Create Web Service"

## Step 3: Deploy Frontend to Vercel

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the frontend folder if needed

2. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if applicable)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   VITE_APP_NAME=WorkZen HRMS
   VITE_APP_VERSION=1.0.0
   ```

4. **Deploy**: Click "Deploy"

## Step 4: Update CORS Settings

After both deployments:

1. **Update Backend Environment**:
   - Go to Render → Your Service → Environment
   - Update `CORS_ORIGIN` with your Vercel URL:
     ```
     CORS_ORIGIN=https://your-frontend-app.vercel.app
     ```

2. **Redeploy Backend**: Render will automatically redeploy

## Step 5: Seed Database (Optional)

1. **Connect to your deployed backend**:
   ```bash
   # Update the MongoDB URI in seedDatabase.js
   # Then run locally pointing to production database
   cd backend/scripts
   node seedDatabase.js
   ```

## Step 6: Test Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test API endpoints at your Render URL
3. **Login**: Use seeded admin credentials or create new account

## Environment Variables Reference

### Backend (.env.production)
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hrms
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_APP_NAME=WorkZen HRMS
VITE_APP_VERSION=1.0.0
```

## Local Development with Docker

For local development and testing:

```bash
# Clone repository
git clone <your-repo-url>
cd odoo

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Verify `CORS_ORIGIN` matches your frontend URL exactly
   - Check for trailing slashes

2. **Database Connection**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **API Not Found**:
   - Verify `VITE_API_URL` points to correct backend URL
   - Check if backend service is running

4. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Review build logs for specific errors

## Security Notes

1. **JWT Secret**: Use a strong, random secret (32+ characters)
2. **Environment Variables**: Never commit secrets to git
3. **Database**: Use MongoDB Atlas for production (not local MongoDB)
4. **HTTPS**: Both Vercel and Render provide HTTPS by default

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Login functionality works
- [ ] All pages accessible
- [ ] API calls successful
- [ ] Database operations working
- [ ] Currency settings functional
- [ ] Error handling working
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] Security headers present

## Support

For deployment issues:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Render**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)