# GDGoC IET Study Jam Leaderboard

A leaderboard application built with Next.js for tracking Google Cloud Study Jam participants.

## Features

- Admin dashboard for uploading CSV data
- Google Sheets integration
- Responsive design for mobile and desktop
- Dark/light theme toggle
- Search and sorting functionality
- Participant statistics

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd leaderboard-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_ADMIN_USERNAME=admin
   NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Sign up at [Vercel](https://vercel.com)
3. Create a new project and import your GitHub repository
4. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_ADMIN_USERNAME` - Your admin username
   - `NEXT_PUBLIC_ADMIN_PASSWORD` - Your admin password
   - `MONGODB_URI` - Your MongoDB connection string (for MongoDB Atlas or other cloud MongoDB services)
5. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
6. Deploy!

### Environment Variables

For production deployment, you should set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_ADMIN_USERNAME=your_admin_username
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_admin_password
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leaderboard
```

Note: Environment variables prefixed with `NEXT_PUBLIC_` will be embedded into the browser bundle and are visible to the client. For sensitive data, use environment variables without this prefix.

### MongoDB Configuration

For production, it's recommended to use a cloud MongoDB service like MongoDB Atlas rather than a local database.

To use MongoDB Atlas:

1. Log in to your MongoDB Atlas account
2. Select your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string and replace `<password>` with your actual password
6. Replace `<dbname>` with your database name (e.g., `leaderboard`)
7. Update the `MONGODB_URI` environment variable with your MongoDB Atlas connection string
8. Make sure your IP address is whitelisted in MongoDB Atlas
9. Ensure your database user has read/write permissions

Example connection string:
```
MONGODB_URI=mongodb+srv://anadisharma44_db_user:your_password@your-cluster-name.mongodb.net/leaderboard?retryWrites=true&w=majority&appName=Cluster0
```

### SSL/TLS Connection Issues

If you encounter SSL/TLS connection errors:

1. Ensure your system has the latest certificates
2. Update your Node.js to the latest LTS version
3. Try connecting with relaxed SSL settings for testing (NOT recommended for production)
4. Check your firewall settings
5. Verify your system's OpenSSL configuration

## Usage

### Admin Access

1. Click "Admin Login" button
2. Enter credentials (default: admin / your_secure_password)
3. Upload CSV data or connect to Google Sheets

### CSV Format

Your CSV should include at minimum:
- "User Name"
- "User Email"

Optional columns:
- "rank"
- "# of Skill Badges Completed"
- "# of Arcade Games Completed"
- "All Skill Badges & Games Completed"
- "Google Cloud Skills Boost Profile URL"

## Customization

### Changing Admin Credentials

Update the environment variables:
- `NEXT_PUBLIC_ADMIN_USERNAME`
- `NEXT_PUBLIC_ADMIN_PASSWORD`

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.