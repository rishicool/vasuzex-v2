# Location Service

Laravel-style geospatial service for location-based queries, distance calculations, and geocoding.

## Features

- 📍 **Distance Calculations** - Haversine formula for accurate distances
- 🔍 **Nearby Search** - Find items within radius
- 🗺️ **GuruORM Integration** - Geospatial query builder methods
- 🌍 **Geocoding** - Address ↔ Coordinates conversion (Google Maps)
- 📊 **Bounding Box** - Fast proximity queries
- 🎯 **Nearest Items** - Find closest N items
- 🧭 **Bearing & Direction** - Calculate bearing between points
- 🏢 **Places API** - Find nearby businesses (restaurants, hospitals, etc.)

## Installation

```bash
# No additional dependencies for basic distance calculations

# For geocoding (optional)
pnpm add node-fetch
```

## Basic Usage

### Distance Calculation

```javascript
import { Location } from 'vasuzex/Support/Facades';

// Calculate distance between two points
const distance = Location.calculateDistance(
  28.6139, 77.2090, // Delhi coordinates
  19.0760, 72.8777, // Mumbai coordinates
  'km'
);
console.log(`Distance: ${distance.toFixed(2)} km`); // ~1149 km

// Format distance for display
const formatted = Location.formatDistance(distance);
console.log(formatted); // "1149.23 km"

// Short distances
const shortDistance = Location.formatDistance(0.5); // "500 m"
```

### Bearing & Direction

```javascript
import { Location } from 'vasuzex/Support/Facades';

// Calculate bearing
const bearing = Location.calculateBearing(
  28.6139, 77.2090, // From Delhi
  19.0760, 72.8777  // To Mumbai
);
console.log(`Bearing: ${bearing.toFixed(2)}°`); // ~203°

// Get compass direction
const direction = Location.getDirection(bearing);
console.log(`Direction: ${direction}`); // "SW" (Southwest)
```

### Bounding Box

```javascript
import { Location } from 'vasuzex/Support/Facades';

// Get bounding box for 10km radius around Delhi
const box = Location.getBoundingBox(28.6139, 77.2090, 10);
console.log(box);
// {
//   minLat: 28.5240,
//   maxLat: 28.7038,
//   minLon: 77.0850,
//   maxLon: 77.3330
// }

// Check if coordinates are within box
const isInside = Location.isWithinBoundingBox(28.6500, 77.2200, box);
console.log(isInside); // true
```

## GuruORM Integration

### Setup

Install location query methods into GuruORM:

```javascript
// In your bootstrap file
import { installLocationMethods } from 'vasuzex/Services/Location';
import { QueryBuilder } from '#database';

// Install methods
installLocationMethods(QueryBuilder);
```

Or use LocationServiceProvider (automatic):

```javascript
// framework/Foundation/Application.js
import LocationServiceProvider from 'vasuzex/Services/Location/LocationServiceProvider';

app.register(new LocationServiceProvider(app));
await app.boot();
```

### Database Schema

Create a table with latitude/longitude columns:

```sql
-- MySQL
CREATE TABLE stores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  INDEX idx_location (latitude, longitude)
);

-- PostgreSQL with PostGIS
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  location GEOGRAPHY(POINT, 4326),
  address TEXT
);
CREATE INDEX idx_stores_location ON stores USING GIST(location);
```

### Find Nearby Items

```javascript
import db from '#database';

// Find stores within 5km of user's location
const userLat = 28.6139;
const userLon = 77.2090;

const nearbyStores = await db.table('stores')
  .selectDistance(userLat, userLon) // Adds 'distance' column
  .whereRadius(userLat, userLon, 5) // Within 5km
  .orderByDistance(userLat, userLon) // Nearest first
  .get();

console.log(nearbyStores);
// [
//   { id: 1, name: 'Store A', latitude: 28.6200, longitude: 77.2100, distance: 0.85 },
//   { id: 3, name: 'Store C', latitude: 28.6300, longitude: 77.2200, distance: 2.13 },
//   ...
// ]
```

### Find Nearest N Items

```javascript
// Find 10 nearest stores
const nearest10 = await db.table('stores')
  .nearest(userLat, userLon, 10)
  .get();
```

### Optimized Radius Search

```javascript
// Use bounding box + exact distance (faster for large datasets)
const stores = await db.table('stores')
  .withinRadius(userLat, userLon, 10) // 10km radius
  .get();

// This combines:
// 1. Bounding box filter (fast index scan)
// 2. Exact distance calculation
// 3. Ordering by distance
```

### Custom Column Names

```javascript
// If your columns are named differently
const results = await db.table('locations')
  .selectDistance(userLat, userLon, 'lat', 'lng', 'km', 'distance')
  .whereRadius(userLat, userLon, 5, 'lat', 'lng')
  .orderByDistance(userLat, userLon, 'asc', 'lat', 'lng')
  .get();
```

### PostGIS Queries

