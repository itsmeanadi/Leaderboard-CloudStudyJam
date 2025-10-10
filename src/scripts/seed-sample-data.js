require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Sample leaderboard data
const sampleEntries = [
  {
    rank: 1,
    "User Name": "John Doe",
    "User Email": "john.doe@example.com",
    "# of Skill Badges Completed": 15,
    "# of Arcade Games Completed": 10,
    "All Skill Badges & Games Completed": "Yes"
  },
  {
    rank: 2,
    "User Name": "Jane Smith",
    "User Email": "jane.smith@example.com",
    "# of Skill Badges Completed": 14,
    "# of Arcade Games Completed": 9,
    "All Skill Badges & Games Completed": "No"
  },
  {
    rank: 3,
    "User Name": "Bob Johnson",
    "User Email": "bob.johnson@example.com",
    "# of Skill Badges Completed": 12,
    "# of Arcade Games Completed": 11,
    "All Skill Badges & Games Completed": "Yes"
  },
  {
    rank: 4,
    "User Name": "Alice Williams",
    "User Email": "alice.williams@example.com",
    "# of Skill Badges Completed": 10,
    "# of Arcade Games Completed": 8,
    "All Skill Badges & Games Completed": "No"
  },
  {
    rank: 5,
    "User Name": "Charlie Brown",
    "User Email": "charlie.brown@example.com",
    "# of Skill Badges Completed": 8,
    "# of Arcade Games Completed": 7,
    "All Skill Badges & Games Completed": "No"
  }
];

// Sample frozen users
const sampleFrozenUsers = {
  "jane.smith@example.com": {
    rank: 2,
    timestamp: new Date().toISOString()
  }
};

async function seedDatabase() {
  console.log('🌱 Seeding database with sample data...\n');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ MONGODB_URI is not set in .env.local');
    return;
  }
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('leaderboard');
    
    // Clear existing data
    await db.collection('entries').deleteMany({});
    console.log('🧹 Cleared existing entries');
    
    await db.collection('frozenUsers').deleteMany({});
    console.log('🧹 Cleared existing frozen users');
    
    // Add email field to entries for easier querying
    const entriesWithEmail = sampleEntries.map(entry => ({
      ...entry,
      email: entry["User Email"]
    }));
    
    // Insert sample entries
    await db.collection('entries').insertMany(entriesWithEmail);
    console.log(`✅ Inserted ${sampleEntries.length} sample entries`);
    
    // Insert sample frozen users
    const frozenUsersArray = Object.keys(sampleFrozenUsers).map(email => ({
      email,
      rank: sampleFrozenUsers[email].rank,
      timestamp: sampleFrozenUsers[email].timestamp
    }));
    
    await db.collection('frozenUsers').insertMany(frozenUsersArray);
    console.log(`✅ Inserted ${frozenUsersArray.length} frozen users`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('You can now test your leaderboard application.');
    
  } catch (error) {
    console.log('❌ Error seeding database:', error.message);
  } finally {
    await client.close();
  }
}

seedDatabase();