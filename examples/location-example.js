/**
 * Location Service Examples
 * 
 * Demonstrates geospatial queries, distance calculations, and geocoding
 * 
 * Run: node examples/location-example.js
 */

import { Location } from 'vasuzex/Support/Facades';
import app from 'vasuzex/Foundation/Application';
import db from '#database';

// Bootstrap application
await app.boot();

console.log('📍 Location Service Examples\n');

// Example 1: Distance Calculations
console.log('1️⃣  Distance Calculations:');
console.log('━'.repeat(50));

const delhi = { lat: 28.6139, lon: 77.2090, name: 'Delhi' };
const mumbai = { lat: 19.0760, lon: 72.8777, name: 'Mumbai' };
const bangalore = { lat: 12.9716, lon: 77.5946, name: 'Bangalore' };

const cities = [mumbai, bangalore];

cities.forEach(city => {
  const distance = Location.calculateDistance(
    delhi.lat, delhi.lon,
    city.lat, city.lon
  );
  
  const bearing = Location.calculateBearing(
    delhi.lat, delhi.lon,
    city.lat, city.lon
  );
  
  const direction = Location.getDirection(bearing);
  
  console.log(`\n${delhi.name} → ${city.name}:`);
  console.log(`  Distance: ${Location.formatDistance(distance)}`);
  console.log(`  Bearing: ${bearing.toFixed(2)}°`);
  console.log(`  Direction: ${direction}`);
});

// Example 2: Bounding Box
console.log('\n2️⃣  Bounding Box (10km radius):');
console.log('━'.repeat(50));

const box = Location.getBoundingBox(delhi.lat, delhi.lon, 10);
console.log(`Min Latitude: ${box.minLat.toFixed(4)}`);
console.log(`Max Latitude: ${box.maxLat.toFixed(4)}`);
console.log(`Min Longitude: ${box.minLon.toFixed(4)}`);
console.log(`Max Longitude: ${box.maxLon.toFixed(4)}`);

// Check if point is within box
const testPoint = { lat: 28.6500, lon: 77.2200 };
const isInside = Location.isWithinBoundingBox(testPoint.lat, testPoint.lon, box);
console.log(`\nIs (${testPoint.lat}, ${testPoint.lon}) inside box? ${isInside ? '✅ Yes' : '❌ No'}`);

// Example 3: Destination Point
console.log('\n3️⃣  Calculate Destination Point:');
console.log('━'.repeat(50));

const destination = Location.calculateDestination(
  delhi.lat, delhi.lon,
  50, // 50km away
  180 // South
);

console.log(`Starting from Delhi (${delhi.lat}, ${delhi.lon})`);
console.log(`Travel 50km South:`);
console.log(`Destination: (${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)})`);

// Example 4: Validate Coordinates
console.log('\n4️⃣  Validate Coordinates:');
console.log('━'.repeat(50));

const testCoords = [
  { lat: 28.6139, lon: 77.2090, name: 'Valid (Delhi)' },
  { lat: 91.0000, lon: 77.2090, name: 'Invalid (lat > 90)' },
  { lat: 28.6139, lon: 181.0000, name: 'Invalid (lon > 180)' },
];

testCoords.forEach(coord => {
  const isValid = Location.isValidCoordinates(coord.lat, coord.lon);
  console.log(`${coord.name}: ${isValid ? '✅' : '❌'}`);
});

// Example 5: GuruORM - Find Nearby Stores
console.log('\n5️⃣  GuruORM - Find Nearby Stores:');
console.log('━'.repeat(50));

// Sample data (in real app, this would be in database)
console.log('Finding stores within 5km of user location...\n');

// Simulated query (replace with actual database query)
const userLocation = { lat: 28.6139, lon: 77.2090 };

console.log('Query:');
console.log(`db.table('stores')`);
console.log(`  .selectDistance(${userLocation.lat}, ${userLocation.lon})`);
console.log(`  .whereRadius(${userLocation.lat}, ${userLocation.lon}, 5)`);
console.log(`  .orderByDistance(${userLocation.lat}, ${userLocation.lon})`);
console.log(`  .get()`);