```javascript
// For PostgreSQL with PostGIS
const stores = await db.table('stores')
  .selectPostGISDistance(userLat, userLon, 'location', 'distance')
  .wherePostGISDistance(userLat, userLon, 5, 'location') // 5km radius
  .orderByRaw('distance ASC')
  .get();
```

## Geocoding (Google Maps)

### Configuration

```javascript
// config/location.cjs
module.exports = {
  geocoding: {
    provider: 'google',
    api_key: process.env.GOOGLE_MAPS_API_KEY,
    options: {
      language: 'en',
      region: 'IN', // Bias results to India
    },
  },
};
```

### Address to Coordinates

```javascript
import { Location } from 'vasuzex/Support/Facades';

// Geocode address
const result = await Location.geocode('Connaught Place, New Delhi');
console.log(result);
// {
//   latitude: 28.6315,
//   longitude: 77.2167,
//   formatted_address: 'Connaught Place, New Delhi, Delhi 110001, India',
//   place_id: 'ChIJ...',
//   types: ['locality', 'political'],
//   address_components: [...]
// }
```

### Coordinates to Address

```javascript
import { Location } from 'vasuzex/Support/Facades';

// Reverse geocode
const address = await Location.reverseGeocode(28.6315, 77.2167);
console.log(address.formatted_address);
// "Connaught Place, New Delhi, Delhi 110001, India"
```

### Find Nearby Places

```javascript
import { Location } from 'vasuzex/Support/Facades';

// Find nearby restaurants
const restaurants = await Location.findNearbyPlaces(
  28.6315, 77.2167,
  'restaurant',
  1000 // 1km radius in meters
);

console.log(restaurants);
// [
//   {
//     place_id: 'ChIJ...',
//     name: 'Dominos Pizza',
//     vicinity: 'Connaught Place',
//     types: ['restaurant', 'food'],
//     rating: 4.2,
//     latitude: 28.6320,
//     longitude: 77.2180,
//     open_now: true
//   },
//   ...
// ]
```

## Real-World Examples

### 1. Food Delivery - Find Nearby Restaurants

```javascript
import db from '#database';
import { Location } from 'vasuzex/Support/Facades';

export async function getNearbyRestaurants(userLat, userLon, radius = 5) {
  const restaurants = await db.table('restaurants')
    .selectDistance(userLat, userLon)
    .whereRadius(userLat, userLon, radius)
    .where('is_active', true)
    .where('is_accepting_orders', true)
    .orderByDistance(userLat, userLon)
    .get();

  return restaurants.map(restaurant => ({
    ...restaurant,
    distance_text: Location.formatDistance(restaurant.distance),
    estimated_delivery_time: Math.ceil(restaurant.distance * 10) + 20, // minutes
  }));
}
```

### 2. Ride Sharing - Find Nearby Drivers

```javascript
import db from '#database';

export async function findNearbyDrivers(userLat, userLon, maxDistance = 3) {
  const drivers = await db.table('drivers')
    .select('id', 'name', 'vehicle_type', 'rating', 'latitude', 'longitude')
    .selectDistance(userLat, userLon)
    .whereBoundingBox(userLat, userLon, maxDistance) // Fast filter
    .whereDistance(userLat, userLon, maxDistance) // Exact distance
    .where('is_available', true)
    .where('is_online', true)
    .orderByDistance(userLat, userLon)
    .limit(10)
    .get();

  return drivers;
}
```

### 3. Store Locator

```javascript
import db from '#database';
import { Location } from 'vasuzex/Support/Facades';

export async function storeLocator(req, res) {
  const { address, radius = 10 } = req.query;

  // Geocode user's address
  const location = await Location.geocode(address);

  // Find nearby stores
  const stores = await db.table('stores')
    .selectDistance(location.latitude, location.longitude)
    .whereRadius(location.latitude, location.longitude, radius)
    .where('is_active', true)
    .orderByDistance(location.latitude, location.longitude)
    .get();

  res.json({
    user_location: {
      address: location.formatted_address,
      latitude: location.latitude,
      longitude: location.longitude,
    },
    stores: stores.map(store => ({
      ...store,
      distance_text: Location.formatDistance(store.distance),
    })),
  });
}
```

### 4. Geofencing - Check if User is in Area

```javascript
import { Location } from 'vasuzex/Support/Facades';

export function isUserInDeliveryZone(userLat, userLon, storeLat, storeLon, deliveryRadius = 5) {
  const distance = Location.calculateDistance(userLat, userLon, storeLat, storeLon);
  return distance <= deliveryRadius;
}

// Usage in order placement
export async function placeOrder(userId, storeId, userLat, userLon) {
  const store = await db.table('stores').find(storeId);
  
  if (!isUserInDeliveryZone(userLat, userLon, store.latitude, store.longitude, store.delivery_radius)) {
    throw new Error('Sorry, we don\'t deliver to your location');
  }
  
  // Process order...
}
```

### 5. Real Estate - Properties Near Me

