import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Shield, Target, GitBranch } from "lucide-react";
import heroImage from "@/assets/opencipher-hero.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        
        <div className="relative z-10 text-center space-y-6 px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-moss bg-clip-text text-transparent">CONVERGE</span>
            {" "}
            <span className="text-foreground">PRESENTS</span>
          </h1>
          <p className="text-4xl md:text-5xl text-cipher-red uppercase tracking-wider font-bold">
            OpenCipher
          </p>
          <div className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto space-y-4">
            <p className="font-semibold">
              Step into the world of open source with OpenCipher, a unique two-round event designed for curious minds and aspiring developers.
            </p>
            <p>
              Decode encrypted clues, navigate Git trails, and contribute real code to open issues in live repositories. From cryptic puzzles to real-world patching, this event blends challenges with learning. This is your gateway to practical coding and creative problem-solving.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="font-bold text-primary">Type</p>
                <p>Regular</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="font-bold text-primary">Rounds</p>
                <p>2</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="font-bold text-primary">Team Size</p>
                <p>2-4 members</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border">
                <p className="font-bold text-primary">Format</p>
                <p>Online + Offline</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center pt-8">
            <Link to="/auth">
              <Button size="lg" className="text-lg shadow-glow-moss" data-testid="button-get-started">
                Get Started
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="text-lg" data-testid="button-view-leaderboard">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-primary">Event</span> Rounds
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="p-8 rounded-lg bg-card border border-border hover:border-primary transition-all hover:shadow-glow-moss">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-bold">Round 1: The Cryptic Trail</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Teams hunt for clues hidden across mock repositories, Git logs, commit messages, and code snippets. Success requires adept use of Git commands, decrypting messages, and interpreting licenses, all without brute-forcing or external help.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>Puzzle-solving accuracy & speed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>Effective use of Git commands / CLI proficiency</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>Understanding of open-source ecosystem</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span>Team collaboration & problem-solving</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-lg bg-card border border-border hover:border-accent transition-all hover:shadow-glow-cipher">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="h-12 w-12 text-accent" />
                <h3 className="text-2xl font-bold">Round 2: The Patch Arena</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Shortlisted teams are assigned real open-source repositories with open issues. They aim to contribute high-quality fixes or enhancements, adhering to Git best practices. The final phase includes an offline jury presentation of their process and solutions.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                  <span>Code quality and adherence to best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                  <span>Contribution impact and completeness</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                  <span>Presentation clarity and technical depth</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="h-4 w-4 text-accent mt-1 flex-shrink-0" />
                  <span>Problem-solving approach</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/50">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Ready to <span className="text-cipher-red">Join the Challenge</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Decode, contribute, and conquer. Your journey into open source starts here.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg shadow-glow-cipher" data-testid="button-start-journey">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
