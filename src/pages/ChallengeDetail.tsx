import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trophy, ChevronLeft, CheckCircle2, AlertCircle, FileText, Link as LinkIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Challenge {
  id: string;
  title: string;
  story: string;
  points: number;
  category: string;
  attachments: any;
  hints: any;
  flag_hash: string;
}

const ChallengeDetail = () => {
  const { slug } = useParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [flagInput, setFlagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [solved, setSolved] = useState(false);
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
      loadChallenge(session.user.id);
    });
  }, [slug, navigate]);

  const loadChallenge = async (userId: string) => {
    const { data: challengeData, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !challengeData) {
      toast({
        title: "Challenge not found",
        variant: "destructive",
      });
      navigate('/challenges');
      return;
    }

    setChallenge(challengeData);

    // Check if already solved
    const { data: solveData } = await supabase
      .from('solves')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeData.id)
      .maybeSingle();

    setSolved(!!solveData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !challenge) return;

    setSubmitting(true);

    // Hash the submitted flag (simple comparison for now)
    const isCorrect = flagInput.trim().toLowerCase() === challenge.flag_hash.toLowerCase();

    // Record submission
    await supabase.from('submissions').insert({
      user_id: user.id,
      challenge_id: challenge.id,
      submission_text: flagInput,
      is_correct: isCorrect,
    });

    if (isCorrect && !solved) {
      // Record solve
      await supabase.from('solves').insert({
        user_id: user.id,
        challenge_id: challenge.id,
        points_awarded: challenge.points,
      });

      toast({
        title: "🎉 Correct!",
        description: `You earned ${challenge.points} points!`,
      });

      setSolved(true);
    } else if (isCorrect && solved) {
      toast({
        title: "Already solved",
        description: "You've already solved this challenge!",
      });
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
    }

    setFlagInput("");
    setSubmitting(false);
  };

  if (!challenge) {
    return <div className="min-h-screen bg-gradient-dark"><Navbar /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/challenges')}
          className="mb-6 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Challenges
        </Button>

        <Card className={`${solved ? 'border-primary shadow-glow-moss' : 'border-border'}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2 flex items-center gap-3">
                  {challenge.title}
                  {solved && <CheckCircle2 className="h-8 w-8 text-primary" />}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-base">
                  <Badge className="capitalize">{challenge.category.replace('_', ' ')}</Badge>
                  <span className="flex items-center gap-2 text-cipher-red font-bold text-xl">
                    <Trophy className="h-5 w-5" />
                    {challenge.points} points
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Story */}
            {challenge.story && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-3 text-foreground">Challenge Story</h3>
                <div className="text-muted-foreground">
                  <ReactMarkdown>{challenge.story}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Attachments */}
            {challenge.attachments && Array.isArray(challenge.attachments) && challenge.attachments.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments
                </h3>
                <div className="space-y-2">
                  {challenge.attachments.map((att: any, idx: number) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {att.name || `Attachment ${idx + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Hints */}
            {challenge.hints && Array.isArray(challenge.hints) && challenge.hints.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Hints
                </h3>
                <div className="space-y-2">
                  {challenge.hints.map((hint: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{hint.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flag Submission */}
            {!solved && (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    />
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="shadow-glow-moss"
                    >
                      {submitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {solved && (
              <div className="p-4 bg-primary/10 border border-primary rounded-lg text-center">
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