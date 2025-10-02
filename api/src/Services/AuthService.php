<?php

namespace Api\Services;

use Api\Database;

class AuthService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function login($email, $password)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return null;
        }

        unset($user['password_hash']);
        return $user;
    }

    public function createUser($email, $name, $password, $role = 'player')
    {
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        
        $stmt = $this->db->prepare(
            "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id, email, name, role, created_at"
        );
        $stmt->execute([$email, $name, $passwordHash, $role]);
        
        return $stmt->fetch();
    }

    public function getUserById($id)
    {
        $stmt = $this->db->prepare("SELECT id, email, name, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getAllUsers()
    {
        $stmt = $this->db->query("SELECT id, email, name, role, is_banned, created_at FROM users ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function banUser($id)
    {
        $stmt = $this->db->prepare("UPDATE users SET is_banned = true WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function unbanUser($id)
    {
        $stmt = $this->db->prepare("UPDATE users SET is_banned = false WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
