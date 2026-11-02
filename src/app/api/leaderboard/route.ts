import { NextResponse } from 'next/server';
import { LeaderboardEntry, FrozenUser } from '@/lib/utils';
import { 
  connectToDatabase, 
  getLeaderboardCollection, 
  getFrozenUsersCollection,
  getInMemoryEntries,
  getInMemoryFrozenUsers,
  setInMemoryEntries,
  setInMemoryFrozenUsers,
  isProductionEnvironment
} from '@/lib/db';
import { verifyAdminAuth } from '@/lib/auth';

function sanitizeEntryForResponse(entry: any): LeaderboardEntry {
  const userName = entry.userName || entry['User Name'] || '';
  const email = (entry.email || entry['User Email'] || '').toLowerCase().trim();
  const rank = typeof entry.rank === 'number' ? entry.rank : parseInt(entry.rank, 10) || 0;
  
  const skillBadgesCompleted = entry.skillBadgesCompleted !== undefined && entry.skillBadgesCompleted !== null
    ? (typeof entry.skillBadgesCompleted === 'number' ? entry.skillBadgesCompleted : parseInt(entry.skillBadgesCompleted, 10) || 0)
    : (entry['# of Skill Badges Completed'] !== undefined ? parseInt(entry['# of Skill Badges Completed'], 10) || 0 : 0);

  const arcadeGamesCompleted = entry.arcadeGamesCompleted !== undefined
    ? entry.arcadeGamesCompleted
    : (entry['# of Arcade Games Completed'] !== undefined && entry['# of Arcade Games Completed'] !== null && entry['# of Arcade Games Completed'] !== '-'
        ? (typeof entry['# of Arcade Games Completed'] === 'number' ? entry['# of Arcade Games Completed'] : parseInt(entry['# of Arcade Games Completed'], 10) || null)
        : null);

  const skillsProfileUrl = entry.skillsProfileUrl || entry['Google Cloud Skills Boost Profile URL'] || null;
  const developerProfileUrl = entry.developerProfileUrl || null;
  const allCompleted = entry.allCompleted || entry['All Skill Badges & Games Completed'] || null;

  return {
    rank,
    userName,
    email,
    skillsProfileUrl,
    skillsProfileStatus: entry.skillsProfileStatus || null,
    developerProfileUrl,
    developerProfileStatus: entry.developerProfileStatus || null,
    accessCodeRedemptionStatus: entry.accessCodeRedemptionStatus || null,
    milestoneCompleted: entry.milestoneCompleted || null,
    gearDigitalBadges: entry.gearDigitalBadges || null,
    skillBadgesCompleted,
    skillBadgesCompletedNames: entry.skillBadgesCompletedNames || null,
    arcadeGamesCompleted,
    allCompleted,

    // Legacy property aliases for UI bindings
    'User Name': userName,
    'User Email': email,
    '# of Skill Badges Completed': skillBadgesCompleted,
    '# of Arcade Games Completed': arcadeGamesCompleted,
    'All Skill Badges & Games Completed': allCompleted,
    'Google Cloud Skills Boost Profile URL': skillsProfileUrl,
  };
}

