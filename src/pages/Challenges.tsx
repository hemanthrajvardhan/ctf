import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: number;
  title: string;
  points: number;
  category: string;
  slug: string;
  round: string | null;
}

interface UserStats {
  totalScore: number;
  solvedCount: number;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<number>>(new Set());
  const [userStats, setUserStats] = useState<UserStats>({ totalScore: 0, solvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

      loadData(data.user.id);
    } catch (error) {
      navigate('/auth');
    }
  };

  const loadData = async (userId: number) => {
    try {
      // Load challenges
      const challengesResponse = await fetch('/api/challenges', {
        credentials: 'include',
      });
      const challengesData = await challengesResponse.json();
      setChallenges(challengesData || []);

      // Load user submissions to determine solved challenges
      const submissionsResponse = await fetch(`/api/users/${userId}/submissions`, {
        credentials: 'include',
      });
      
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        const correctSubmissions = submissionsData.filter((s: any) => s.is_correct);
        const solvedIds = new Set<number>(correctSubmissions.map((s: any) => s.challenge_id));
        setSolvedChallenges(solvedIds);

        // Calculate stats
        const totalScore = correctSubmissions.reduce((sum: number, sub: any) => {
          const challenge = challengesData.find((c: any) => c.id === sub.challenge_id);
          return sum + (challenge?.points || 0);
        }, 0);

        setUserStats({
          totalScore,
          solvedCount: solvedIds.size,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading challenges",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSolved = (challengeId: number) => {
    return solvedChallenges.has(challengeId);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      cryptography: "bg-primary/20 text-primary border-primary/30",
      cyber_security: "bg-accent/20 text-accent border-accent/30",
      programming: "bg-cipher-orange/20 text-cipher-orange border-cipher-orange/30",
      git: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      forensics: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      web: "bg-green-500/20 text-green-400 border-green-500/30",
      reverse_engineering: "bg-red-500/20 text-red-400 border-red-500/30",
      misc: "bg-muted text-muted-foreground border-muted-foreground/30",
    };
    return colors[category] || colors.misc;
  };

  const groupedChallenges = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {} as { [key: string]: Challenge[] });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      {/* User Stats Bar */}
      <div className="bg-card/50 border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Challenges</h2>
              <p className="text-sm text-muted-foreground">Choose a challenge to begin</p>
            </div>
            <div className="flex gap-6 items-center">
              <div className="text-center" data-testid="user-score">
                <div className="text-3xl font-bold text-primary">{userStats.totalScore}</div>
                <div className="text-xs text-muted-foreground uppercase">Score</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center" data-testid="user-solved">
                <div className="text-3xl font-bold text-accent">{userStats.solvedCount}</div>
                <div className="text-xs text-muted-foreground uppercase">Solved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedChallenges).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No challenges available yet.</p>
          </div>
        ) : (
          Object.entries(groupedChallenges).map(([category, categoryChalls]) => (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-bold mb-6 capitalize flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                {category.replace('_', ' ')}
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryChalls.map((challenge) => {
                  const solved = isSolved(challenge.id);
                  
                  return (
                    <Card
                      key={challenge.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        solved 
                          ? 'border-primary shadow-glow-moss' 
                          : 'border-border hover:border-accent hover:shadow-glow-cipher'
                      }`}
                      onClick={() => navigate(`/challenge/${challenge.slug}`)}
                      data-testid={`challenge-card-${challenge.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          {solved ? (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" data-testid={`solved-${challenge.id}`} />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        {challenge.round && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {challenge.round.replace('round1', 'Round 1').replace('round2', 'Round 2')}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(challenge.category)} variant="outline">
                            {challenge.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-2xl font-bold text-cipher-red" data-testid={`points-${challenge.id}`}>
                            {challenge.points}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Challenges;
