# TeamLink

A full-stack application built with Next.js frontend and NestJS backend.

## Project Structure

```
TeamLink/
├── frontend/my-app/     # Next.js frontend application
├── backend/nest-app/    # NestJS backend application
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Frontend Setup

```bash
cd frontend/my-app
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend/nest-app
npm install
npm run start:dev
```

The backend will be available at `http://localhost:3000` (or configured port)

## Development

This is a monorepo containing both frontend and backend applications. Each application can be developed independently:

- **Frontend**: Located in `frontend/my-app/` - Built with Next.js
- **Backend**: Located in `backend/nest-app/` - Built with NestJS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 