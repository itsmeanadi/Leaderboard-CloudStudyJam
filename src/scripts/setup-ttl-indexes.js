require('dotenv').config({ path: '.env.local' });

const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard';
const DATABASE_NAME = 'leaderboard';

async function setupTTLIndexes() {
  console.log('Setting up TTL indexes...');
  
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
    
    // Create TTL indexes to automatically expire data after 2 days (172800 seconds)
    console.log('Creating TTL indexes...');
    
    // Drop existing indexes first (if any)
    try {
      await leaderboardCollection.dropIndex('createdAt_1');
      console.log('Dropped existing leaderboard TTL index');
    } catch (error) {
      console.log('No existing leaderboard TTL index to drop');
    }
    
    try {
      await frozenUsersCollection.dropIndex('createdAt_1');
      console.log('Dropped existing frozen users TTL index');
    } catch (error) {
      console.log('No existing frozen users TTL index to drop');
    }
    
    // Create new TTL indexes
    const ttlIndexOptions = { expireAfterSeconds: 172800 }; // 2 days = 172800 seconds
    
    await leaderboardCollection.createIndex({ createdAt: 1 }, ttlIndexOptions);
    console.log('Created TTL index for leaderboard entries (2 days)');
    
    await frozenUsersCollection.createIndex({ createdAt: 1 }, ttlIndexOptions);
    console.log('Created TTL index for frozen users (2 days)');
    
    console.log('TTL indexes setup completed successfully!');
    
    // Close the connection
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error setting up TTL indexes:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

// Run the function
setupTTLIndexes();