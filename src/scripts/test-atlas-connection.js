require('dotenv').config({ path: '.env.local' });

// Simple DNS test for MongoDB Atlas
const dns = require('dns');

console.log('Testing MongoDB Atlas connection...');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.log('❌ MONGODB_URI is not set');
  process.exit(1);
}

console.log('MONGODB_URI:', MONGODB_URI.replace(/:[^:@/]*@/, ":***@"));

// Extract hostname from URI
const match = MONGODB_URI.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^/]+)/);
if (!match) {
  console.log('❌ Could not parse hostname from URI');
  process.exit(1);
}

const hostname = match[1];
console.log('Hostname:', hostname);

// Test DNS resolution
dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.log('❌ DNS lookup failed:', err.message);
    console.log('This indicates that the MongoDB Atlas cluster is not accessible.');
    console.log('\nPossible solutions:');
    console.log('1. Check if the cluster name is correct in your MongoDB Atlas dashboard');
    console.log('2. Verify that your MongoDB Atlas cluster is not paused');
    console.log('3. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('4. Verify your username and password are correct');
  } else {
    console.log('✅ DNS lookup successful');
    console.log('Address:', address);
    console.log('Family:', family);
  }
});