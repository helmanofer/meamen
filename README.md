# Meamen - Fitness Trainer Web App

## Overview

Meamen is a cloud-based web application designed for fitness trainers to manage their clients' training programs, track progress, and facilitate communication between trainers and trainees.

## Features

- **Trainee Management**: Manage client profiles, track health metrics, and monitor progress
- **Exercise Library**: Comprehensive database of exercises with descriptions and demonstrations
- **Workout Planning**: Create and assign custom training programs to clients
- **Progress Tracking**: Monitor client progress with charts and metrics
- **Communication**: Built-in messaging system between trainers and clients
- **Analytics Dashboard**: Visualize performance data and business metrics

## Tech Stack

- **Frontend**: Vue 3, Tailwind CSS, Pinia, Vue Router
- **Backend**: FastAPI (planned)
- **Database**: MongoDB (planned)
- **Authentication**: JWT (planned)

## Project Structure

```
frontend/
├── src/
│   ├── assets/        # Static assets
│   ├── components/    # Reusable Vue components
│   ├── composables/   # Shared composition functions
│   ├── layouts/       # Page layout templates
│   ├── router/        # Vue Router configuration
│   ├── stores/        # Pinia stores for state management
│   ├── views/         # Page components
│   └── services/      # API service layer
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory: `cd Meamen/frontend`
3. Install dependencies: `npm install` or `yarn install`
4. Start the development server: `npm run serve` or `yarn serve`
5. Open your browser and visit `http://localhost:8080`

## Development Roadmap

See [UI_TODOS.md](./UI_TODOS.md) for the current development tasks and [UI_COMPLETED.md](./UI_COMPLETED.md) for completed items.

## Design

The application follows the design specified in [UI_DESIGN.md](./UI_DESIGN.md).

## License

MIT