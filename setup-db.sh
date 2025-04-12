#!/bin/bash

# Script to initialize the AgroBuizz database

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "Error: .env file not found."
  echo "Please create a .env file with your database configuration."
  echo "See .env.example for the required format."
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set in your .env file."
  echo "Please set DATABASE_URL in your .env file."
  exit 1
fi

echo "Setting up AgroBuizz database..."

# Run database migrations
echo "Running database migrations..."
npm run db:push

if [ $? -ne 0 ]; then
  echo "Error: Failed to run database migrations."
  echo "Please check your database connection and try again."
  exit 1
fi

echo "Database setup complete!"
echo "You can now start the application with: npm run dev"