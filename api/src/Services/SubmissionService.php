<?php

namespace Api\Services;

use Api\Database;

class SubmissionService
{
    private $db;
    private $challengeService;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
        $this->challengeService = new ChallengeService();
    }

    public function submitFlag($userId, $challengeId, $flag)
    {
        $isCorrect = $this->challengeService->verifyFlag($challengeId, $flag);
        
        $stmt = $this->db->prepare(
            "INSERT INTO submissions (user_id, challenge_id, flag_submitted, is_correct) 
             VALUES (?, ?, ?, ?) 
             RETURNING id, user_id, challenge_id, is_correct, submitted_at"
        );
        $stmt->execute([$userId, $challengeId, $flag, $isCorrect ? 't' : 'f']);
        
        return $stmt->fetch();
    }

    public function getUserSubmissions($userId)
    {
        $stmt = $this->db->prepare(
            "SELECT s.*, c.title as challenge_title, c.points 
             FROM submissions s 
             JOIN challenges c ON s.challenge_id = c.id 
             WHERE s.user_id = ? 
             ORDER BY s.submitted_at DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function getUserSolvedChallenges($userId)
    {
        $stmt = $this->db->prepare(
            "SELECT DISTINCT challenge_id FROM submissions WHERE user_id = ? AND is_correct = true"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll(\PDO::FETCH_COLUMN);
    }

    public function getLeaderboard()
    {
        $stmt = $this->db->query(
            "SELECT u.id, u.name, u.email, 
                    COUNT(DISTINCT CASE WHEN s.is_correct THEN s.challenge_id END) as solved_count,
                    COALESCE(SUM(DISTINCT CASE WHEN s.is_correct THEN c.points END), 0) as total_points
             FROM users u
             LEFT JOIN submissions s ON u.id = s.user_id
             LEFT JOIN challenges c ON s.challenge_id = c.id
             WHERE u.role = 'player'
             GROUP BY u.id, u.name, u.email
             ORDER BY total_points DESC, solved_count DESC"
        );
        return $stmt->fetchAll();
    }
}