```javascript
import db from '#database';

export async function searchProperties(filters) {
  const { lat, lon, radius = 5, min_price, max_price, bedrooms } = filters;

  let query = db.table('properties')
    .selectDistance(lat, lon)
    .withinRadius(lat, lon, radius);

  if (min_price) query.where('price', '>=', min_price);
  if (max_price) query.where('price', '<=', max_price);
  if (bedrooms) query.where('bedrooms', '>=', bedrooms);

  const properties = await query
    .where('status', 'available')
    .orderByDistance(lat, lon)
    .get();

  return properties;
}
```

### 6. Service Provider Assignment

```javascript
import db from '#database';

export async function assignNearestServiceProvider(customerLat, customerLon, serviceType) {
  const provider = await db.table('service_providers')
    .selectDistance(customerLat, customerLon)
    .where('service_type', serviceType)
    .where('is_available', true)
    .orderByDistance(customerLat, customerLon)
    .first();

  if (!provider) {
    throw new Error('No service provider available nearby');
  }

  // Assign provider
  await db.table('service_providers')
    .where('id', provider.id)
    .update({ is_available: false });

  return provider;
}
```

## API Reference

### LocationManager Methods

#### `calculateDistance(lat1, lon1, lat2, lon2, unit = 'km')`
Calculate distance between two coordinates using Haversine formula.

#### `calculateBearing(lat1, lon1, lat2, lon2)`
Calculate bearing (direction) between two points in degrees (0-360).

#### `getDirection(bearing)`
Convert bearing to compass direction (N, NE, E, SE, S, SW, W, NW).

#### `getBoundingBox(lat, lon, radius)`
Get bounding box coordinates for a radius.

#### `isWithinBoundingBox(lat, lon, box)`
Check if coordinates are within a bounding box.

#### `calculateDestination(lat, lon, distance, bearing)`
Calculate destination point given distance and bearing.

#### `isValidCoordinates(lat, lon)`
Validate latitude/longitude values.

#### `formatDistance(distance, unit = 'km')`
Format distance for human readability.

### GuruORM Query Builder Methods

#### `.selectDistance(lat, lon, latCol?, lonCol?, unit?, alias?)`
Add distance calculation as column.

#### `.whereDistance(lat, lon, radius, latCol?, lonCol?, unit?)`
Filter by distance from point.

#### `.whereRadius(lat, lon, radius, latCol?, lonCol?, unit?)`
Alias for `whereDistance`.

#### `.whereBoundingBox(lat, lon, radius, latCol?, lonCol?)`
Filter by bounding box (faster for large datasets).

#### `.orderByDistance(lat, lon, direction?, latCol?, lonCol?, unit?)`
Order results by distance.

#### `.nearest(lat, lon, limit?, latCol?, lonCol?, unit?)`
Find nearest N items.

#### `.withinRadius(lat, lon, radius, latCol?, lonCol?, unit?)`
Optimized radius search (bounding box + distance).

#### `.wherePostGISDistance(lat, lon, radius, column?)`
PostGIS distance filter.

#### `.selectPostGISDistance(lat, lon, column?, alias?)`
PostGIS distance select.

## Configuration

Edit `config/location.cjs`:

```javascript
module.exports = {
  default_lat_column: 'latitude',
  default_lon_column: 'longitude',
  default_unit: 'km', // or 'mi'
  default_radius: 10,
  
  geocoding: {
    provider: 'google',
    api_key: process.env.GOOGLE_MAPS_API_KEY,
    options: {
      language: 'en',
      region: 'IN',
    },
  },
  
  driver: 'mysql', // 'postgres', 'postgis'
  
  postgis: {
    point_column: 'location',
    srid: 4326,
  },
};
```

## Environment Variables

```env
LOCATION_DEFAULT_UNIT=km
LOCATION_DEFAULT_RADIUS=10
LOCATION_DB_DRIVER=mysql

# Geocoding (optional)
GEOCODING_PROVIDER=google
GEOCODING_API_KEY=your_google_maps_api_key
GEOCODING_LANGUAGE=en
GEOCODING_REGION=IN
```

## Performance Tips

1. **Use Bounding Box First**: For large datasets, filter with `whereBoundingBox()` before exact distance calculation
2. **Add Indexes**: Create indexes on latitude/longitude columns
3. **Limit Results**: Use `.limit()` to reduce dataset size
4. **PostGIS**: Use PostGIS for PostgreSQL - much faster than Haversine
5. **Cache Results**: Cache geocoding results to avoid repeated API calls

```javascript
// Good - Fast for large datasets
db.table('stores')
  .whereBoundingBox(lat, lon, 10) // Index scan
  .selectDistance(lat, lon)
  .whereDistance(lat, lon, 10)
  .limit(50)

// Slower - No bounding box filter
db.table('stores')
  .selectDistance(lat, lon)
  .whereDistance(lat, lon, 10) // Full table scan with distance calc
```

## License

MIT
