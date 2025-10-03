<?php
// Production router - serves both static files and API endpoints

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Handle API requests
if (strpos($requestPath, '/api/') === 0) {
    // Forward to the main API handler
    require_once __DIR__ . '/index.php';
    return;
}

// Serve static files from dist directory
$distPath = __DIR__ . '/../../dist';
$filePath = $distPath . $requestPath;

// Default to index.html for SPA routing
if (!file_exists($filePath) || is_dir($filePath)) {
    $filePath = $distPath . '/index.html';
}

// Serve the file with appropriate MIME type
if (file_exists($filePath)) {
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
    ];
    
    $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
    header('Content-Type: ' . $mimeType);
    readfile($filePath);
    return;
}

// If nothing matched, serve index.html
header('Content-Type: text/html');
readfile($distPath . '/index.html');
