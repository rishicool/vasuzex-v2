# GeoIP Service

IP geolocation with MaxMind and IP2Location providers.

## Features

- 🌍 **MaxMind GeoIP2** - Industry-standard geolocation
- 📍 **IP2Location** - Alternative provider with city/region data
- 🚀 **Fast Lookups** - Binary database search
- 💾 **Caching** - Optional Redis/File caching
- 🔄 **Fallback Support** - Auto-switch on failure
- 📊 **Rich Data** - Country, region, city, coordinates

## Quick Start

```javascript
import { GeoIP } from '@vasuzex/framework';

// Get location from IP
const location = await GeoIP.lookup('8.8.8.8');

console.log(location.country); // US
console.log(location.city); // Mountain View
console.log(location.latitude); // 37.386
console.log(location.longitude); // -122.0838
```

## Configuration

**File:** `config/geoip.cjs`

```javascript
module.exports = {
  // Default provider
  default: env('GEOIP_PROVIDER', 'maxmind'),

  // Provider configurations
  providers: {
    maxmind: {
      driver: 'maxmind',
      database: env('MAXMIND_DB_PATH', 'storage/geoip/GeoLite2-City.mmdb'),
      accountId: env('MAXMIND_ACCOUNT_ID'),
      licenseKey: env('MAXMIND_LICENSE_KEY')
    },

    ip2location: {
      driver: 'ip2location',
      database: env('IP2LOCATION_DB_PATH', 'storage/geoip/IP2LOCATION-LITE-DB11.BIN'),
      apiKey: env('IP2LOCATION_API_KEY')
    }
  },

  // Caching
  cache: {
    enabled: true,
    driver: 'redis',
    ttl: 86400, // 24 hours
    prefix: 'geoip:'
  },

  // Options
  options: {
    timeout: 5000,
    fallback: true,
    defaultCountry: 'US'
  }
};
```

## Providers

### MaxMind GeoIP2 (Recommended)

Industry-standard IP geolocation.

```javascript
const maxmind = GeoIP.provider('maxmind');

// Basic lookup
const location = await maxmind.lookup('1.1.1.1');

console.log(location.country);      // AU
console.log(location.countryCode);  // AU
console.log(location.region);       // Queensland
console.log(location.city);         // Brisbane
console.log(location.postalCode);   // 4000
console.log(location.latitude);     // -27.4679
console.log(location.longitude);    // 153.0281
console.log(location.timezone);     // Australia/Brisbane
```

**Database Setup:**

1. Download GeoLite2 database:
   ```bash
   # Sign up at https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
   wget https://download.maxmind.com/app/geoip_download \
     ?edition_id=GeoLite2-City&suffix=tar.gz \
     -O GeoLite2-City.tar.gz
   
   tar -xzf GeoLite2-City.tar.gz
   mv GeoLite2-City_*/GeoLite2-City.mmdb storage/geoip/
   ```

2. Or use API (no database needed):
   ```javascript
   const location = await maxmind.lookupApi('8.8.8.8');
   ```

**Features:**
- Binary database (fast)
- Comprehensive data
- Regular updates
- Accuracy guarantee
- ISP/ASN data (with GeoIP2)

### IP2Location Provider

Alternative provider with good coverage.

```javascript
const ip2location = GeoIP.provider('ip2location');

const location = await ip2location.lookup('8.8.8.8');

console.log(location.country);      // United States
console.log(location.countryCode);  // US
console.log(location.region);       // California
console.log(location.city);         // Mountain View
console.log(location.zipCode);      // 94043
console.log(location.latitude);     // 37.386
console.log(location.longitude);    // -122.0838
console.log(location.timezone);     // -08:00
```

**Database Setup:**

1. Download LITE database:
   ```bash
   # Sign up at https://lite.ip2location.com
   wget https://www.ip2location.com/download/?token=YOUR_TOKEN \
     -O IP2LOCATION-LITE-DB11.BIN.ZIP
   
   unzip IP2LOCATION-LITE-DB11.BIN.ZIP
   mv IP2LOCATION-LITE-DB11.BIN storage/geoip/
   ```

**Features:**
- Binary database
- City-level accuracy
- Timezone info
- Free LITE version
- Commercial DB with more data

## Real-World Examples

### 1. Location-Based Content

```javascript
router.get('/content', async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'];
  const location = await GeoIP.lookup(ip);
  
  // Show content based on country
  if (location.countryCode === 'IN') {
    res.render('content-india');
  } else if (location.countryCode === 'US') {
    res.render('content-usa');
  } else {
    res.render('content-global');
  }
});
```

### 2. Currency Detection

```javascript
async function detectCurrency(ip) {
  const location = await GeoIP.lookup(ip);
  
  const currencyMap = {
    'IN': 'INR',
    'US': 'USD',
    'GB': 'GBP',
    'EU': 'EUR',
    'AU': 'AUD'
  };
  
  return currencyMap[location.countryCode] || 'USD';
}

router.get('/products', async (req, res) => {
  const currency = await detectCurrency(req.ip);
  const products = await Product.all();
  
  res.json({
    products,
    currency,
    prices: products.map(p => p.getPriceIn(currency))
  });
});
```

### 3. Fraud Detection

```javascript
async function checkFraudRisk(ip, userId) {
  const location = await GeoIP.lookup(ip);
  const user = await User.find(userId);
  
  // Check if IP country matches user's registered country
  if (location.countryCode !== user.country) {
    await Alert.create({
      type: 'suspicious_login',
      userId,
      ip,
      detectedCountry: location.countryCode,
      registeredCountry: user.country
    });
    
    return { risk: 'high', reason: 'Country mismatch' };
  }
  
  return { risk: 'low' };
}
```