// Example result
const mockStores = [
  { id: 1, name: 'Store A', latitude: 28.6200, longitude: 77.2100 },
  { id: 2, name: 'Store B', latitude: 28.6300, longitude: 77.2200 },
  { id: 3, name: 'Store C', latitude: 28.6400, longitude: 77.2300 },
];

console.log('\nResults:');
mockStores.forEach(store => {
  const distance = Location.calculateDistance(
    userLocation.lat, userLocation.lon,
    store.latitude, store.longitude
  );
  console.log(`  ${store.name}: ${Location.formatDistance(distance)}`);
});

// Example 6: Find Nearest Drivers (Ride Sharing)
console.log('\n6️⃣  Ride Sharing - Find Nearest Drivers:');
console.log('━'.repeat(50));

const customer = { lat: 28.6139, lon: 77.2090 };
const drivers = [
  { id: 1, name: 'Driver A', lat: 28.6150, lon: 77.2100, rating: 4.8 },
  { id: 2, name: 'Driver B', lat: 28.6180, lon: 77.2150, rating: 4.5 },
  { id: 3, name: 'Driver C', lat: 28.6200, lon: 77.2200, rating: 4.9 },
  { id: 4, name: 'Driver D', lat: 28.6500, lon: 77.2500, rating: 4.7 },
];

const driversWithDistance = drivers
  .map(driver => ({
    ...driver,
    distance: Location.calculateDistance(
      customer.lat, customer.lon,
      driver.lat, driver.lon
    ),
  }))
  .filter(driver => driver.distance <= 3) // Within 3km
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 3); // Top 3 nearest

console.log('Customer location:', customer);
console.log('\nNearest available drivers:');
driversWithDistance.forEach((driver, index) => {
  const eta = Math.ceil(driver.distance * 5); // 5 min per km
  console.log(`${index + 1}. ${driver.name}`);
  console.log(`   Distance: ${Location.formatDistance(driver.distance)}`);
  console.log(`   Rating: ${driver.rating}⭐`);
  console.log(`   ETA: ~${eta} minutes\n`);
});

// Example 7: Delivery Zone Check (Geofencing)
console.log('7️⃣  Geofencing - Delivery Zone Check:');
console.log('━'.repeat(50));

const restaurant = {
  name: 'Pizza Palace',
  lat: 28.6139,
  lon: 77.2090,
  deliveryRadius: 5, // km
};

const deliveryAddresses = [
  { lat: 28.6200, lon: 77.2100, address: 'Connaught Place' },
  { lat: 28.6500, lon: 77.2200, address: 'Karol Bagh' },
  { lat: 28.7000, lon: 77.3000, address: 'Noida' },
];

console.log(`Restaurant: ${restaurant.name}`);
console.log(`Delivery Radius: ${restaurant.deliveryRadius}km\n`);

deliveryAddresses.forEach(addr => {
  const distance = Location.calculateDistance(
    restaurant.lat, restaurant.lon,
    addr.lat, addr.lon
  );
  
  const canDeliver = distance <= restaurant.deliveryRadius;
  
  console.log(`${addr.address}:`);
  console.log(`  Distance: ${Location.formatDistance(distance)}`);
  console.log(`  Can Deliver: ${canDeliver ? '✅ Yes' : '❌ No'}\n`);
});

// Example 8: Real Estate - Properties Near Metro
console.log('8️⃣  Real Estate - Properties Near Metro:');
console.log('━'.repeat(50));

const metroStation = {
  name: 'Rajiv Chowk Metro',
  lat: 28.6328,
  lon: 77.2197,
};

const properties = [
  { id: 1, name: '2BHK Apartment', lat: 28.6350, lon: 77.2200, price: 5000000 },
  { id: 2, name: '3BHK Villa', lat: 28.6400, lon: 77.2250, price: 12000000 },
  { id: 3, name: '1BHK Studio', lat: 28.6320, lon: 77.2180, price: 3500000 },
  { id: 4, name: '4BHK Penthouse', lat: 28.6500, lon: 77.2400, price: 25000000 },
];

