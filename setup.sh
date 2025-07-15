#!/bin/bash

# Task Manager Setup Script

echo "Setting up the Task Manager System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Docker and Docker Compose are installed."

# Create .env file for backend if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cp backend/env.example backend/.env
fi

# Start the application
echo "Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Run Laravel setup commands
echo "Setting up Laravel application..."
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan db:seed --force

echo "Setup complete!"
echo ""
echo "Access your application:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost:8000"
echo "  MailHog (for email testing): http://localhost:8025"
echo ""
echo "Demo Credentials:"
echo "  Admin: admin@taskmanager.com / password"
echo "  User: john@taskmanager.com / password"
echo ""
echo "Check MailHog at http://localhost:8025 to see email notifications."
echo ""
echo "To stop the application: docker-compose down"
echo "To restart: docker-compose restart" 