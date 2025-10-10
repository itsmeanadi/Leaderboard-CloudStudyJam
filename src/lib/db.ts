import { MongoClient, Db, ServerApiVersion } from 'mongodb';

// MongoDB connection URI - replace with your actual MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard';

// Database and collection names
const DATABASE_NAME = 'leaderboard';
const COLLECTION_NAME = 'entries';
const FROZEN_USERS_COLLECTION = 'frozenUsers';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  // Use cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Create a new MongoClient with proper options for production
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000, // 10 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 20000, // 20 seconds
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 5, // Minimum number of connections in the connection pool
      // SSL options to handle TLS issues
      tls: true,
      tlsInsecure: false,
      // Additional options for SSL compatibility
      tlsCAFile: process.env.MONGODB_TLS_CA_FILE,
      // Retry writes and read preferences
      retryWrites: true,
      readPreference: 'primary',
    });
    
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Select the database
    const db = client.db(DATABASE_NAME);
    
    // Cache the client and db for future use
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error(`Failed to connect to database: ${error.message || 'Unknown error'}`);
  }
}

export async function getLeaderboardCollection() {
  const { db } = await connectToDatabase();
  return db.collection(COLLECTION_NAME);
}

export async function getFrozenUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection(FROZEN_USERS_COLLECTION);
}

export async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase();
    
    // Create indexes for better query performance
    const leaderboardCollection = db.collection(COLLECTION_NAME);
    const frozenUsersCollection = db.collection(FROZEN_USERS_COLLECTION);
    
    // Create index on email for faster lookups
    await leaderboardCollection.createIndex({ email: 1 });
    await frozenUsersCollection.createIndex({ email: 1 });
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}