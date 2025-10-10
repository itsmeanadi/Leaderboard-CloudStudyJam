require('dotenv').config({ path: '.env.local' });

const { MongoClient, ServerApiVersion } = require('mongodb');

// Get the MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

console.log("Using MongoDB URI:", uri.replace(/:[^:@]*@/, ":***@")); // Hide password in logs

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  connectTimeoutMS: 5000, // 5 second connection timeout
});

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    
    // Connect the client to the server
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas successfully!");
    
    // List databases to verify connection
    const databases = await client.db().admin().listDatabases();
    console.log("Databases:", databases.databases.map(db => db.name));
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping successful - MongoDB Atlas is ready!");
    
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error("  Name:", error.name);
    console.error("  Message:", error.message);
    
    // Check for common issues
    if (error.message.includes("authentication failed")) {
      console.log("\n💡 Authentication failed. Please check:");
      console.log("   1. Database username is correct");
      console.log("   2. Password is correct and properly URL-encoded");
      console.log("   3. User has proper permissions");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Network connection failed. Please check:");
      console.log("   1. Your internet connection");
      console.log("   2. MongoDB Atlas cluster is running");
      console.log("   3. Your IP is whitelisted in MongoDB Atlas");
    } else if (error.message.includes("Server selection timed out")) {
      console.log("\n💡 Server selection timed out. Please check:");
      console.log("   1. MongoDB Atlas cluster status");
      console.log("   2. Network connectivity");
      console.log("   3. Firewall settings");
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("Connection closed.");
    process.exit(0);
  }
}

// Set a timeout to prevent hanging
setTimeout(() => {
  console.error("❌ Connection timed out after 10 seconds");
  process.exit(1);
}, 10000);

run().catch(error => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});