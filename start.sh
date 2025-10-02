#!/bin/bash

# Start PHP backend on port 3000
php -S localhost:3000 -t api/public &
PHP_PID=$!

# Start React frontend on port 5000
npm run dev &
REACT_PID=$!

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