console.log(`Metro Station: ${metroStation.name}\n`);
console.log('Properties within 2km:');

properties
  .map(prop => ({
    ...prop,
    distance: Location.calculateDistance(
      metroStation.lat, metroStation.lon,
      prop.lat, prop.lon
    ),
  }))
  .filter(prop => prop.distance <= 2)
  .sort((a, b) => a.distance - b.distance)
  .forEach(prop => {
    console.log(`\n${prop.name}`);
    console.log(`  Distance from Metro: ${Location.formatDistance(prop.distance)}`);
    console.log(`  Price: ₹${(prop.price / 100000).toFixed(1)} Lakh`);
    console.log(`  Walking Time: ~${Math.ceil(prop.distance * 12)} minutes`);
  });

// Example 9: Service Area Coverage
console.log('\n9️⃣  Service Area Coverage Analysis:');
console.log('━'.repeat(50));

const serviceCenter = { lat: 28.6139, lon: 77.2090, name: 'Main Service Center' };
const serviceRadius = 10; // km

const serviceRequests = [
  { id: 1, address: 'Connaught Place', lat: 28.6315, lon: 77.2167 },
  { id: 2, address: 'Karol Bagh', lat: 28.6500, lon: 77.1900 },
  { id: 3, address: 'Dwarka', lat: 28.5921, lon: 77.0460 },
];

console.log(`Service Center: ${serviceCenter.name}`);
console.log(`Service Radius: ${serviceRadius}km\n`);

let covered = 0;
let notCovered = 0;

serviceRequests.forEach(req => {
  const distance = Location.calculateDistance(
    serviceCenter.lat, serviceCenter.lon,
    req.lat, req.lon
  );
  
  const inRange = distance <= serviceRadius;
  
  if (inRange) covered++;
  else notCovered++;
  
  console.log(`Request #${req.id} - ${req.address}:`);
  console.log(`  Distance: ${Location.formatDistance(distance)}`);
  console.log(`  Status: ${inRange ? '✅ In Service Area' : '❌ Out of Range'}\n`);
});

console.log(`Coverage Summary:`);
console.log(`  Covered: ${covered}/${serviceRequests.length}`);
console.log(`  Coverage Rate: ${((covered / serviceRequests.length) * 100).toFixed(1)}%`);

// Example 10: Travel Route Distance
console.log('\n🔟 Multi-Point Route Distance:');
console.log('━'.repeat(50));

const route = [
  { name: 'Start: Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Stop 1: Agra', lat: 27.1767, lon: 78.0081 },
  { name: 'Stop 2: Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'End: Udaipur', lat: 24.5854, lon: 73.7125 },
];

let totalDistance = 0;

console.log('Route:');
for (let i = 0; i < route.length - 1; i++) {
  const from = route[i];
  const to = route[i + 1];
  
  const distance = Location.calculateDistance(
    from.lat, from.lon,
    to.lat, to.lon
  );
  
  totalDistance += distance;
  
  console.log(`\n${from.name} → ${to.name}`);
  console.log(`  Distance: ${Location.formatDistance(distance)}`);
  console.log(`  Estimated Time: ${Math.ceil(distance / 60)} hours`);
}

console.log('\n' + '━'.repeat(50));
console.log(`Total Route Distance: ${Location.formatDistance(totalDistance)}`);
console.log(`Estimated Travel Time: ${Math.ceil(totalDistance / 60)} hours`);

console.log('\n✅ All examples completed!\n');

// Note: Geocoding examples require Google Maps API key
console.log('💡 Geocoding Examples (requires API key):');
console.log('━'.repeat(50));
console.log(`
// Set in config/location.cjs:
geocoding: {
  provider: 'google',
  api_key: 'YOUR_GOOGLE_MAPS_API_KEY',
}

// Then use:
const location = await Location.geocode('Connaught Place, New Delhi');
console.log(location.latitude, location.longitude);

const address = await Location.reverseGeocode(28.6315, 77.2167);
console.log(address.formatted_address);

const restaurants = await Location.findNearbyPlaces(28.6315, 77.2167, 'restaurant', 1000);
console.log(restaurants);
`);
