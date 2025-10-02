<?php

namespace Api\Services;

use Api\Database;

class CategoryService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllCategories()
    {
        $stmt = $this->db->query("SELECT * FROM categories ORDER BY type, name");
        return $stmt->fetchAll();
    }

    public function getCategoriesByType($type)
    {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE type = ? ORDER BY name");
        $stmt->execute([$type]);
        return $stmt->fetchAll();
    }

    public function createCategory($name, $type = 'category', $color = null)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO categories (name, type, color) VALUES (?, ?, ?) RETURNING *"
        );
        $stmt->execute([$name, $type, $color]);
        return $stmt->fetch();
    }

    public function deleteCategory($id)
    {
        $stmt = $this->db->prepare("DELETE FROM categories WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
