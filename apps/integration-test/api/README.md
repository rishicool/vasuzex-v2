# Integration-test API

Integration-test application with authentication and framework integration.

## Structure

```
apps/integration-test/api/
├── src/
│   ├── controllers/        # Controllers (extend BaseController)
│   │   ├── BaseController.js
│   │   └── AuthController.js
│   ├── models/            # Data models
│   │   └── User.js
│   ├── services/          # Business logic
│   │   └── AuthService.js
│   ├── middleware/        # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/            # API routes
│   │   └── auth.routes.js
│   ├── requests/          # Request validators
│   │   └── AuthRequests.js
│   ├── app.js             # Express app setup
│   └── index.js           # Framework bootstrap
├── package.json
├── .env
└── README.md
```

## Centralized Config & Database

This app uses:
- **Config**: `/config/` from project root (NO app-level config)
- **Database**: `/database/` from project root (centralized models & migrations)

## Installation

Dependencies are installed from project root:

```bash
cd /path/to/project-root
pnpm install
```

## Development

From project root:

```bash
pnpm dev:integration-test-api
```

Or from app directory:

```bash
cd apps/integration-test/api
pnpm dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user (protected)
POST /api/auth/logout    - Logout (protected)
```

## Authentication Flow

1. **Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

3. **Access Protected Route:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

```env
APP_NAME=integration-test-api
APP_PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```
