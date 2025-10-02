<?php

namespace Api;

class Database
{
    private static $instance = null;
    private $conn;

    private function __construct()
    {
        $databaseUrl = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
        
        if (!$databaseUrl) {
            throw new \Exception("DATABASE_URL environment variable not set");
        }
        
        $parsedUrl = parse_url($databaseUrl);
        
        if ($parsedUrl === false || !isset($parsedUrl['host'])) {
            throw new \Exception("Invalid DATABASE_URL format");
        }
        
        $host = $parsedUrl['host'];
        $port = $parsedUrl['port'] ?? 5432;
        $dbname = ltrim($parsedUrl['path'] ?? '', '/');
        $user = $parsedUrl['user'] ?? '';
        $password = $parsedUrl['pass'] ?? '';
        
        $dsn = sprintf(
            "pgsql:host=%s;port=%d;dbname=%s",
            $host,
            $port,
            $dbname
        );
        
        try {
            $this->conn = new \PDO($dsn, $user, $password);
            $this->conn->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
        } catch (\PDOException $e) {
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->conn;
    }
}
