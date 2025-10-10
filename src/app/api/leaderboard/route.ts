import { NextResponse } from 'next/server';
import { LeaderboardEntry, FrozenUser } from '@/lib/utils';
import { 
  connectToDatabase, 
  getLeaderboardCollection, 
  getFrozenUsersCollection,
  getInMemoryEntries,
  getInMemoryFrozenUsers,
  setInMemoryEntries,
  setInMemoryFrozenUsers
} from '@/lib/db';

// GET /api/leaderboard - Get all leaderboard data
export async function GET() {
  try {
    console.log('GET /api/leaderboard called');
    
    // Check if we're running on Vercel
    const isVercel = !!process.env.VERCEL;
    console.log('Running on Vercel:', isVercel);
    
    // Check if MONGODB_URI is set
    const mongoUri = process.env.MONGODB_URI;
    console.log('MONGODB_URI set:', !!mongoUri);
    if (mongoUri) {
      console.log('MongoDB URI type:', mongoUri.includes('mongodb.net') ? 'Atlas' : 'Local');
    }
    
    console.log('Connecting to database...');
    // Connect to the database
    const dbConnection = await connectToDatabase();
    const useInMemory = !dbConnection.db;
    console.log('Using in-memory storage:', useInMemory);
    
    if (useInMemory) {
      // Return in-memory data
      console.log('Returning in-memory data');
      return NextResponse.json({
        entries: getInMemoryEntries(),
        frozenUsers: getInMemoryFrozenUsers()
      });
    }
    
    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    console.log('Fetching leaderboard entries...');
    // Fetch all leaderboard entries
    const entries = await (leaderboardCollection.find({}).sort({ rank: 1 }) as any).toArray();
    console.log(`Found ${entries.length} leaderboard entries`);
    
    console.log('Fetching frozen users...');
    // Fetch all frozen users
    const frozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    console.log(`Found ${frozenUsersArray.length} frozen users`);
    
    // Convert frozen users array to object
    const frozenUsers: Record<string, FrozenUser> = {};
    frozenUsersArray.forEach((user: any) => {
      frozenUsers[user.email] = {
        rank: user.rank,
        timestamp: user.timestamp
      };
    });
    
    console.log('Returning response...');
    return NextResponse.json({
      entries: entries.map((entry: any) => ({
        ...entry,
        _id: undefined // Remove MongoDB _id from response
      })),
      frozenUsers
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard data:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error information
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Add environment information for debugging
      isVercel: !!process.env.VERCEL,
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriType: process.env.MONGODB_URI?.includes('mongodb.net') ? 'Atlas' : 'Local',
    };
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard data',
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

// POST /api/leaderboard - Update leaderboard data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entries, frozenUsers: newFrozenUsers } = body;
    
    console.log('POST /api/leaderboard called');
    
    // Connect to the database
    const dbConnection = await connectToDatabase();
    const useInMemory = !dbConnection.db;
    console.log('Using in-memory storage:', useInMemory);
    
    if (useInMemory) {
      // Store in memory
      setInMemoryEntries(entries || []);
      setInMemoryFrozenUsers(newFrozenUsers || {});
      
      return NextResponse.json({
        message: 'Leaderboard data updated successfully (in-memory)',
        entries: getInMemoryEntries(),
        frozenUsers: getInMemoryFrozenUsers()
      });
    }
    
    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    // Clear existing data
    await (leaderboardCollection.deleteMany({}) as any);
    await (frozenUsersCollection.deleteMany({}) as any);
    
    // Insert new leaderboard entries if provided
    if (entries && entries.length > 0) {
      // Add email field to each entry for easier querying
      const entriesWithEmail = entries.map((entry: LeaderboardEntry) => ({
        ...entry,
        email: entry["User Email"]
      }));
      
      await (leaderboardCollection.insertMany(entriesWithEmail) as any);
    }
    
    // Insert frozen users if provided
    if (newFrozenUsers) {
      const frozenUsersArray = Object.keys(newFrozenUsers).map(email => ({
        email,
        rank: newFrozenUsers[email].rank,
        timestamp: newFrozenUsers[email].timestamp
      }));
      
      if (frozenUsersArray.length > 0) {
        await (frozenUsersCollection.insertMany(frozenUsersArray) as any);
      }
    }
    
    // Fetch updated data
    const updatedEntries = await (leaderboardCollection.find({}).sort({ rank: 1 }) as any).toArray();
    const updatedFrozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    
    // Convert frozen users array to object
    const updatedFrozenUsers: Record<string, FrozenUser> = {};
    updatedFrozenUsersArray.forEach((user: any) => {
      updatedFrozenUsers[user.email] = {
        rank: user.rank,
        timestamp: user.timestamp
      };
    });
    
    return NextResponse.json({
      message: 'Leaderboard data updated successfully',
      entries: updatedEntries.map((entry: any) => ({
        ...entry,
        _id: undefined // Remove MongoDB _id from response
      })),
      frozenUsers: updatedFrozenUsers
    });
  } catch (error: any) {
    console.error('Error updating leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard data', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/leaderboard/freeze - Freeze a user's rank
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, rank } = body;
    
    if (!email || rank === undefined) {
      return NextResponse.json(
        { error: 'Email and rank are required' },
        { status: 400 }
      );
    }
    
    console.log('PUT /api/leaderboard/freeze called');
    
    // Connect to the database
    const dbConnection = await connectToDatabase();
    const useInMemory = !dbConnection.db;
    console.log('Using in-memory storage:', useInMemory);
    
    if (useInMemory) {
      // Update in-memory storage
      const frozenUsers = getInMemoryFrozenUsers();
      frozenUsers[email] = {
        rank,
        timestamp: new Date().toISOString()
      };
      setInMemoryFrozenUsers(frozenUsers);
      
      return NextResponse.json({
        message: 'User rank frozen successfully (in-memory)',
        frozenUsers: getInMemoryFrozenUsers()
      });
    }
    
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    // Update or insert frozen user
    await (frozenUsersCollection.updateOne(
      { email },
      { 
        $set: { 
          email,
          rank,
          timestamp: new Date().toISOString()
        }
      },
      { upsert: true }
    ) as any);
    
    // Fetch updated frozen users
    const frozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    
    // Convert frozen users array to object
    const frozenUsers: Record<string, FrozenUser> = {};
    frozenUsersArray.forEach((user: any) => {
      frozenUsers[user.email] = {
        rank: user.rank,
        timestamp: user.timestamp
      };
    });
    
    return NextResponse.json({
      message: 'User rank frozen successfully',
      frozenUsers
    });
  } catch (error: any) {
    console.error('Error freezing user rank:', error);
    return NextResponse.json(
      { error: 'Failed to freeze user rank' },
      { status: 500 }
    );
  }
}