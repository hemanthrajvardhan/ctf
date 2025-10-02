import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  points: number;
  category: string;
  slug: string;
}

interface Solve {
  challenge_id: string;
}

interface UserStats {
  totalScore: number;
  solvedCount: number;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ totalScore: 0, solvedCount: 0 });
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      loadData(session.user.id);
    });
  }, [navigate]);

  const loadData = async (userId: string) => {
    // Load challenges
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('id, title, points, category, slug')
      .order('category')
      .order('points');

    if (challengesError) {
      toast({
        title: "Error loading challenges",
        description: challengesError.message,
        variant: "destructive",
      });
      return;
    }

    setChallenges(challengesData || []);

    // Load user solves
    const { data: solvesData } = await supabase
      .from('solves')
      .select('challenge_id, points_awarded')
      .eq('user_id', userId);

    setSolves(solvesData || []);

    // Calculate user stats
    const totalScore = solvesData?.reduce((sum, solve) => sum + solve.points_awarded, 0) || 0;
    setUserStats({
      totalScore,
      solvedCount: solvesData?.length || 0,
    });
  };

  const isSolved = (challengeId: string) => {
    return solves.some(solve => solve.challenge_id === challengeId);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      cryptography: "bg-primary/20 text-primary border-primary/30",
      cyber_security: "bg-accent/20 text-accent border-accent/30",
      programming: "bg-cipher-orange/20 text-cipher-orange border-cipher-orange/30",
      quiz: "bg-muted text-muted-foreground border-muted-foreground/30",
    };
    return colors[category] || colors.quiz;
  };

  const groupedChallenges = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {} as { [key: string]: Challenge[] });

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
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{userStats.totalScore}</div>
                <div className="text-xs text-muted-foreground uppercase">Score</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">{userStats.solvedCount}</div>
                <div className="text-xs text-muted-foreground uppercase">Solved</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="container mx-auto px-4 py-8">
        {Object.entries(groupedChallenges).map(([category, categoryChalls]) => (
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
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        {solved ? (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge className={getCategoryColor(challenge.category)} variant="outline">
                          {challenge.category.replace('_', ' ')}
                        </Badge>
                        <span className="text-2xl font-bold text-cipher-red">
                          {challenge.points}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges;