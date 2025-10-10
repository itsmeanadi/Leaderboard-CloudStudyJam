import { NextResponse } from 'next/server';
import { LeaderboardEntry, FrozenUser } from '@/lib/utils';
import { connectToDatabase, getLeaderboardCollection, getFrozenUsersCollection } from '@/lib/db';

// GET /api/leaderboard - Get all leaderboard data
export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    // Fetch all leaderboard entries
    const entries = await leaderboardCollection.find({}).sort({ rank: 1 }).toArray();
    
    // Fetch all frozen users
    const frozenUsersArray = await frozenUsersCollection.find({}).toArray();
    
    // Convert frozen users array to object
    const frozenUsers: Record<string, FrozenUser> = {};
    frozenUsersArray.forEach(user => {
      frozenUsers[user.email] = {
        rank: user.rank,
        timestamp: user.timestamp
      };
    });
    
    return NextResponse.json({
      entries: entries.map(entry => ({
        ...entry,
        _id: undefined // Remove MongoDB _id from response
      })),
      frozenUsers
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

// POST /api/leaderboard - Update leaderboard data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entries, frozenUsers: newFrozenUsers } = body;
    
    // Connect to the database
    await connectToDatabase();
    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    // Clear existing data
    await leaderboardCollection.deleteMany({});
    await frozenUsersCollection.deleteMany({});
    
    // Insert new leaderboard entries if provided
    if (entries && entries.length > 0) {
      // Add email field to each entry for easier querying
      const entriesWithEmail = entries.map((entry: LeaderboardEntry) => ({
        ...entry,
        email: entry["User Email"]
      }));
      
      await leaderboardCollection.insertMany(entriesWithEmail);
    }
    
    // Insert frozen users if provided
    if (newFrozenUsers) {
      const frozenUsersArray = Object.keys(newFrozenUsers).map(email => ({
        email,
        rank: newFrozenUsers[email].rank,
        timestamp: newFrozenUsers[email].timestamp
      }));
      
      if (frozenUsersArray.length > 0) {
        await frozenUsersCollection.insertMany(frozenUsersArray);
      }
    }
    
    // Fetch updated data
    const updatedEntries = await leaderboardCollection.find({}).sort({ rank: 1 }).toArray();
    const updatedFrozenUsersArray = await frozenUsersCollection.find({}).toArray();
    
    // Convert frozen users array to object
    const updatedFrozenUsers: Record<string, FrozenUser> = {};
    updatedFrozenUsersArray.forEach(user => {
      updatedFrozenUsers[user.email] = {
        rank: user.rank,
        timestamp: user.timestamp
      };
    });
    
    return NextResponse.json({
      message: 'Leaderboard data updated successfully',
      entries: updatedEntries.map(entry => ({
        ...entry,
        _id: undefined // Remove MongoDB _id from response
      })),
      frozenUsers: updatedFrozenUsers
    });
  } catch (error) {
    console.error('Error updating leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard data' },
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
    
    // Connect to the database
    await connectToDatabase();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    // Update or insert frozen user
    await frozenUsersCollection.updateOne(
      { email },
      { 
        $set: { 
          email,
          rank,
          timestamp: new Date().toISOString()
        }
      },
      { upsert: true }
    );
    
    // Fetch updated frozen users
    const frozenUsersArray = await frozenUsersCollection.find({}).toArray();
    
    // Convert frozen users array to object
    const frozenUsers: Record<string, FrozenUser> = {};
    frozenUsersArray.forEach(user => {
      frozenUsers[user.email] = {
        rank: user.rank,
        timestamp: user.timestamp
      };
    });
    
    return NextResponse.json({
      message: 'User rank frozen successfully',
      frozenUsers
    });
  } catch (error) {
    console.error('Error freezing user rank:', error);
    return NextResponse.json(
      { error: 'Failed to freeze user rank' },
      { status: 500 }
    );
  }
}