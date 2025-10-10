import { MongoClient, Db, ServerApiVersion, ReadPreferenceMode } from 'mongodb';
import { LeaderboardEntry, FrozenUser } from './utils';

// MongoDB connection URI - replace with your actual MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard';

// Database and collection names
const DATABASE_NAME = 'leaderboard';
const COLLECTION_NAME = 'entries';
const FROZEN_USERS_COLLECTION = 'frozenUsers';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// In-memory fallback storage
let inMemoryEntries: LeaderboardEntry[] = [];
let inMemoryFrozenUsers: Record<string, FrozenUser> = {};

export async function connectToDatabase() {
  // Use cached connection if available
  if (cachedClient && cachedDb) {
    console.log('Using cached database connection');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    console.log('Creating new MongoDB connection...');
    console.log('MONGODB_URI:', MONGODB_URI ? 'URI is set' : 'URI is not set');
    
    // Check if we're using MongoDB Atlas
    const isAtlas = MONGODB_URI.includes('mongodb.net');
    
    // Create a new MongoClient with proper options
    const clientOptions: any = {
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
      readPreference: 'primary' as ReadPreferenceMode,
    };
    
    const client = new MongoClient(MONGODB_URI, clientOptions);
    
    console.log('Connecting to MongoDB server...');
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    // Select the database
    const db = client.db(DATABASE_NAME);
    console.log(`Selected database: ${DATABASE_NAME}`);
    
    // Cache the client and db for future use
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // If we're on Vercel and Atlas connection fails, try to provide a more helpful error
    if (process.env.VERCEL) {
      console.error('Running on Vercel - check if MongoDB Atlas is properly configured');
    }
    
    // For development, we'll use in-memory storage as a fallback
    console.log('Using in-memory storage as fallback');
    return { client: null, db: null };
  }
}

export async function getLeaderboardCollection() {
  console.log('Getting leaderboard collection...');
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return db.collection(COLLECTION_NAME);
    } else {
      // Return a mock collection for in-memory storage
      return {
        find: () => ({
          sort: () => ({
            toArray: async () => inMemoryEntries
          })
        }),
        deleteMany: async () => {},
        insertMany: async (entries: any[]) => {
          inMemoryEntries = entries as LeaderboardEntry[];
        }
      };
    }
  } catch (error: any) {
    console.error('Error getting leaderboard collection:', error);
    throw error;
  }
}

export async function getFrozenUsersCollection() {
  console.log('Getting frozen users collection...');
  try {
    const { db } = await connectToDatabase();
    if (db) {
      return db.collection(FROZEN_USERS_COLLECTION);
    } else {
      // Return a mock collection for in-memory storage
      return {
        find: () => ({
          toArray: async () => {
            return Object.keys(inMemoryFrozenUsers).map(email => ({
              email,
              rank: inMemoryFrozenUsers[email].rank,
              timestamp: inMemoryFrozenUsers[email].timestamp
            }));
          }
        }),
        deleteMany: async () => {},
        insertMany: async (users: any[]) => {
          inMemoryFrozenUsers = {};
          users.forEach((user: any) => {
            inMemoryFrozenUsers[user.email] = {
              rank: user.rank,
              timestamp: user.timestamp
            };
          });
        },
        updateOne: async (filter: any, update: any, options: any) => {
          const email = filter.email;
          if (email) {
            inMemoryFrozenUsers[email] = {
              rank: update.$set.rank,
              timestamp: update.$set.timestamp
            };
          }
        }
      };
    }
  } catch (error: any) {
    console.error('Error getting frozen users collection:', error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    const { db } = await connectToDatabase();
    
    if (db) {
      // Create indexes for better query performance
      const leaderboardCollection = db.collection(COLLECTION_NAME);
      const frozenUsersCollection = db.collection(FROZEN_USERS_COLLECTION);
      
      // Create index on email for faster lookups
      await (leaderboardCollection.createIndex({ email: 1 }) as any);
      await (frozenUsersCollection.createIndex({ email: 1 }) as any);
      
      console.log('Database initialized successfully');
    } else {
      console.log('Using in-memory storage, no database initialization needed');
    }
  } catch (error: any) {
    console.error('Error initializing database:', error);
  }
}

// Helper functions for in-memory storage
export function setInMemoryEntries(entries: LeaderboardEntry[]) {
  inMemoryEntries = entries;
}

export function setInMemoryFrozenUsers(frozenUsers: Record<string, FrozenUser>) {
  inMemoryFrozenUsers = frozenUsers;
}

export function getInMemoryEntries(): LeaderboardEntry[] {
  return inMemoryEntries;
}

export function getInMemoryFrozenUsers(): Record<string, FrozenUser> {
  return inMemoryFrozenUsers;
}