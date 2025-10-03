#!/bin/bash

# Deploy script for production - starts both PHP backend and Vite preview with proxy

# Initialize production database
echo "Initializing production database..."
php init-production-db.php
echo ""

# Start PHP backend on port 3000
echo "Starting PHP backend on port 3000..."
php -S 0.0.0.0:3000 -t api/public &
PHP_PID=$!

# Give PHP a moment to start
sleep 2

# Start Vite preview server (serves built frontend with proxy) on port 5000
echo "Starting Vite preview server on port 5000..."
exec npm run preview -- --host 0.0.0.0 --port 5000
