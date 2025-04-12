#!/bin/bash

echo "🔧 Setting up AgroBuizz database..."

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js and try again."
  exit 1
fi

# Run the database setup script
node scripts/db-setup.js

# Check if the script executed successfully
if [ $? -ne 0 ]; then
  echo "❌ Database setup failed. Please check the error messages above."
  exit 1
fi

echo "✅ Database setup completed successfully!"