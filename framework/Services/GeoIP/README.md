# GeoIP Service

Laravel-style GeoIP service for IP geolocation using MaxMind GeoLite2 database.

## Features

- 🌍 IP Geolocation (Country, City, Coordinates)
- 🎯 High Accuracy with MaxMind GeoLite2-City Database
- 🚀 Fast In-Memory Lookups
- 🎨 Laravel-Style Facade API
- 💾 Built-in Result Caching
- 🔍 Detailed Location Data (Postal, Subdivisions, Timezone)

## Installation

1. **Install MaxMind Reader**:
```bash
pnpm add maxmind
```

2. **Download GeoLite2-City Database**:

Visit [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) and download `GeoLite2-City.mmdb`.

3. **Configure Database Path**:

Place the database file in your project and configure the path in `config/geoip.cjs`:

```javascript
module.exports = {
  database_path: './storage/geoip/GeoLite2-City.mmdb',
  auto_init: true,
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
  },
};
```

## Usage

### Using Facade (Recommended)

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

// Locate IP with full details
const location = await GeoIP.locate('8.8.8.8');
console.log(location);
// {
//   found: true,
//   ip: '8.8.8.8',
//   country: {
//     code: 'US',
//     name: 'United States'
//   },
//   city: 'Mountain View',
//   location: {
//     latitude: 37.386,
//     longitude: -122.0838,
//     accuracy_radius: 1000,
//     timezone: 'America/Los_Angeles'
//   },
//   postal: '94035',
//   subdivisions: [
//     { code: 'CA', name: 'California' }
//   ],
//   continent: {
//     code: 'NA',
//     name: 'North America'
//   }
// }

// Get country only
const country = await GeoIP.getCountry('8.8.8.8');
console.log(country); // { code: 'US', name: 'United States' }

// Get city
const city = await GeoIP.getCity('8.8.8.8');
console.log(city); // 'Mountain View'

// Get coordinates
const coords = await GeoIP.getCoordinates('8.8.8.8');
console.log(coords); // { latitude: 37.386, longitude: -122.0838 }

// Check if IP is from specific country
const isUS = await GeoIP.isFromCountry('8.8.8.8', 'US');
console.log(isUS); // true
```

### Using Service Directly

```javascript
import app from 'vasuzex/Foundation/Application';

const geoip = app.make('geoip');

const location = await geoip.locate('8.8.8.8');
```

### Real-World Examples

#### 1. **Restrict Access by Country**

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

export const countryBlockMiddleware = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const blockedCountries = ['CN', 'RU', 'KP'];
  
  const country = await GeoIP.getCountry(ip);
  
  if (country && blockedCountries.includes(country.code)) {
    return res.status(403).json({
      error: 'Access denied from your country'
    });
  }
  
  next();
};
```

#### 2. **Show Localized Content**

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

export const localizeContent = async (req, res) => {
  const ip = req.ip;
  const location = await GeoIP.locate(ip);
  
  if (!location.found) {
    return res.json({ content: 'default' });
  }
  
  // Show content based on user's country
  const content = await getContentForCountry(location.country.code);
  
  res.json({
    country: location.country.name,
    city: location.city,
    timezone: location.location.timezone,
    content,
  });
};
```

#### 3. **Fraud Detection**

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

export const detectFraud = async (userId, ip) => {
  const user = await User.findById(userId);
  const currentLocation = await GeoIP.locate(ip);
  
  if (!currentLocation.found) return false;
  
  // Check if user is logging in from a different country
  if (user.lastCountry && user.lastCountry !== currentLocation.country.code) {
    // Calculate distance between last known location and current
    const distance = calculateDistance(
      user.lastLocation.latitude,
      user.lastLocation.longitude,
      currentLocation.location.latitude,
      currentLocation.location.longitude
    );
    
    // If user traveled more than 500km in less than 1 hour - suspicious
    if (distance > 500 && (Date.now() - user.lastLoginAt) < 3600000) {
      return true; // Potential fraud
    }
  }
  
  // Update user's last known location
  await user.update({
    lastCountry: currentLocation.country.code,
    lastLocation: currentLocation.location,
    lastLoginAt: Date.now()
  });
  
  return false;
};
```

#### 4. **Analytics Dashboard**

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

export const trackVisitor = async (req) => {
  const ip = req.ip;
  const location = await GeoIP.locate(ip);
  
  await Analytics.create({
    ip,
    country: location.country?.code,
    city: location.city,
    coordinates: location.location,
    timezone: location.location?.timezone,
    timestamp: new Date(),
    userAgent: req.headers['user-agent'],
  });
};

