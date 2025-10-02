import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, ChevronLeft, CheckCircle2, AlertCircle, ExternalLink, ImageIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  category: string;
  slug: string;
  round: string | null;
  image_url: string | null;
  external_link: string | null;
}

interface Hint {
  id: number;
  content: string;
  cost: number;
  unlock_time: number;
  position: number;
}

const ChallengeDetail = () => {
  const { slug } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [solved, setSolved] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, [slug, navigate]);

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

      setUserId(data.user.id);
      loadChallenge(data.user.id);
    } catch (error) {
      navigate('/auth');
    }
  };

  const loadChallenge = async (uid: number) => {
    try {
      const response = await fetch(`/api/challenges/${slug}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        toast({
          title: "Challenge not found",
          variant: "destructive",
        });
        navigate('/challenges');
        return;
      }

      const challengeData = await response.json();
      setChallenge(challengeData);

      // Load hints
      const hintsResponse = await fetch(`/api/challenges/${challengeData.id}/hints`, {
        credentials: 'include',
      });
      if (hintsResponse.ok) {
        const hintsData = await hintsResponse.json();
        setHints(hintsData || []);
      }

      // Check if already solved
      const submissionsResponse = await fetch(`/api/users/${uid}/submissions`, {
        credentials: 'include',
      });
      if (submissionsResponse.ok) {
        const submissions = await submissionsResponse.json();
        const hasSolved = submissions.some(
          (sub: any) => sub.challenge_id === challengeData.id && sub.is_correct
        );
        setSolved(hasSolved);
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      toast({
        title: "Error loading challenge",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !challenge) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/challenges/${challenge.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ flag: flagInput.trim() }),
      });

      const data = await response.json();

      if (data.correct) {
        toast({
          title: "🎉 Correct!",
          description: `You earned ${challenge.points} points!`,
        });
        setSolved(true);
      } else {
        toast({
          title: "Incorrect",
          description: "Try again!",
          variant: "destructive",
        });
      }

      setFlagInput("");
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error submitting flag",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/challenges')}
          className="mb-6 gap-2"
          data-testid="button-back"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Challenges
        </Button>

        <Card className={`${solved ? 'border-primary shadow-glow-moss' : 'border-border'}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2 flex items-center gap-3" data-testid="challenge-title">
                  {challenge.title}
                  {solved && <CheckCircle2 className="h-8 w-8 text-primary" data-testid="solved-badge" />}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-base flex-wrap">
                  <Badge className="capitalize">{challenge.category.replace('_', ' ')}</Badge>
                  {challenge.round && (
                    <Badge variant="outline">
                      {challenge.round.replace('round1', 'Round 1: The Cryptic Trail').replace('round2', 'Round 2: The Patch Arena')}
                    </Badge>
                  )}
                  <span className="flex items-center gap-2 text-cipher-red font-bold text-xl" data-testid="challenge-points">
                    <Trophy className="h-5 w-5" />
                    {challenge.points} points
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Challenge Image */}
            {challenge.image_url && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={challenge.image_url} 
                  alt={challenge.title}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Description */}
            {challenge.description && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-3 text-foreground">Challenge Description</h3>
                <div className="text-muted-foreground" data-testid="challenge-description">
                  <ReactMarkdown>{challenge.description}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* External Link */}
            {challenge.external_link && (
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Resources
                </h3>
                <a
                  href={challenge.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                  data-testid="external-link"
                >
                  <ExternalLink className="h-4 w-4" />
                  {challenge.external_link}
                </a>
              </div>
            )}

            {/* Hints */}
            {hints.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Hints
                </h3>
                <div className="space-y-2">
                  {hints.sort((a, b) => a.position - b.position).map((hint, idx) => (
                    <div key={hint.id} className="p-3 bg-muted/20 rounded-lg border border-border" data-testid={`hint-${idx}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">Hint {idx + 1}</span>
                        {hint.cost > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Cost: {hint.cost} pts
                          </Badge>
                        )}
                        {hint.unlock_time > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Unlocks: {hint.unlock_time} min
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{hint.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flag Submission */}
            {!solved && (
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-submit-flag">
                <div>
                  <h3 className="text-xl font-bold mb-3">Submit Flag</h3>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="flag{...}"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      className="flex-1"
                      required
                      data-testid="input-flag"
                    />
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="shadow-glow-moss"
                      data-testid="button-submit-flag"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {solved && (
              <div className="p-4 bg-primary/10 border border-primary rounded-lg text-center" data-testid="solved-message">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-primary">Challenge Solved!</p>
                <p className="text-sm text-muted-foreground">You've already completed this challenge</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengeDetail;
