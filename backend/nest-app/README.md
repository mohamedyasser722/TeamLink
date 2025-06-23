# TeamLink Backend

A NestJS-based backend application for the TeamLink platform, providing APIs for team collaboration, project management, and user authentication with Keycloak integration.

## Features

- **User Management**: Complete user profile system with skills and roles
- **Project Management**: Create and manage collaborative projects
- **Team Formation**: Apply to projects and form teams
- **Authentication**: Keycloak integration for secure authentication and authorization
- **Database**: MySQL with TypeORM for data persistence
- **API Documentation**: Swagger/OpenAPI documentation
- **Database Seeding**: Automated database population with sample data

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MySQL with TypeORM
- **Authentication**: Keycloak
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Keycloak server (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TeamLink/backend/nest-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=teamlink_user
   DB_PASSWORD=teamlink_password
   DB_DATABASE=teamlink_db
   DB_ROOT_PASSWORD=root_password

   # Application
   NODE_ENV=development
   PORT=3000

   # Keycloak Configuration
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=teamlink
   KEYCLOAK_CLIENT_ID=teamlink-backend
   KEYCLOAK_CLIENT_SECRET=your-client-secret-here
   ```

4. **Run with Docker (Recommended)**
   ```bash
   # From the root directory (TeamLink/)
   docker-compose up -d
   ```

   This will start:
   - MySQL database on port 3306
   - NestJS API on port 3000

5. **Or run locally**
   ```bash
   # Make sure MySQL is running locally
   npm run start:dev
   ```

## API Documentation

Once the application is running, you can access:

- **API Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/

## Database Management

### Seeding the Database

The application includes a comprehensive seeding system:

```bash
# Seed the database with sample data
curl -X POST http://localhost:3000/api/seeder/seed

# Check database statistics
curl http://localhost:3000/api/seeder/stats
```

The seeder creates:
- 20+ users with varied roles
- 15+ skills across different categories
- 10+ sample projects
- 50+ applications and team memberships
- Realistic relationships between all entities

## Keycloak Authentication

### Setup

1. **Configure Keycloak** (if using external Keycloak server):
   - Create a realm named `teamlink`
   - Create a client `teamlink-backend`
   - Configure client credentials and roles

2. **Authentication Endpoints**:
   ```bash
   # Public endpoint (no auth required)
   GET /auth/public

   # Protected endpoint (requires valid token)
   GET /auth/protected
   Authorization: Bearer <your-keycloak-token>

   # Admin endpoint (requires 'admin' role)
   GET /auth/admin
   Authorization: Bearer <your-keycloak-token>

   # User profile
   GET /auth/profile
   Authorization: Bearer <your-keycloak-token>

   # Check user roles
   GET /auth/roles
   Authorization: Bearer <your-keycloak-token>
   ```

### Using Authentication in Your Controllers

```typescript
import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Auth, RequireRoles } from './keyclock/decorators/auth.decorator';

@Controller('example')
export class ExampleController {
  
  @Get('protected')
  @Auth() // Requires authentication
  getProtectedData(@AuthenticatedUser() user: any) {
    return { message: 'Protected data', user };
  }

  @Get('admin-only')
  @RequireRoles('admin') // Requires 'admin' role
  getAdminData(@AuthenticatedUser() user: any) {
    return { message: 'Admin only data' };
  }
}
```

## Project Structure

```
src/
├── common/          # Shared modules, pipes, filters, middleware
├── config/          # Configuration files
├── entities/        # TypeORM entities and enums
├── keyclock/        # Keycloak authentication module
├── seeder/          # Database seeding functionality
├── app.module.ts    # Main application module
└── main.ts          # Application entry point
```

## Database Schema

### Core Entities

- **Users**: User profiles with Keycloak integration
- **Skills**: Skill catalog with proficiency levels
- **Projects**: Collaborative projects with status tracking
- **Applications**: User applications to join projects
- **Teams**: Formed teams with role assignments
- **UserSkills**: Many-to-many relationship with skill levels

### Key Features

- UUID primary keys for all entities
- Automatic timestamp management
- Comprehensive relationships with proper cascading
- Enum-based status management

## Development

### Available Scripts

```bash
# Development
npm run start:dev      # Start in watch mode
npm run start:debug    # Start in debug mode

# Building
npm run build          # Build for production
npm run start:prod     # Start production build

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run test:cov       # Run tests with coverage

# Linting
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Docker Development

```bash
# Build and start services
docker-compose up --build

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USERNAME` | Database username | `teamlink_user` |
| `DB_PASSWORD` | Database password | `teamlink_password` |
| `DB_DATABASE` | Database name | `teamlink_db` |
| `KEYCLOAK_URL` | Keycloak server URL | `http://localhost:8080` |
| `KEYCLOAK_REALM` | Keycloak realm | `teamlink` |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID | `teamlink-backend` |
| `KEYCLOAK_CLIENT_SECRET` | Keycloak client secret | - |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
