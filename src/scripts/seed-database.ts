import { connectToDatabase, getLeaderboardCollection, getFrozenUsersCollection } from '../lib/db';

async function seedDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();
    const leaderboardCollection = await getLeaderboardCollection();
    const frozenUsersCollection = await getFrozenUsersCollection();
    
    // Clear existing data
    await leaderboardCollection.deleteMany({});
    await frozenUsersCollection.deleteMany({});
    
    // Sample leaderboard data
    const sampleData = [
      {
        rank: 1,
        "User Name": "Alice Johnson",
        "User Email": "alice@example.com",
        "# of Skill Badges Completed": 15,
        "# of Arcade Games Completed": 12,
        "All Skill Badges & Games Completed": "Yes",
        "Google Cloud Skills Boost Profile URL": "https://www.cloudskillsboost.google/public_profiles/12345"
      },
      {
        rank: 2,
        "User Name": "Bob Smith",
        "User Email": "bob@example.com",
        "# of Skill Badges Completed": 14,
        "# of Arcade Games Completed": 10,
        "All Skill Badges & Games Completed": "No",
        "Google Cloud Skills Boost Profile URL": "https://www.cloudskillsboost.google/public_profiles/67890"
      },
      {
        rank: 3,
        "User Name": "Carol Williams",
        "User Email": "carol@example.com",
        "# of Skill Badges Completed": 12,
        "# of Arcade Games Completed": 8,
        "All Skill Badges & Games Completed": "No",
        "Google Cloud Skills Boost Profile URL": "https://www.cloudskillsboost.google/public_profiles/54321"
      }
    ];
    
    // Insert sample data
    await leaderboardCollection.insertMany(sampleData);
    
    console.log('Database seeded successfully with sample data');
    console.log('Sample data inserted:', sampleData);
    
    // Close the connection
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();