#!/usr/bin/env php
<?php
// Initialize production database with schema if tables don't exist

// Check if users table exists using psql
$checkCmd = "psql \$DATABASE_URL -t -c \"SELECT to_regclass('public.users');\" 2>&1";
$result = trim(shell_exec($checkCmd));

if ($result === '' || $result === 'NULL' || strpos($result, 'NULL') !== false) {
    echo "Initializing production database...\n";
    
    // Execute schema.sql
    $initCmd = "psql \$DATABASE_URL -f api/schema.sql 2>&1";
    $output = shell_exec($initCmd);
    
    // Check if initialization was successful
    if (strpos($output, 'INSERT 0 1') !== false) {
        echo "Production database initialized successfully!\n";
    } else {
        echo "Note: Database may already be partially initialized\n";
        echo $output;
    }
} else {
    echo "Production database already initialized.\n";
}
