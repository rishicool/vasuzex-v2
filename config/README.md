# Configuration Files

Environment-specific configuration files for the Neastore monorepo.

## Structure

```
config/
├── base.cjs           # Common settings inherited by all environments
├── local.cjs          # Local development (laptop)
├── production.cjs     # Production deployment
├── index.cjs          # Entry point - loads config based on NODE_ENV
└── README.md          # This file
```

## How It Works

1. **Environment Detection**: Uses `NODE_ENV` environment variable
2. **Config Loading**: Loads corresponding `.cjs` file (e.g., `local.cjs` for `NODE_ENV=local`)
3. **Inheritance**: All configs extend `base.cjs` for common settings
4. **Environment Variables**: Values can be overridden via `.env` file

## Usage in Apps

```javascript
// apps/blog-api/src/config/loader.js
import { config } from './loader.js';

export function getConfig() {
  return {
    port: config.BLOG_API_PORT,
    nodeEnv: config.NODE_ENV,
    postgresql: {
      host: config.POSTGRES_HOST,
      // ...
    },
  };
}
```

## Adding New Environment

1. Create `config/{environment}.cjs`
2. Extend `base.cjs`
3. Override environment-specific values
4. Set `NODE_ENV={environment}` when running

## Best Practices

- ✅ Use `.env` file for sensitive values (passwords, secrets)
- ✅ Keep common settings in `base.cjs`
- ✅ Override only environment-specific values
- ❌ Never commit `.env` file to git
- ❌ Never hardcode secrets in config files
