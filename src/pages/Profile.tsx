import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, CheckCircle2, Target } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  total_score: number;
  solved_count: number;
  rank: number;
  recent_solves: Array<{
    challenge_title: string;
    points: number;
    solved_at: string;
  }>;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/session', {
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.user) {
        navigate('/auth');
        return;
      }

      loadProfile(data.user.id);
    } catch (error) {
      navigate('/auth');
    }
  };

  const loadProfile = async (userId: number) => {
    try {
      // Get user info
      const userResponse = await fetch('/api/session', {
        credentials: 'include',
      });
      const userData = await userResponse.json();

      // Get user submissions
      const submissionsResponse = await fetch(`/api/users/${userId}/submissions`, {
        credentials: 'include',
      });
      const submissionsData = await submissionsResponse.json();

      // Get all challenges to calculate points
      const challengesResponse = await fetch('/api/challenges', {
        credentials: 'include',
      });
      const challengesData = await challengesResponse.json();

      // Get leaderboard to calculate rank
      const leaderboardResponse = await fetch('/api/leaderboard', {
        credentials: 'include',
      });
      const leaderboardData = await leaderboardResponse.json();

      // Calculate stats
      const correctSubmissions = submissionsData.filter((s: any) => s.is_correct);
      const uniqueSolves: any[] = Array.from(
        new Map(correctSubmissions.map((s: any) => [s.challenge_id, s])).values()
      );

      const totalScore: number = uniqueSolves.reduce((sum: number, sub: any) => {
        const challenge = challengesData.find((c: any) => c.id === sub.challenge_id);
        return sum + (challenge?.points || 0);
      }, 0);

      const rank = leaderboardData.findIndex((entry: any) => entry.user_id === userId) + 1;

      // Get recent solves with challenge titles
      const recentSolves = uniqueSolves
        .sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
        .slice(0, 5)
        .map((sub: any) => {
          const challenge = challengesData.find((c: any) => c.id === sub.challenge_id);
          return {
            challenge_title: challenge?.title || 'Unknown Challenge',
            points: challenge?.points || 0,
            solved_at: sub.submitted_at,
          };
        });

      setProfile({
        name: userData.user.name,
        email: userData.user.email,
        total_score: totalScore,
        solved_count: uniqueSolves.length,
        rank: rank || 0,
        recent_solves: recentSolves,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Unable to load profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-4xl font-bold mb-8">Your Profile</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-primary shadow-glow-moss">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Total Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary" data-testid="profile-score">
                {profile.total_score}
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent shadow-glow-cipher">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Challenges Solved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent" data-testid="profile-solved">
                {profile.solved_count}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Global Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground" data-testid="profile-rank">
                {profile.rank > 0 ? `#${profile.rank}` : 'Unranked'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Solves</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.recent_solves.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No challenges solved yet. Start solving to see your progress here!
              </p>
            ) : (
              <div className="space-y-3">
                {profile.recent_solves.map((solve, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border"
                    data-testid={`recent-solve-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-semibold">{solve.challenge_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(solve.solved_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-cipher-red">+{solve.points}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
