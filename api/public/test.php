<?php
// Suppress errors for clean JSON output
error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json');

try {
    require_once __DIR__ . '/../src/Database.php';
    $db = Api\Database::getInstance()->getConnection();
    
    $stmt = $db->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    
    echo json_encode([
        'status' => 'success',
        'database' => 'connected',
        'users_count' => $result['count']
    ]);
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
