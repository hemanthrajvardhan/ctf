#!/bin/bash

# Deploy script for production - starts both PHP backend and serves frontend

# Start PHP backend on port 3000
echo "Starting PHP backend on port 3000..."
php -S 0.0.0.0:3000 -t api/public &
PHP_PID=$!

# Give PHP a moment to start
sleep 2

# Start Vite preview server (serves built frontend) on port 5000
echo "Starting frontend preview server on port 5000..."
npm run preview -- --host 0.0.0.0 --port 5000 &
VITE_PID=$!

echo "Both servers started successfully!"
echo "PHP Backend PID: $PHP_PID"
echo "Vite Preview PID: $VITE_PID"

# Keep script running
wait -n

# Exit with status of process that exited first
exit $?
