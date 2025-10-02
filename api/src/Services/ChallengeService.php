<?php

namespace Api\Services;

use Api\Database;

class ChallengeService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getAllChallenges()
    {
        $stmt = $this->db->query("SELECT id, title, slug, description, category, points, created_at FROM challenges ORDER BY points ASC");
        return $stmt->fetchAll();
    }

    public function getChallengeBySlug($slug)
    {
        $stmt = $this->db->prepare("SELECT id, title, slug, description, category, points, created_at FROM challenges WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch();
    }

    public function createChallenge($title, $slug, $description, $category, $points, $flag)
    {
        $flagHash = password_hash($flag, PASSWORD_BCRYPT);
        
        $stmt = $this->db->prepare(
            "INSERT INTO challenges (title, slug, description, category, points, flag_hash) 
             VALUES (?, ?, ?, ?, ?, ?) 
             RETURNING id, title, slug, description, category, points, created_at"
        );
        $stmt->execute([$title, $slug, $description, $category, $points, $flagHash]);
        
        return $stmt->fetch();
    }

    public function updateChallenge($id, $title, $slug, $description, $category, $points, $flag = null)
    {
        if ($flag) {
            $flagHash = password_hash($flag, PASSWORD_BCRYPT);
            $stmt = $this->db->prepare(
                "UPDATE challenges SET title = ?, slug = ?, description = ?, category = ?, points = ?, flag_hash = ? WHERE id = ?"
            );
            $stmt->execute([$title, $slug, $description, $category, $points, $flagHash, $id]);
        } else {
            $stmt = $this->db->prepare(
                "UPDATE challenges SET title = ?, slug = ?, description = ?, category = ?, points = ? WHERE id = ?"
            );
            $stmt->execute([$title, $slug, $description, $category, $points, $id]);
        }
        
        return $this->getChallengeBySlug($slug);
    }

    public function deleteChallenge($id)
    {
        $stmt = $this->db->prepare("DELETE FROM challenges WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function verifyFlag($challengeId, $flag)
    {
        $stmt = $this->db->prepare("SELECT flag_hash FROM challenges WHERE id = ?");
        $stmt->execute([$challengeId]);
        $challenge = $stmt->fetch();
        
        if (!$challenge) {
            return false;
        }
        
        return password_verify($flag, $challenge['flag_hash']);
    }
}
