import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      loadProfile(session.user.id);
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    // Get user profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (!profileData) return;

    // Get user solves
    const { data: solvesData } = await supabase
      .from('solves')
      .select(`
        points_awarded,
        solved_at,
        challenges (
          title
        )
      `)
      .eq('user_id', userId)
      .order('solved_at', { ascending: false })
      .limit(5);

    const totalScore = solvesData?.reduce((sum, solve) => sum + solve.points_awarded, 0) || 0;

    // Get user rank
    const { data: allScores } = await supabase
      .from('profiles')
      .select(`
        id,
        solves (
          points_awarded
        )
      `);

    const scores = (allScores || [])
      .map((p: any) => ({
        id: p.id,
        score: p.solves.reduce((sum: number, s: any) => sum + s.points_awarded, 0),
      }))
      .sort((a, b) => b.score - a.score);

    const rank = scores.findIndex(s => s.id === userId) + 1;

    setProfile({
      name: profileData.name,
      email: profileData.email,
      total_score: totalScore,
      solved_count: solvesData?.length || 0,
      rank: rank,
      recent_solves: (solvesData || []).map((solve: any) => ({
        challenge_title: solve.challenges.title,
        points: solve.points_awarded,
        solved_at: solve.solved_at,
      })),
    });
  };

  if (!profile) {
    return <div className="min-h-screen bg-gradient-dark"><Navbar /></div>;
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
              <div className="text-4xl font-bold text-primary">{profile.total_score}</div>
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
              <div className="text-4xl font-bold text-accent">{profile.solved_count}</div>
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
              <div className="text-4xl font-bold text-foreground">#{profile.rank}</div>
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