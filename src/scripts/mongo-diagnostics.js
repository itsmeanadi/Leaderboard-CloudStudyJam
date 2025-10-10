require('dotenv').config({ path: '.env.local' });
const dns = require('dns').promises;

async function diagnoseMongoDB() {
  console.log('MongoDB Connection Diagnostics');
  console.log('============================');
  
  // Check if MONGODB_URI is set
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('❌ MONGODB_URI environment variable is not set');
    return;
  }
  
  console.log('✅ MONGODB_URI is set');
  
  // Hide password for security
  const safeUri = uri.replace(/:[^:@/]*@/, ":***@");
  console.log('URI:', safeUri);
  
  // Extract cluster information
  const clusterMatch = uri.match(/mongodb\+srv:\/\/[^:]+:[^@]+@([^/]+)/);
  if (!clusterMatch) {
    console.log('❌ Could not parse cluster information from URI');
    return;
  }
  
  const cluster = clusterMatch[1];
  console.log('Cluster:', cluster);
  
  // Test DNS resolution
  try {
    console.log('Testing DNS resolution...');
    const dnsResult = await dns.lookup(cluster);
    console.log('✅ DNS lookup successful:', dnsResult.address);
  } catch (error) {
    console.log('❌ DNS lookup failed:', error.message);
    console.log('\nTroubleshooting steps:');
    console.log('1. Check if the cluster name is correct');
    console.log('2. Verify your internet connection');
    console.log('3. Check if there are any firewall restrictions');
    return;
  }
  
  // Check if we can connect to the MongoDB port
  try {
    console.log('Testing port connectivity...');
    const net = require('net');
    const socket = new net.Socket();
    
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve('timeout'), 5000);
    });
    
    const connectPromise = new Promise((resolve) => {
      socket.connect(27017, cluster, () => {
        socket.destroy();
        resolve('connected');
      });
      
      socket.on('error', (err) => {
        socket.destroy();
        resolve('error');
      });
    });
    
    const result = await Promise.race([connectPromise, timeoutPromise]);
    
    if (result === 'connected') {
      console.log('✅ Port connectivity test successful');
    } else if (result === 'timeout') {
      console.log('❌ Port connectivity test timed out');
    } else {
      console.log('❌ Port connectivity test failed');
    }
  } catch (error) {
    console.log('❌ Port connectivity test failed:', error.message);
  }
  
  console.log('\nAdditional troubleshooting steps:');
  console.log('1. Verify your username and password are correct');
  console.log('2. Check if your IP address is whitelisted in MongoDB Atlas');
  console.log('3. Verify your database user has proper permissions');
  console.log('4. Check if your MongoDB Atlas cluster is running (not paused)');
}

diagnoseMongoDB();