<?php

namespace Api;

class Database
{
    private static $instance = null;
    private $conn;

    private function __construct()
    {
        $dsn = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
        
        try {
            $this->conn = new \PDO($dsn);
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
