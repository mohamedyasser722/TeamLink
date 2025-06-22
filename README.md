# TeamLink

TeamLink is a platform that matches professionals (freelancers/developers) with project leaders to build dynamic teams. Built with a modern full-stack architecture using Next.js, NestJS, MySQL, and Docker.

## 🏗️ Project Structure

```
TeamLink/
├── frontend/my-app/     # Next.js frontend application
├── backend/nest-app/    # NestJS backend API
├── mysql-init/          # Database initialization scripts
├── docker-compose.yml   # Docker services configuration
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Git** for version control
- **Node.js** (v20 or higher) for local development (optional)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd TeamLink
```

### 2. Environment Setup

Create environment file for the backend:

```bash
cd backend/nest-app
cp env.example .env
```

Update the `.env` file with your preferred values:

```env
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=teamlink_user
DB_PASSWORD=teamlink_password
DB_DATABASE=teamlink_db

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 3. Run with Docker (Recommended)

From the project root directory:

```bash
# Start all services (API + Database)
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

This will start:
- **Backend API**: `http://localhost:3000/api`
- **MySQL Database**: `localhost:3306`
- **Swagger Documentation**: `http://localhost:3000/api/docs`

### 4. Verify Installation

Check if the services are running:

```bash
# Check container status
docker-compose ps

# Test the health endpoint
curl http://localhost:3000/api/health

# Or visit in browser
open http://localhost:3000/api/health
```

## 📋 Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/docs` | GET | Swagger API documentation |

## 🛠️ Development Workflow

### Docker Development (Recommended)

The Docker setup includes **live reload** for development:

```bash
# Start development environment
docker-compose up

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after major changes
docker-compose up --build
```

### Local Development (Alternative)

If you prefer to run the backend locally:

```bash
# Ensure MySQL is running via Docker
docker-compose up mysql -d

# Install dependencies
cd backend/nest-app
npm install

# Start in development mode
npm run start:dev
```

### Database Management

```bash
# Access MySQL directly
docker-compose exec mysql mysql -u teamlink_user -p teamlink_db

# View database logs
docker-compose logs mysql

# Reset database (removes all data)
docker-compose down -v
docker-compose up --build
```

## 🏛️ Architecture Overview

### Backend Features

- **NestJS Framework** with TypeScript
- **MySQL Database** with TypeORM
- **Docker Containerization** for development and production
- **Swagger Documentation** for API endpoints
- **Global Exception Handling** with standardized responses
- **Request Logging** and middleware
- **Configuration Management** with environment variables
- **Input Validation** with class-validator

### Database Schema

- **Users**: User profiles with Keycloak integration
- **Skills**: Skill definitions and categories
- **User Skills**: Junction table with skill levels
- **Projects**: Project listings and management
- **Applications**: Project applications and status
- **Teams**: Team formation and roles

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000
# Kill the process or change the port in docker-compose.yml
```

**Database Connection Issues**
```bash
# Check MySQL container health
docker-compose ps
# Restart MySQL service
docker-compose restart mysql
```

**Container Build Issues**
```bash
# Clean rebuild
docker-compose down --rmi all
docker-compose up --build
```

### Development Tips

- **Live Reload**: Code changes are automatically reflected without rebuilding
- **Debug Mode**: The Node.js debugger is available on port `9229`
- **Logs**: Use `docker-compose logs -f api` to follow API logs in real-time
- **Database**: Tables are automatically created/updated via TypeORM synchronization

## 📱 Frontend Development

The frontend is located in `frontend/my-app/` and uses Next.js:

```bash
cd frontend/my-app
npm install
npm run dev
```

Frontend will be available at `http://localhost:3001` (configured to avoid conflict with API)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 