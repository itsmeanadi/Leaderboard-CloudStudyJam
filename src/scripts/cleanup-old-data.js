require('dotenv').config({ path: '.env.local' });

const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard';
const DATABASE_NAME = 'leaderboard';

async function cleanupOldData() {
  console.log('Cleaning up old data...');
  
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    
    // Check if we're using MongoDB Atlas
    const isAtlas = MONGODB_URI.includes('mongodb.net');
    
    // Create a new MongoClient with proper options
    const clientOptions = {
      serverApi: isAtlas ? {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      } : undefined,
      connectTimeoutMS: 10000, // 10 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 20000, // 20 seconds
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 5, // Minimum number of connections in the connection pool
      // SSL options for Atlas
      tls: isAtlas,
      tlsInsecure: false,
      // Retry writes and read preferences
      retryWrites: true,
      readPreference: 'primary',
    };
    
    const client = new MongoClient(MONGODB_URI, clientOptions);
    
    console.log('Connecting to MongoDB server...');
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Select the database
    const db = client.db(DATABASE_NAME);
    console.log(`Selected database: ${DATABASE_NAME}`);
    
    // Collections
    const leaderboardCollection = db.collection('entries');
    const frozenUsersCollection = db.collection('frozenUsers');
    
    // Calculate the date 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    console.log(`Deleting data older than: ${twoDaysAgo.toISOString()}`);
    
    // Delete old leaderboard entries
    const deletedEntries = await leaderboardCollection.deleteMany({
      createdAt: { $lt: twoDaysAgo }
    });
    
    console.log(`Deleted ${deletedEntries.deletedCount} old leaderboard entries`);
    
    // Delete old frozen users
    const deletedFrozenUsers = await frozenUsersCollection.deleteMany({
      createdAt: { $lt: twoDaysAgo }
    });
    
    console.log(`Deleted ${deletedFrozenUsers.deletedCount} old frozen users`);
    
    console.log('Data cleanup completed successfully!');
    
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Run the function
cleanupOldData();