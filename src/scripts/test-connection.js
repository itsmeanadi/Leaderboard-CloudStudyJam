require('dotenv').config({ path: '.env.local' });
const { MongoClient, ServerApiVersion } = require('mongodb');

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard';
  
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:[^:@/]*@/, ":***@")); // Hide password
  
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    connectTimeoutMS: 5000, // 5 seconds
    serverSelectionTimeoutMS: 5000, // 5 seconds
    socketTimeoutMS: 10000, // 10 seconds
  });

  try {
    console.log('Attempting to connect...');
    const startTime = Date.now();
    await client.connect();
    const endTime = Date.now();
    console.log(`✅ Successfully connected to MongoDB in ${endTime - startTime}ms!`);
    
    // Test database access
    const db = client.db('leaderboard');
    console.log('Accessing database...');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  }
}

testConnection();