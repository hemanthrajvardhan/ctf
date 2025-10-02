<?php

namespace Api\Services;

use Api\Database;

class HintService
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getHintsForChallenge($challengeId)
    {
        $stmt = $this->db->prepare(
            "SELECT id, content, cost, unlock_time, position FROM hints 
             WHERE challenge_id = ? 
             ORDER BY position ASC"
        );
        $stmt->execute([$challengeId]);
        return $stmt->fetchAll();
    }

    public function createHint($challengeId, $content, $cost = 0, $unlockTime = 0, $position = 0)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO hints (challenge_id, content, cost, unlock_time, position) 
             VALUES (?, ?, ?, ?, ?) 
             RETURNING id, challenge_id, content, cost, unlock_time, position"
        );
        $stmt->execute([$challengeId, $content, $cost, $unlockTime, $position]);
        return $stmt->fetch();
    }

    public function updateHint($id, $content, $cost, $unlockTime, $position)
    {
        $stmt = $this->db->prepare(
            "UPDATE hints SET content = ?, cost = ?, unlock_time = ?, position = ? WHERE id = ?"
        );
        return $stmt->execute([$content, $cost, $unlockTime, $position, $id]);
    }

    public function deleteHint($id)
    {
        $stmt = $this->db->prepare("DELETE FROM hints WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function deleteHintsForChallenge($challengeId)
    {
        $stmt = $this->db->prepare("DELETE FROM hints WHERE challenge_id = ?");
        return $stmt->execute([$challengeId]);
    }
}