export async function GET() {
  try {
    const { db, error: dbError } = await connectToDatabase();

    if (!db) {
      if (isProductionEnvironment()) {
        return NextResponse.json(
          { error: 'Database unavailable: MongoDB is required in production.', details: dbError },
          { status: 503 }
        );
      }

      return NextResponse.json({
        entries: getInMemoryEntries().map(sanitizeEntryForResponse),
        frozenUsers: getInMemoryFrozenUsers(),
      });
    }

    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();

    const rawEntries = await (leaderboardCollection.find({}).sort({ rank: 1 }) as any).toArray();
    const frozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();

    const frozenUsers: Record<string, FrozenUser> = {};
    frozenUsersArray.forEach((user: any) => {
      const email = (user.email || '').toLowerCase().trim();
      if (email) {
        frozenUsers[email] = {
          rank: user.rank,
          timestamp: user.timestamp,
        };
      }
    });

    const entries = rawEntries.map(sanitizeEntryForResponse);

    return NextResponse.json({
      entries,
      frozenUsers,
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard data:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { entries, frozenUsers: newFrozenUsers } = body;

    // 2. Validate incoming data before any delete/modify operations
    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Invalid payload: "entries" must be an array.' },
        { status: 400 }
      );
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: "entries" cannot be empty.' },
        { status: 400 }
      );
    }

    const seenEmails = new Set<string>();
    const sanitizedEntries: any[] = [];

    for (let i = 0; i < entries.length; i++) {
      const item = entries[i];
      const userName = item.userName || item['User Name'];
      const rawEmail = item.email || item['User Email'];
      const email = (rawEmail || '').toLowerCase().trim();

      if (!userName || typeof userName !== 'string') {
        return NextResponse.json(
          { error: `Validation error at record ${i + 1}: Participant name is missing.` },
          { status: 400 }
        );
      }

      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { error: `Validation error at record ${i + 1}: Invalid email address for "${userName}".` },
          { status: 400 }
        );
      }

      if (seenEmails.has(email)) {
        return NextResponse.json(
          { error: `Validation error: Duplicate email address detected: "${email}".` },
          { status: 400 }
        );
      }
      seenEmails.add(email);

      // Sanitize fields and ensure no raw access codes are stored or logged
      const sanitized = sanitizeEntryForResponse(item);
      sanitizedEntries.push({
        ...sanitized,
        email,
        createdAt: new Date(),
      });
    }

    // 3. Connect to database
    const { db, error: dbError } = await connectToDatabase();

    if (!db) {
      if (isProductionEnvironment()) {
        return NextResponse.json(
          { error: 'Database unavailable: MongoDB is required in production.', details: dbError },
          { status: 503 }
        );
      }

      // Local development in-memory fallback
      setInMemoryEntries(sanitizedEntries);
      if (newFrozenUsers && typeof newFrozenUsers === 'object') {
        setInMemoryFrozenUsers(newFrozenUsers);
      }

      return NextResponse.json({
        message: 'Leaderboard data updated successfully (local in-memory fallback)',
        entries: getInMemoryEntries().map(sanitizeEntryForResponse),
        frozenUsers: getInMemoryFrozenUsers(),
      });
    }

    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();

    // 4. Safely replace data only after validation passed
    await (leaderboardCollection.deleteMany({}) as any);
    await (leaderboardCollection.insertMany(sanitizedEntries) as any);

    if (newFrozenUsers && typeof newFrozenUsers === 'object') {
      await (frozenUsersCollection.deleteMany({}) as any);
      const frozenUsersArray = Object.keys(newFrozenUsers).map((emailKey) => ({
        email: emailKey.toLowerCase().trim(),
        rank: newFrozenUsers[emailKey].rank,
        timestamp: newFrozenUsers[emailKey].timestamp || new Date().toISOString(),
        createdAt: new Date(),
      }));

      if (frozenUsersArray.length > 0) {
        await (frozenUsersCollection.insertMany(frozenUsersArray) as any);
      }
    }

    const updatedEntries = await (leaderboardCollection.find({}).sort({ rank: 1 }) as any).toArray();
    const updatedFrozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();

    const updatedFrozenUsers: Record<string, FrozenUser> = {};
    updatedFrozenUsersArray.forEach((user: any) => {
      const email = (user.email || '').toLowerCase().trim();
      if (email) {
        updatedFrozenUsers[email] = {
          rank: user.rank,
          timestamp: user.timestamp,
        };
      }
    });

    return NextResponse.json({
      message: 'Leaderboard data updated successfully',
      entries: updatedEntries.map(sanitizeEntryForResponse),
      frozenUsers: updatedFrozenUsers,
    });
  } catch (error: any) {
    console.error('Error updating leaderboard data:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update leaderboard data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // 1. Verify admin authentication
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email: rawEmail, rank } = body;
    const email = (rawEmail || '').toLowerCase().trim();

    if (!email || typeof rank !== 'number' || isNaN(rank) || rank < 1) {
      return NextResponse.json(
        { error: 'Valid email and numeric rank (>= 1) are required.' },
        { status: 400 }
      );
    }

    const { db, error: dbError } = await connectToDatabase();

    if (!db) {
      if (isProductionEnvironment()) {
        return NextResponse.json(
          { error: 'Database unavailable: MongoDB is required in production.', details: dbError },
          { status: 503 }
        );
      }

      const frozenUsers = getInMemoryFrozenUsers();
      frozenUsers[email] = {
        rank,
        timestamp: new Date().toISOString(),
      };
      setInMemoryFrozenUsers(frozenUsers);

      return NextResponse.json({
        message: 'User rank frozen successfully (in-memory)',
        frozenUsers: getInMemoryFrozenUsers(),
      });
    }

    const frozenUsersCollection = await getFrozenUsersCollection();

    await (frozenUsersCollection.updateOne(
      { email },
      {
        $set: {
          email,
          rank,
          timestamp: new Date().toISOString(),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    ) as any);

    const frozenUsersArray = await (frozenUsersCollection.find({}) as any).toArray();
    const frozenUsers: Record<string, FrozenUser> = {};
    frozenUsersArray.forEach((user: any) => {
      const userEmail = (user.email || '').toLowerCase().trim();
      if (userEmail) {
        frozenUsers[userEmail] = {
          rank: user.rank,
          timestamp: user.timestamp,
        };
      }
    });

    return NextResponse.json({
      message: 'User rank frozen successfully',
      frozenUsers,
    });
  } catch (error: any) {
    console.error('Error freezing user rank:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to freeze user rank' },
      { status: 500 }
    );
  }
}
