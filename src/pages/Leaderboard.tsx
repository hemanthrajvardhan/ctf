import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user_id: number;
  name: string;
  email: string;
  total_score: number;
  solved_count: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-cipher-red" />;
      case 2:
        return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3:
        return <Award className="h-6 w-6 text-cipher-orange" />;
      default:
        return null;
    }
  };

  const getRowClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-primary/10 border-primary font-bold";
      case 2:
        return "bg-muted/30";
      case 3:
        return "bg-accent/10";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="border-border shadow-glow-moss">
          <CardHeader className="bg-card/50">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-6 py-4 text-left font-bold">Rank</th>
                    <th className="px-6 py-4 text-left font-bold">Name</th>
                    <th className="px-6 py-4 text-center font-bold">Solved</th>
                    <th className="px-6 py-4 text-right font-bold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        No participants yet. Be the first to solve a challenge!
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <tr
                          key={entry.user_id}
                          className={`border-b border-border transition-colors hover:bg-muted/10 ${getRowClass(rank)}`}
                          data-testid={`leaderboard-row-${rank}`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getRankIcon(rank)}
                              <span className="text-2xl font-bold" data-testid={`rank-${rank}`}>{rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold" data-testid={`name-${rank}`}>{entry.name}</div>
                              <div className="text-sm text-muted-foreground">{entry.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-semibold text-primary" data-testid={`solved-${rank}`}>
                              {entry.solved_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-2xl font-bold text-cipher-red" data-testid={`score-${rank}`}>
                              {entry.total_score}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
