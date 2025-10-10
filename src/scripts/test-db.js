const { connectToDatabase, getLeaderboardCollection } = require('../../lib/db');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const { client, db } = await connectToDatabase();
    console.log('Connected to MongoDB successfully!');
    
    const collection = await getLeaderboardCollection();
    const count = await collection.countDocuments();
    console.log(`Found ${count} documents in the leaderboard collection`);
    
    console.log('Database test completed successfully!');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
}

testDatabaseConnection();