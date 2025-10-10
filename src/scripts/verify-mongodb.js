require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function verifyMongoDBConnection() {
  console.log('🔍 Verifying MongoDB Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('❌ MONGODB_URI is not set in .env.local');
    console.log('Please add your MongoDB connection string to .env.local');
    return;
  }
  
  console.log('✅ MONGODB_URI found');
  console.log('URI:', uri.replace(/:[^:@/]*@/, ":***@"));
  
  // Check if it's a local or Atlas connection
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1');
  const isAtlas = uri.includes('mongodb.net');
  
  console.log('Connection Type:', isLocal ? 'Local MongoDB' : isAtlas ? 'MongoDB Atlas' : 'Other');
  
  if (isAtlas) {
    // Extract cluster info
    const clusterMatch = uri.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^/]+)/);
    if (clusterMatch) {
      console.log('Cluster:', clusterMatch[1]);
    }
  }
  
  console.log('\n🔄 Testing connection...');
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });
  
  try {
    const startTime = Date.now();
    await client.connect();
    const endTime = Date.now();
    
    console.log('✅ Connection successful!');
    console.log(`⏱️  Connected in ${endTime - startTime}ms`);
    
    // Test database access
    const db = client.db('leaderboard');
    console.log('📂 Accessing database: leaderboard');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections found:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔒 Connection closed');
    
    console.log('\n🎉 MongoDB connection is working correctly!');
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log('Error:', error.message);
    
    if (isAtlas) {
      console.log('\n🔧 Troubleshooting MongoDB Atlas connection:');
      console.log('1. Check if your cluster is running (not paused)');
      console.log('2. Verify your IP address is whitelisted in MongoDB Atlas');
      console.log('3. Confirm your username and password are correct');
      console.log('4. Check if the cluster name is correct');
    } else if (isLocal) {
      console.log('\n🔧 Troubleshooting Local MongoDB connection:');
      console.log('1. Ensure MongoDB service is running');
      console.log('2. Check if MongoDB is listening on the correct port');
      console.log('3. Verify the database path is accessible');
    }
  }
}

verifyMongoDBConnection();