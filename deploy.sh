#!/bin/bash

# Deploy script for production - PHP serves both frontend and API on port 5000

# Initialize production database
echo "Initializing production database..."
php init-production-db.php
echo ""

# Start PHP server on port 5000 serving both frontend and API
echo "Starting PHP server on port 5000 (serving frontend + API)..."
php -S 0.0.0.0:5000 -t api/public api/public/router.php

# Exit with PHP server status
exit $?
