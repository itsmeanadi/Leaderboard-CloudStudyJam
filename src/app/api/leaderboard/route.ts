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

export async function GET() {
  try {
    console.log('GET /api/leaderboard called');
    
    const isVercel = !!process.env.VERCEL;
    console.log('Running on Vercel:', isVercel);
    
    const mongoUri = process.env.MONGODB_URI;
    console.log('MONGODB_URI set:', !!mongoUri);
    if (mongoUri) {
      console.log('MongoDB URI type:', mongoUri.includes('mongodb.net') ? 'Atlas' : 'Local');
    }
    
    console.log('Connecting to database...');
    const dbConnection = await connectToDatabase();
    const useInMemory = !dbConnection.db;
    console.log('Using in-memory storage:', useInMemory);
    
    if (useInMemory) {
      console.log('Returning in-memory data');
      return NextResponse.json({
        entries: getInMemoryEntries(),
        frozenUsers: getInMemoryFrozenUsers()
      });
    }
    
    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    console.log('Fetching leaderboard entries...');
    const entries = await (leaderboardCollection.find({}).sort({ rank: 1 }) as any).toArray();
    console.log(`Found ${entries.length} leaderboard entries`);
    
    console.log('Fetching frozen users...');
    const frozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    console.log(`Found ${frozenUsersArray.length} frozen users`);
    
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
        _id: undefined,
        createdAt: undefined
      })),
      frozenUsers
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard data:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    const errorDetails = {
      name: error.name,
      message: error.message,
      stack: error.stack,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entries, frozenUsers: newFrozenUsers } = body;
    
    console.log('POST /api/leaderboard called');
    
    const dbConnection = await connectToDatabase();
    const useInMemory = !dbConnection.db;
    console.log('Using in-memory storage:', useInMemory);
    
    if (useInMemory) {
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
    
    await (leaderboardCollection.deleteMany({}) as any);
    await (frozenUsersCollection.deleteMany({}) as any);
    
    if (entries && entries.length > 0) {
      const entriesWithEmail = entries.map((entry: LeaderboardEntry) => ({
        ...entry,
        email: entry["User Email"],
        createdAt: new Date()
      }));
      
      await (leaderboardCollection.insertMany(entriesWithEmail) as any);
    }
    
    if (newFrozenUsers) {
      const frozenUsersArray = Object.keys(newFrozenUsers).map(email => ({
        email,
        rank: newFrozenUsers[email].rank,
        timestamp: newFrozenUsers[email].timestamp,
        createdAt: new Date()
      }));
      
      if (frozenUsersArray.length > 0) {
        await (frozenUsersCollection.insertMany(frozenUsersArray) as any);
      }
    }
    
    const updatedEntries = await (leaderboardCollection.find({}).sort({ rank: 1 }) as any).toArray();
    const updatedFrozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    
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
        _id: undefined,
        createdAt: undefined
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
    
    const dbConnection = await connectToDatabase();
    const useInMemory = !dbConnection.db;
    console.log('Using in-memory storage:', useInMemory);
    
    if (useInMemory) {
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
    
    const frozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    
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