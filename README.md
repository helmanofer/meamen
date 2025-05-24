# Meamen - Fitness Trainer Web App

## Overview

Meamen is a full-stack web application designed for fitness trainers to manage their clients' training programs, track progress, and facilitate communication between trainers and trainees.

## Features

- **Trainee Management**: Manage client profiles, track health metrics, and monitor progress
- **Exercise Library**: Comprehensive database of exercises with descriptions and demonstrations
- **Workout Planning**: Create and assign custom training programs to clients
- **Progress Tracking**: Monitor client progress with charts and metrics
- **Communication**: Built-in messaging system between trainers and clients
- **Analytics Dashboard**: Visualize performance data and business metrics

## Tech Stack

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **Tailwind CSS**: Utility-first CSS framework
- **Pinia**: State management library
- **Vue Router**: Client-side routing
- **Chart.js**: Data visualization
- **Axios**: HTTP client
- **Heroicons**: Icon library

### Backend
- **FastAPI**: Modern Python web framework
- **SQLModel**: SQL database toolkit with type hints
- **SQLite**: Database (with aiosqlite for async operations)
- **Pydantic**: Data validation
- **Uvicorn**: ASGI server

## Project Structure

```
Meamen/
├── frontend/              # Vue.js frontend application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # Reusable Vue components
│   │   ├── composables/   # Shared composition functions
│   │   ├── layouts/       # Page layout templates
│   │   ├── router/        # Vue Router configuration
│   │   ├── stores/        # Pinia stores for state management
│   │   ├── views/         # Page components
│   │   └── services/      # API service layer
│   └── package.json
├── meamen/                # FastAPI backend application
│   ├── api/               # API route handlers
│   ├── core/              # Core configuration
│   ├── crud/              # Database operations
│   ├── db/                # Database setup and session management
│   ├── models/            # SQLModel database models
│   ├── schemas/           # Pydantic schemas
│   └── middleware/        # Custom middleware
├── tests/                 # Backend test suite
└── pyproject.toml         # Python project configuration
```

## Getting Started

### Prerequisites

- **Python 3.12+**
- **Node.js 14+**
- **npm or yarn**

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Meamen
   ```

2. Install Python dependencies:
   ```bash
   uv sync
   ```

3. Start the backend server:
   ```bash
   uvicorn meamen.main:app --reload
   ```

4. The API will be available at `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

4. Open your browser and visit `http://localhost:8080`

## Development Workflow

### Running Tests

Backend tests use pytest:
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_exercises.py
```

### Code Quality

Frontend linting:
```bash
cd frontend
npm run lint
```

### Building for Production

Frontend build:
```bash
cd frontend
npm run build
```

### API Endpoints

The backend provides the following main API routes:
- `/auth` - Authentication endpoints
- `/trainees` - Trainee management
- `/trainers` - Trainer management  
- `/exercises` - Exercise library
- `/training-sessions` - Training session management

## Development Roadmap

See [UI_TODOS.md](./UI_TODOS.md) for the current development tasks and [UI_COMPLETED.md](./UI_COMPLETED.md) for completed items.

## Design

The application follows the design specified in [UI_DESIGN.md](./UI_DESIGN.md).

## License

MIT