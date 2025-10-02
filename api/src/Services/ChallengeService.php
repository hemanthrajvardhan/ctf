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

    public function getAllChallenges($includeHidden = false)
    {
        $query = "SELECT id, title, slug, description, category, points, is_visible, round, image_url, external_link, created_at FROM challenges";
        if (!$includeHidden) {
            $query .= " WHERE is_visible = true";
        }
        $query .= " ORDER BY points ASC";
        
        $stmt = $this->db->query($query);
        return $stmt->fetchAll();
    }

    public function getChallengeBySlug($slug)
    {
        $stmt = $this->db->prepare("SELECT id, title, slug, description, category, points, is_visible, round, image_url, external_link, created_at FROM challenges WHERE slug = ?");
        $stmt->execute([$slug]);
        return $stmt->fetch();
    }

    public function createChallenge($title, $slug, $description, $category, $points, $flag, $round = null, $imageUrl = null, $externalLink = null, $isVisible = true)
    {
        $flagHash = password_hash($flag, PASSWORD_BCRYPT);
        
        $stmt = $this->db->prepare(
            "INSERT INTO challenges (title, slug, description, category, points, flag_hash, round, image_url, external_link, is_visible) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
             RETURNING id, title, slug, description, category, points, round, image_url, external_link, is_visible, created_at"
        );
        $stmt->execute([$title, $slug, $description, $category, $points, $flagHash, $round, $imageUrl, $externalLink, $isVisible ? 't' : 'f']);
        
        return $stmt->fetch();
    }

    public function updateChallenge($id, $title, $slug, $description, $category, $points, $flag = null, $round = null, $imageUrl = null, $externalLink = null, $isVisible = true)
    {
        if ($flag) {
            $flagHash = password_hash($flag, PASSWORD_BCRYPT);
            $stmt = $this->db->prepare(
                "UPDATE challenges SET title = ?, slug = ?, description = ?, category = ?, points = ?, flag_hash = ?, round = ?, image_url = ?, external_link = ?, is_visible = ? WHERE id = ?"
            );
            $stmt->execute([$title, $slug, $description, $category, $points, $flagHash, $round, $imageUrl, $externalLink, $isVisible ? 't' : 'f', $id]);
        } else {
            $stmt = $this->db->prepare(
                "UPDATE challenges SET title = ?, slug = ?, description = ?, category = ?, points = ?, round = ?, image_url = ?, external_link = ?, is_visible = ? WHERE id = ?"
            );
            $stmt->execute([$title, $slug, $description, $category, $points, $round, $imageUrl, $externalLink, $isVisible ? 't' : 'f', $id]);
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
