require('dotenv').config({ path: '.env.local' });

const { MongoClient, ServerApiVersion } = require('mongodb');

// Use the MONGODB_URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://anadi_sharma123:ehRZXFSU2wqK6Mpk@cluster0.kmmxzxb.mongodb.net/leaderboard?retryWrites=true&w=majority&appName=Cluster0";

console.log("Debugging MongoDB Atlas connection...");
console.log("Using URI:", uri.replace(/:[^:@/]*@/, ":***@")); // Hide password

// Create a MongoClient with detailed options
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
  
  // SSL options
  tls: true,
  tlsInsecure: false,
  
  // Additional debugging options
  monitorCommands: true,
});

// Add event listeners for debugging
client.on('connectionReady', () => console.log('✅ Connection ready'));
client.on('connectionClosed', () => console.log('🔒 Connection closed'));
client.on('connectionCheckOutFailed', (event) => console.log('❌ Connection check out failed:', event.reason));
client.on('serverHeartbeatStarted', () => console.log('💓 Server heartbeat started'));
client.on('serverHeartbeatSucceeded', () => console.log('✅ Server heartbeat succeeded'));
client.on('serverHeartbeatFailed', (event) => console.log('❌ Server heartbeat failed:', event.failure));

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    
    // Add a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
    });
    
    // Race the connection with the timeout
    const connectionPromise = client.connect();
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log("✅ Connected to MongoDB Atlas successfully!");
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping successful - MongoDB Atlas is ready!");
    
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error("  Name:", error.name);
    console.error("  Message:", error.message);
    console.error("  Stack:", error.stack);
    
    // Specific error handling
    if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 DNS resolution failed. Please check:");
      console.log("   1. Cluster name is correct");
      console.log("   2. Internet connection is working");
    } else if (error.message.includes("authentication")) {
      console.log("\n💡 Authentication failed. Please check:");
      console.log("   1. Username is correct");
      console.log("   2. Password is correct");
    } else if (error.message.includes("SSL") || error.message.includes("tls")) {
      console.log("\n💡 SSL/TLS connection failed. Please check:");
      console.log("   1. Your Node.js version is up to date");
      console.log("   2. Try connecting with tlsInsecure: true (not recommended for production)");
    } else if (error.message.includes("timeout")) {
      console.log("\n💡 Connection timeout. Please check:");
      console.log("   1. Network connectivity to MongoDB Atlas");
      console.log("   2. Firewall settings");
    }
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