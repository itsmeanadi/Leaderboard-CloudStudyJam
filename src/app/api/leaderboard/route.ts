import { NextResponse } from 'next/server';
import { LeaderboardEntry, FrozenUser } from '@/lib/utils';

// In-memory storage (for demo purposes)
// In a real application, you would use a database
let leaderboardData: LeaderboardEntry[] = [];
let frozenUsers: Record<string, FrozenUser> = {};

// GET /api/leaderboard - Get all leaderboard data
export async function GET() {
  try {
    return NextResponse.json({
      entries: leaderboardData,
      frozenUsers: frozenUsers
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
    
    // Update in-memory storage
    leaderboardData = entries;
    frozenUsers = newFrozenUsers || {};
    
    return NextResponse.json({
      message: 'Leaderboard data updated successfully',
      entries: leaderboardData,
      frozenUsers: frozenUsers
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
    
    // Update frozen users
    frozenUsers[email] = {
      rank,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: 'User rank frozen successfully',
      frozenUsers: frozenUsers
    });
  } catch (error) {
    console.error('Error freezing user rank:', error);
    return NextResponse.json(
      { error: 'Failed to freeze user rank' },
      { status: 500 }
    );
  }
}