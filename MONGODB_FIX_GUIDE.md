# MongoDB Atlas Connection Fix Guide

## Issue
The application is experiencing a 500 Internal Server Error when accessing the `/api/leaderboard` endpoint due to MongoDB Atlas connection issues. The DNS lookup for the cluster is failing.

## Root Cause
The DNS resolution for `cluster0.kmmxzxb.mongodb.net` is failing, which indicates one of the following issues:

1. Incorrect cluster name
2. Cluster is paused
3. IP address not whitelisted
4. Incorrect credentials

## Solution Steps

### 1. Verify Cluster Status
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster
3. Ensure the cluster is running (not paused)
4. Verify the cluster name matches `cluster0.kmmxzxb`

### 2. Check IP Whitelist
1. In MongoDB Atlas, go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development, you can add your current IP or use `0.0.0.0/0` (allow all IPs)
4. For production, add only trusted IP addresses

### 3. Verify Database User Credentials
1. In MongoDB Atlas, go to **Database Access** in the left sidebar
2. Check that the user `anadi_sharma123` exists
3. Verify the password is correct
4. Ensure the user has read/write permissions to the `leaderboard` database

### 4. Test Connection String
1. In MongoDB Atlas, go to **Clusters**
2. Click **Connect** on your cluster
3. Select **Connect your application**
4. Copy the connection string and replace `<password>` with your actual password
5. Update your `.env.local` file with the correct connection string

### 5. Alternative Solutions

#### Option A: Use a Local MongoDB Instance
If you have MongoDB installed locally:
1. Install MongoDB: https://docs.mongodb.com/manual/installation/
2. Start MongoDB service
3. Update your `.env.local` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/leaderboard
   ```

#### Option B: Use a Different MongoDB Atlas Cluster
1. Create a new MongoDB Atlas cluster
2. Update your connection string in `.env.local`
3. Migrate your data if needed

### 6. Vercel Deployment Configuration
When deploying to Vercel:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add your `MONGODB_URI` as an environment variable
4. Make sure to use the production connection string

## Current Fallback Implementation
The application now includes an in-memory fallback for development:
- When MongoDB connection fails, the app uses in-memory storage
- This allows the application to function during development
- Data will not persist between server restarts with this fallback

## Testing the Fix
After implementing the fix:
1. Restart your development server
2. Test the `/api/leaderboard` endpoint
3. Verify that data can be retrieved and updated
4. Check the Vercel deployment logs for any connection errors

## Additional Resources
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Connection Troubleshooting: https://docs.mongodb.com/manual/tutorial/troubleshoot-connections/