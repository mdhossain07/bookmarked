# 📚 Bookmarked

A comprehensive personal media tracking web application for managing your books and movies.

## 🏗️ Project Structure

This is a TypeScript monorepo using Yarn workspaces with the following structure:

```
bookmarked/
├── packages/
│   └── bookmarked-types/     # Shared TypeScript types and Zod schemas
├── backend/                  # Express.js API server
├── frontend/                 # React SPA
├── package.json             # Root workspace configuration
├── tsconfig.json            # Root TypeScript configuration
└── .env.example             # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- MongoDB (local or cloud instance)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd bookmarked
   yarn install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB:**

   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas cloud connection
   # Update MONGODB_URI in .env file
   ```

4. **Start the development servers:**

   ```bash
   # Start all services (recommended)
   yarn dev

   # Or start individually:
   yarn workspace backend dev          # Backend API (port 3001)
   yarn workspace frontend dev         # Frontend React app (port 5173)
   ```

## 📦 Workspaces

### `packages/bookmarked-types`

Shared TypeScript types and Zod validation schemas used by both frontend and backend.

**Key exports:**

- Database types (User, Media, Genre)
- API request/response types
- Zod validation schemas
- Common utilities

### `backend`

Express.js API server with TypeScript, MongoDB, and JWT authentication.

**Features:**

- RESTful API endpoints
- JWT-based authentication
- Zod request validation
- MongoDB with Mongoose ODM
- Comprehensive error handling
- Rate limiting and security middleware

**Available endpoints:**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /health` - Health check

### `frontend`

React SPA with TypeScript, Vite, and TailwindCSS.

**Features:**

- Modern React with hooks
- TypeScript for type safety
- Vite for fast development
- TailwindCSS for styling
- Shared types integration

## 🛠️ Development Scripts

### Root Level

```bash
yarn install          # Install all dependencies
yarn build            # Build all packages
yarn type-check       # Type check all packages
yarn dev              # Start all development servers
```

### Individual Workspaces

```bash
# Shared types package
yarn workspace bookmarked-types build
yarn workspace bookmarked-types dev

# Backend
yarn workspace backend dev
yarn workspace backend build
yarn workspace backend type-check

# Frontend
yarn workspace frontend dev
yarn workspace frontend build
yarn workspace frontend type-check
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/bookmarked

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### TypeScript Configuration

The project uses TypeScript project references for efficient compilation:

- Root `tsconfig.json` contains shared configuration
- Each workspace extends the root configuration
- Shared types package is referenced by both frontend and backend

## 🧪 Testing

```bash
# Type checking
yarn type-check

# Build verification
yarn build

# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/api/auth/register -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

## 🏁 Phase 1 Completion Status

✅ **Completed:**

- [x] Monorepo structure with Yarn workspaces
- [x] Shared TypeScript types package
- [x] Backend Express.js server with authentication
- [x] Frontend React application placeholder
- [x] MongoDB integration with Mongoose
- [x] JWT authentication system
- [x] Zod validation throughout
- [x] Comprehensive error handling
- [x] Development environment setup

🎯 **Next Steps (Phase 2):**

- [ ] Complete frontend authentication UI
- [ ] Media management endpoints
- [ ] User dashboard and media library
- [ ] Search and filtering functionality
- [ ] External API integrations (Goodreads, TMDB)

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Zod for all validation
3. Maintain consistent error handling
4. Update shared types when adding new features
5. Test all endpoints before committing

## 📄 License

MIT License - see LICENSE file for details.
