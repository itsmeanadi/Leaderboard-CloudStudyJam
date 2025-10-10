require('dotenv').config({ path: '.env.local' });

const { MongoClient, ServerApiVersion } = require('mongodb');

// Use the MONGODB_URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://anadi_sharma123:ehRZXFSU2wqK6Mpk@cluster0.kmmxzxb.mongodb.net/leaderboard?retryWrites=true&w=majority&appName=Cluster0";

console.log("Testing MongoDB Atlas connection with relaxed SSL settings...");
console.log("Using URI:", uri.replace(/:[^:@/]*@/, ":***@")); // Hide password

// Create a MongoClient with relaxed SSL options for testing
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Connection timeout options
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  
  // Relaxed SSL options for testing
  tls: true,
  tlsInsecure: true, // This allows connections to servers with invalid certificates (NOT recommended for production)
  // Note: tlsInsecure already encompasses tlsAllowInvalidCertificates and tlsAllowInvalidHostnames
});

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas with relaxed SSL settings...");
    
    // Add a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
    });
    
    // Race the connection with the timeout
    const connectionPromise = client.connect();
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log("✅ Connected to MongoDB Atlas successfully with relaxed SSL settings!");
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping successful - MongoDB Atlas is ready!");
    
    // If this works, it indicates an SSL certificate issue
    console.log("\n⚠️  WARNING: Connected with relaxed SSL settings!");
    console.log("   This indicates there may be an SSL certificate issue with your connection.");
    console.log("   DO NOT use these relaxed settings in production!");
    
  } catch (error) {
    console.error("❌ Connection failed even with relaxed SSL settings:");
    console.error("  Name:", error.name);
    console.error("  Message:", error.message);
    
  } finally {
    // Ensures that the client will close when you finish/error
    try {
      await client.close();
      console.log("Connection closed.");
    } catch (closeError) {
      console.error("Error closing connection:", closeError.message);
    }
    process.exit(0);
  }
}

run().catch(error => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});