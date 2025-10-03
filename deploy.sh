#!/bin/bash

# Deploy script for production - starts both PHP backend and Vite preview with proxy

# Start PHP backend on port 3000 in background
php -S 0.0.0.0:3000 -t api/public > /dev/null 2>&1 &
PHP_PID=$!

# Start Vite preview server on port 5000 (this will be the main process)
npm run preview -- --host 0.0.0.0 --port 5000 &
VITE_PID=$!

# Wait for Vite preview to start
sleep 1

# Keep both processes running
wait -n

# If either process exits, kill the other and exit
kill $PHP_PID $VITE_PID 2>/dev/null
exit $?
