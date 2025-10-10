const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the MongoDB connection details
const username = 'anadisharma44_db_user';
const password = process.argv[2]; // Pass password as command line argument
const cluster = 'cluster0.kmmxzxb.mongodb.net';
const dbName = 'leaderboard';

if (!password) {
  console.error('Please provide the password as a command line argument');
  console.log('Usage: node src/scripts/encode-mongodb-uri.js "your_password"');
  process.exit(1);
}

// URL encode the password to handle special characters
const encodedPassword = encodeURIComponent(password);

// Create the MongoDB URI
const uri = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

console.log('Encoded MongoDB URI:');
console.log(uri);

// Test the connection
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function testConnection() {
  try {
    console.log('\nTesting connection...');
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await client.close();
  }
}

testConnection().catch(console.dir);