// Get visitor statistics
export const getVisitorStats = async () => {
  const visitors = await Analytics.find();
  
  // Group by country
  const byCountry = visitors.reduce((acc, v) => {
    acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});
  
  return byCountry;
};
```

#### 5. **Show Currency Based on Location**

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

const currencyByCountry = {
  US: 'USD',
  IN: 'INR',
  GB: 'GBP',
  EU: 'EUR',
  // ... more countries
};

export const detectCurrency = async (req, res) => {
  const ip = req.ip;
  const country = await GeoIP.getCountry(ip);
  
  const currency = currencyByCountry[country?.code] || 'USD';
  
  res.json({
    currency,
    country: country?.name,
  });
};
```

## API Reference

### `locate(ip)`
Get complete location data for an IP address.

**Parameters:**
- `ip` (string) - IPv4 or IPv6 address

**Returns:**
```javascript
{
  found: boolean,
  ip: string,
  country: {
    code: string,      // ISO 3166-1 alpha-2 code
    name: string
  },
  city: string,
  location: {
    latitude: number,
    longitude: number,
    accuracy_radius: number,  // in kilometers
    timezone: string          // IANA timezone
  },
  postal: string,
  subdivisions: [             // States/provinces
    { code: string, name: string }
  ],
  continent: {
    code: string,
    name: string
  },
  registered_country: {
    code: string,
    name: string
  }
}
```

### `getCountry(ip)`
Get country information for an IP.

**Returns:** `{ code: string, name: string }` or `null`

### `getCity(ip)`
Get city name for an IP.

**Returns:** `string` or `null`

### `getCoordinates(ip)`
Get latitude/longitude for an IP.

**Returns:** `{ latitude: number, longitude: number }` or `null`

### `isFromCountry(ip, countryCode)`
Check if IP is from a specific country.

**Parameters:**
- `ip` (string) - IP address
- `countryCode` (string) - ISO 3166-1 alpha-2 code (e.g., 'US', 'IN')

**Returns:** `boolean`

### `getDbInfo()`
Get database metadata.

**Returns:**
```javascript
{
  type: string,           // 'GeoLite2-City'
  buildEpoch: number,     // Unix timestamp
  languages: string[],
  nodeCount: number
}
```

## Configuration

Edit `config/geoip.cjs`:

```javascript
module.exports = {
  // Path to GeoLite2-City.mmdb database
  database_path: env('GEOIP_DATABASE_PATH', './storage/geoip/GeoLite2-City.mmdb'),
  
  // Auto-initialize database on boot
  auto_init: env('GEOIP_AUTO_INIT', true),
  
  // Cache lookup results
  cache: {
    enabled: env('GEOIP_CACHE_ENABLED', true),
    ttl: env('GEOIP_CACHE_TTL', 3600), // 1 hour in seconds
  },
};
```

## Environment Variables

```env
GEOIP_DATABASE_PATH=./storage/geoip/GeoLite2-City.mmdb
GEOIP_AUTO_INIT=true
GEOIP_CACHE_ENABLED=true
GEOIP_CACHE_TTL=3600
```

## Database Updates

GeoLite2 databases are updated monthly. Update script:

```bash
#!/bin/bash
# update-geoip.sh

ACCOUNT_ID="your_account_id"
LICENSE_KEY="your_license_key"
EDITION_ID="GeoLite2-City"
DB_PATH="./storage/geoip"

wget "https://download.maxmind.com/app/geoip_download?edition_id=${EDITION_ID}&license_key=${LICENSE_KEY}&suffix=tar.gz" \
  -O geoip.tar.gz

tar -xzf geoip.tar.gz
mv GeoLite2-City_*/GeoLite2-City.mmdb ${DB_PATH}/
rm -rf GeoLite2-City_* geoip.tar.gz

echo "GeoIP database updated successfully"
```

## Performance

- **Fast In-Memory Lookups**: Database is loaded into memory
- **Average Lookup Time**: ~1-2ms per IP
- **Database Size**: ~70MB (GeoLite2-City)
- **Memory Usage**: ~100-150MB when loaded

## Error Handling

```javascript
import { GeoIP } from 'vasuzex/Support/Facades';

try {
  const location = await GeoIP.locate('8.8.8.8');
  
  if (!location.found) {
    console.log('IP not found in database');
  }
} catch (error) {
  if (error.message.includes('Database not initialized')) {
    console.error('GeoIP database file not found or invalid');
  } else {
    console.error('GeoIP error:', error);
  }
}
```

## License

This service uses MaxMind GeoLite2 database which is licensed under [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).

## Credits

- MaxMind GeoLite2: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
- MaxMind DB Reader: https://github.com/maxmind/GeoIP2-node