### 4. Analytics & Tracking

```javascript
async function trackVisitor(req) {
  const ip = req.ip;
  const location = await GeoIP.lookup(ip);
  
  await Analytics.create({
    ip,
    country: location.country,
    countryCode: location.countryCode,
    city: location.city,
    region: location.region,
    latitude: location.latitude,
    longitude: location.longitude,
    userAgent: req.headers['user-agent'],
    page: req.path,
    timestamp: new Date()
  });
}

router.use(trackVisitor);
```

### 5. Location-Based Redirects

```javascript
router.get('/', async (req, res) => {
  const location = await GeoIP.lookup(req.ip);
  
  // Redirect to country-specific subdomain
  const subdomains = {
    'IN': 'in',
    'US': 'www',
    'GB': 'uk',
    'AU': 'au'
  };
  
  const subdomain = subdomains[location.countryCode] || 'www';
  const url = `https://${subdomain}.example.com${req.path}`;
  
  res.redirect(url);
});
```

### 6. Timezone Detection

```javascript
async function getUserTimezone(ip) {
  const location = await GeoIP.lookup(ip);
  return location.timezone || 'UTC';
}

router.get('/events', async (req, res) => {
  const timezone = await getUserTimezone(req.ip);
  
  const events = await Event.all();
  
  // Convert event times to user's timezone
  const localizedEvents = events.map(event => ({
    ...event,
    startTime: moment(event.startTime)
      .tz(timezone)
      .format('YYYY-MM-DD HH:mm:ss')
  }));
  
  res.json(localizedEvents);
});
```

### 7. Rate Limiting by Country

```javascript
async function checkCountryRateLimit(ip, country) {
  const location = await GeoIP.lookup(ip);
  
  // Different limits for different countries
  const limits = {
    'IN': 1000,  // 1000 req/hour
    'US': 5000,
    default: 100
  };
  
  const limit = limits[location.countryCode] || limits.default;
  const key = `ratelimit:${location.countryCode}:${ip}`;
  
  const current = await Cache.get(key) || 0;
  
  if (current >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  await Cache.put(key, current + 1, 3600);
}
```

## Caching

Enable caching to reduce database lookups:

```javascript
// Automatic caching (if enabled in config)
const location = await GeoIP.lookup('8.8.8.8');

// Manual cache control
await GeoIP.forgetCache('8.8.8.8');
await GeoIP.flushCache();
```

**Cache Keys:**
```
geoip:8.8.8.8 -> { country: 'US', city: 'Mountain View', ... }
```

## Testing

```bash
# Run GeoIP tests
pnpm test tests/unit/GeoIP/
```

**Coverage:** 15/15 tests passing ✅

## Database Updates

### MaxMind

```bash
# Update GeoLite2 database (monthly)
cd storage/geoip
wget https://download.maxmind.com/app/geoip_download \
  ?edition_id=GeoLite2-City&suffix=tar.gz \
  -O GeoLite2-City.tar.gz
tar -xzf GeoLite2-City.tar.gz
mv GeoLite2-City_*/GeoLite2-City.mmdb .
```

### IP2Location

```bash
# Update IP2Location database
cd storage/geoip
wget https://www.ip2location.com/download/?token=YOUR_TOKEN \
  -O IP2LOCATION-LITE-DB11.BIN.ZIP
unzip IP2LOCATION-LITE-DB11.BIN.ZIP
```

## API Reference

### GeoIP Facade

```javascript
// Lookup IP
await GeoIP.lookup(ip)

// Get provider
GeoIP.provider(name = null)

// Cache control
await GeoIP.forgetCache(ip)
await GeoIP.flushCache()
```

### Location Object

```javascript
{
  country: 'United States',
  countryCode: 'US',
  region: 'California',
  city: 'Mountain View',
  postalCode: '94043',
  latitude: 37.386,
  longitude: -122.0838,
  timezone: 'America/Los_Angeles',
  
  // MaxMind only
  isp: 'Google LLC',
  organization: 'Google Public DNS',
  asn: 15169,
  
  // IP2Location only
  zipCode: '94043',
  domain: 'google.com'
}
```

## Environment Variables

```env
# Provider
GEOIP_PROVIDER=maxmind

# MaxMind
MAXMIND_DB_PATH=storage/geoip/GeoLite2-City.mmdb
MAXMIND_ACCOUNT_ID=
MAXMIND_LICENSE_KEY=

# IP2Location
IP2LOCATION_DB_PATH=storage/geoip/IP2LOCATION-LITE-DB11.BIN
IP2LOCATION_API_KEY=
```

## Accuracy

| Provider | City | Region | Country |
|----------|------|--------|---------|
| MaxMind | 95% | 97% | 99.8% |
| IP2Location | 92% | 95% | 99.5% |

**Note:** Accuracy depends on database version and IP type (datacenter IPs are less accurate).

## Performance

- **Database Lookup:** ~0.1ms (MaxMind), ~0.2ms (IP2Location)
- **API Lookup:** ~100-300ms (network dependent)
- **Cached Lookup:** ~1ms (Redis), ~0.5ms (Memory)

## See Also

- [Analytics](/docs/features/analytics.md)
- [Localization](/docs/services/translation.md)
- [Caching](/docs/services/cache.md)
