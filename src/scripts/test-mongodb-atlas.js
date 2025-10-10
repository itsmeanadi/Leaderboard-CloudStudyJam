require('dotenv').config({ path: '.env.local' });

const { MongoClient, ServerApiVersion } = require('mongodb');

// Use the MONGODB_URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb+srv://anadi_sharma123:ehRZXFSU2wqK6Mpk@cluster0.kmmxzxb.mongodb.net/leaderboard?retryWrites=true&w=majority&appName=Cluster0";

console.log("Testing MongoDB Atlas connection...");
console.log("Using URI:", uri.replace(/:[^:@/]*@/, ":***@")); // Hide password

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // SSL options to handle TLS issues
  tls: true,
  tlsInsecure: false,
});

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    
    // Common error handling
    if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 DNS resolution failed. Please check:");
      console.log("   1. Cluster name is correct");
      console.log("   2. Internet connection is working");
      console.log("   3. No firewall blocking the connection");
    } else if (error.message.includes("authentication")) {
      console.log("\n💡 Authentication failed. Please check:");
      console.log("   1. Username is correct");
      console.log("   2. Password is correct");
      console.log("   3. User has proper permissions");
    } else if (error.message.includes("SSL") || error.message.includes("tls")) {
      console.log("\n💡 SSL/TLS connection failed. Please check:");
      console.log("   1. Your Node.js version is up to date");
      console.log("   2. Your system has the latest certificates");
      console.log("   3. Try updating the mongodb package");
      console.log("   4. Check firewall settings");
      console.log("   5. Verify OpenSSL configuration");
    }
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
    console.log("Connection closed.");
  }
}

run().catch(console.dir);