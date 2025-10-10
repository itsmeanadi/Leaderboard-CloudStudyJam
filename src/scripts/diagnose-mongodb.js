require('dotenv').config({ path: '.env.local' });

console.log("MongoDB Atlas Connection Diagnostics");
console.log("====================================");

// Check if MONGODB_URI is set
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("❌ MONGODB_URI environment variable is not set");
  console.log("\nPlease set it in your .env.local file:");
  console.log("MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/database-name");
  process.exit(1);
}

console.log("✅ MONGODB_URI is set");

// Hide password for security
const safeUri = uri.replace(/:[^:@/]*@/, ":***@");
console.log("Using URI:", safeUri);

// Extract cluster information
const clusterMatch = uri.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^/]+)/);
if (clusterMatch) {
  const cluster = clusterMatch[1];
  console.log("Cluster:", cluster);
  
  // Test DNS resolution
  const dns = require('dns');
  dns.lookup(cluster, (err, address, family) => {
    if (err) {
      console.log("❌ DNS lookup failed:", err.message);
      console.log("\nTroubleshooting steps:");
      console.log("1. Check if the cluster name is correct");
      console.log("2. Verify your internet connection");
      console.log("3. Check if there are any firewall restrictions");
      process.exit(1);
    } else {
      console.log("✅ DNS lookup successful:", address);
      console.log("\nYour MongoDB Atlas connection string appears to be correctly formatted.");
      console.log("If you're still having connection issues, please check:");
      console.log("1. Your username and password are correct");
      console.log("2. Your IP address is whitelisted in MongoDB Atlas");
      console.log("3. Your database user has proper permissions");
    }
  });
} else {
  console.log("❌ Could not parse cluster information from URI");
  console.log("Please ensure your URI follows the format:");
  console.log("mongodb+srv://username:password@cluster-name.mongodb.net/database-name");
  process.exit(1);
}