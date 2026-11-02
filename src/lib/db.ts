import { MongoClient, Db, ServerApiVersion, ReadPreferenceMode } from 'mongodb';
import { LeaderboardEntry, FrozenUser } from './utils';

const MONGODB_URI = process.env.MONGODB_URI;

const DATABASE_NAME = 'leaderboard';
const COLLECTION_NAME = 'entries';
const FROZEN_USERS_COLLECTION = 'frozenUsers';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

let inMemoryEntries: LeaderboardEntry[] = [];
let inMemoryFrozenUsers: Record<string, FrozenUser> = {};

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
}

export async function connectToDatabase(): Promise<{ client: MongoClient | null; db: Db | null; error?: string }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    if (isProductionEnvironment()) {
      const err = 'Production environment detected but MONGODB_URI is not configured.';
      console.error(err);
      return { client: null, db: null, error: err };
    }
    // In local development, check if default local URI works or fall back
    console.warn('[DEV] MONGODB_URI is not set. Using local development mode.');
  }

  const connectionString = MONGODB_URI || 'mongodb://localhost:27017/leaderboard';

  try {
    const isAtlas = connectionString.includes('mongodb.net');

    const clientOptions: any = {
      serverApi: isAtlas ? {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      } : undefined,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 2,
      tls: isAtlas,
      tlsInsecure: false,
      retryWrites: true,
      readPreference: 'primary' as ReadPreferenceMode,
    };

    const client = new MongoClient(connectionString, clientOptions);
    await client.connect();

    const db = client.db(DATABASE_NAME);
    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connected successfully');
    return { client, db };
  } catch (error: any) {
    console.error('Error connecting to MongoDB:', error?.message || error);

    if (isProductionEnvironment()) {
      return {
        client: null,
        db: null,
        error: 'Failed to connect to production MongoDB database. Please verify MONGODB_URI.'
      };
    }

    console.warn('[DEV] MongoDB connection failed; using local in-memory storage fallback.');
    return { client: null, db: null };
  }
}

export async function getLeaderboardCollection() {
  const { db } = await connectToDatabase();
  if (db) {
    return db.collection(COLLECTION_NAME);
  }
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

export async function getFrozenUsersCollection() {
  const { db } = await connectToDatabase();
  if (db) {
    return db.collection(FROZEN_USERS_COLLECTION);
  }
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
    updateOne: async (filter: any, update: any) => {
      const email = filter.email;
      if (email && update.$set) {
        inMemoryFrozenUsers[email] = {
          rank: update.$set.rank,
          timestamp: update.$set.timestamp
        };
      }
    }
  };
}

/**
 * Initializes database indexes and explicitly removes any existing 48-hour TTL deletion indexes.
 */
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const { db, error } = await connectToDatabase();

    if (!db) {
      if (isProductionEnvironment()) {
        throw new Error(error || 'Cannot initialize database: MongoDB connection is unavailable.');
      }
      return { success: true, message: 'Using local in-memory storage; no persistent database to initialize.' };
    }

    const leaderboardCollection = db.collection(COLLECTION_NAME);
    const frozenUsersCollection = db.collection(FROZEN_USERS_COLLECTION);

    // Create unique email index and rank query index
    await leaderboardCollection.createIndex({ email: 1 }, { unique: true });
    await leaderboardCollection.createIndex({ rank: 1 });
    await frozenUsersCollection.createIndex({ email: 1 }, { unique: true });

    // Explicitly detect and drop obsolete 48-hour TTL indexes if they exist
    try {
      const lbIndexes = await leaderboardCollection.indexes();
      for (const idx of lbIndexes) {
        if (idx.name && (idx.expireAfterSeconds !== undefined || idx.name === 'createdAt_1')) {
          console.log(`Removing obsolete TTL index '${idx.name}' from ${COLLECTION_NAME}`);
          await leaderboardCollection.dropIndex(idx.name);
        }
      }
    } catch (e: any) {
      console.warn('Notice while inspecting leaderboard TTL index:', e?.message || e);
    }

    try {
      const frozenIndexes = await frozenUsersCollection.indexes();
      for (const idx of frozenIndexes) {
        if (idx.name && (idx.expireAfterSeconds !== undefined || idx.name === 'createdAt_1')) {
          console.log(`Removing obsolete TTL index '${idx.name}' from ${FROZEN_USERS_COLLECTION}`);
          await frozenUsersCollection.dropIndex(idx.name);
        }
      }
    } catch (e: any) {
      console.warn('Notice while inspecting frozen users TTL index:', e?.message || e);
    }

    return { success: true, message: 'Database initialized with permanent persistence indexes.' };
  } catch (error: any) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

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
