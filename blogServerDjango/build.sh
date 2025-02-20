#!/bin/bash

# Navigate to the React app inside Django static files
cd static/Ui

# Install dependencies and build React
echo "Installing React dependencies..."
npm install

echo "Building React app..."
npm run build

# Navigate back to the project root
cd ../..

# Run Django collectstatic to gather static files

