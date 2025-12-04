/**
 * GeoIP Service Examples
 * 
 * Demonstrates IP geolocation using MaxMind GeoLite2 database
 * 
 * Setup:
 * 1. pnpm add maxmind
 * 2. Download GeoLite2-City.mmdb from https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
 * 3. Place database in ./storage/geoip/GeoLite2-City.mmdb
 * 4. Run: node examples/geoip-example.js
 */

import { GeoIP } from 'vasuzex/Support/Facades';
import app from 'vasuzex/Foundation/Application';

// Bootstrap application
await app.boot();

console.log('🌍 GeoIP Service Examples\n');

// Example 1: Locate IP with Full Details
console.log('1️⃣  Full IP Location Lookup:');
console.log('━'.repeat(50));

const testIPs = [
  '8.8.8.8',        // Google DNS (US)
  '1.1.1.1',        // Cloudflare DNS
  '208.67.222.222', // OpenDNS
  '103.21.244.0',   // Example IP
];

for (const ip of testIPs) {
  const location = await GeoIP.locate(ip);
  
  if (location.found) {
    console.log(`\nIP: ${location.ip}`);
    console.log(`Country: ${location.country.name} (${location.country.code})`);
    console.log(`City: ${location.city || 'Unknown'}`);
    
    if (location.location) {
      console.log(`Coordinates: ${location.location.latitude}, ${location.location.longitude}`);
      console.log(`Timezone: ${location.location.timezone}`);
      console.log(`Accuracy: ±${location.location.accuracy_radius}km`);
    }
    
    if (location.postal) {
      console.log(`Postal Code: ${location.postal}`);
    }
    
    if (location.subdivisions?.length > 0) {
      const states = location.subdivisions.map(s => s.name).join(', ');
      console.log(`State/Province: ${states}`);
    }
    
    console.log(`Continent: ${location.continent.name}`);
  } else {
    console.log(`\nIP: ${ip} - Not found in database`);
  }
}

console.log('\n' + '━'.repeat(50));

// Example 2: Get Country Only
console.log('\n2️⃣  Get Country Information:');
console.log('━'.repeat(50));

const country = await GeoIP.getCountry('8.8.8.8');
console.log(`Country: ${country.name} (${country.code})`);

// Example 3: Get City
console.log('\n3️⃣  Get City:');
console.log('━'.repeat(50));

const city = await GeoIP.getCity('8.8.8.8');
console.log(`City: ${city || 'Unknown'}`);

// Example 4: Get Coordinates
console.log('\n4️⃣  Get GPS Coordinates:');
console.log('━'.repeat(50));

const coords = await GeoIP.getCoordinates('8.8.8.8');
if (coords) {
  console.log(`Latitude: ${coords.latitude}`);
  console.log(`Longitude: ${coords.longitude}`);
  console.log(`Google Maps: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`);
}

// Example 5: Check Country
console.log('\n5️⃣  Country Verification:');
console.log('━'.repeat(50));

const isUS = await GeoIP.isFromCountry('8.8.8.8', 'US');
console.log(`Is 8.8.8.8 from US? ${isUS ? 'Yes' : 'No'}`);

const isIN = await GeoIP.isFromCountry('8.8.8.8', 'IN');
console.log(`Is 8.8.8.8 from India? ${isIN ? 'Yes' : 'No'}`);

// Example 6: Database Information
console.log('\n6️⃣  Database Information:');
console.log('━'.repeat(50));

const dbInfo = await GeoIP.getDbInfo();
console.log(`Database Type: ${dbInfo.type}`);
console.log(`Build Date: ${new Date(dbInfo.buildEpoch * 1000).toLocaleDateString()}`);
console.log(`Languages: ${dbInfo.languages.join(', ')}`);
console.log(`Total Records: ${dbInfo.nodeCount.toLocaleString()}`);

// Example 7: Real-World Use Case - Access Control
console.log('\n7️⃣  Access Control Example:');
console.log('━'.repeat(50));

async function checkAccess(ip, allowedCountries = ['US', 'IN', 'GB']) {
  const country = await GeoIP.getCountry(ip);
  
  if (!country) {
    return { allowed: false, reason: 'Unknown location' };
  }
  
  const allowed = allowedCountries.includes(country.code);
  
  return {
    allowed,
    country: country.name,
    reason: allowed ? 'Access granted' : `Access denied - ${country.name} not allowed`
  };
}

const testAccess = await checkAccess('8.8.8.8'); // US IP
console.log(`IP: 8.8.8.8`);
console.log(`Country: ${testAccess.country}`);
console.log(`Status: ${testAccess.reason}`);
console.log(`Allowed: ${testAccess.allowed ? '✅' : '❌'}`);

// Example 8: Calculate Distance Between IPs
console.log('\n8️⃣  Distance Calculation:');
console.log('━'.repeat(50));

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const loc1 = await GeoIP.getCoordinates('8.8.8.8'); // Google DNS
const loc2 = await GeoIP.getCoordinates('1.1.1.1'); // Cloudflare

if (loc1 && loc2) {
  const distance = calculateDistance(
    loc1.latitude,
    loc1.longitude,
    loc2.latitude,
    loc2.longitude
  );
  console.log(`Distance between 8.8.8.8 and 1.1.1.1: ${distance.toFixed(2)} km`);
}

// Example 9: Detect Suspicious Login
console.log('\n9️⃣  Fraud Detection Example:');
console.log('━'.repeat(50));

async function detectSuspiciousLogin(previousIP, currentIP, lastLoginTime) {
  const prevLoc = await GeoIP.locate(previousIP);
  const currLoc = await GeoIP.locate(currentIP);
  
  if (!prevLoc.found || !currLoc.found) {
    return { suspicious: false, reason: 'Unknown location' };
  }
  
  // Different country
  if (prevLoc.country.code !== currLoc.country.code) {
    const timeDiff = Date.now() - lastLoginTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 2) {
      return {
        suspicious: true,
        reason: `Login from ${currLoc.country.name} within ${hoursDiff.toFixed(1)} hours of login from ${prevLoc.country.name}`,
        previousCountry: prevLoc.country.name,
        currentCountry: currLoc.country.name,
      };
    }
  }
  
  return { suspicious: false };
}

const suspiciousCheck = await detectSuspiciousLogin(
  '8.8.8.8',        // Previous: US
  '103.21.244.0',   // Current: Different location
  Date.now() - (30 * 60 * 1000) // 30 minutes ago
);

console.log(`Suspicious Activity: ${suspiciousCheck.suspicious ? '⚠️  YES' : '✅ NO'}`);
if (suspiciousCheck.reason) {
  console.log(`Reason: ${suspiciousCheck.reason}`);
}

// Example 10: Visitor Analytics
console.log('\n🔟 Visitor Analytics:');
console.log('━'.repeat(50));

const visitors = [
  '8.8.8.8',
  '1.1.1.1',
  '208.67.222.222',
  '8.8.8.8', // Duplicate
  '103.21.244.0',
];

const analytics = {};

for (const ip of visitors) {
  const country = await GeoIP.getCountry(ip);
  if (country) {
    analytics[country.code] = analytics[country.code] || {
      name: country.name,
      count: 0
    };
    analytics[country.code].count++;
  }
}

console.log('\nVisitors by Country:');
Object.entries(analytics)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([code, data]) => {
    console.log(`  ${code}: ${data.name} - ${data.count} visitor(s)`);
  });

console.log('\n✅ All examples completed!\n');
