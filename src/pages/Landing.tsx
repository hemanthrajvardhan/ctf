import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Shield, Target, Users } from "lucide-react";
import heroImage from "@/assets/opencipher-hero.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Hero Section */}
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
          <h1 className="text-6xl md:text-8xl font-bold">
            <span className="bg-gradient-moss bg-clip-text text-transparent">MOSS</span>
            {" "}
            <span className="text-foreground">CONVERGE</span>
          </h1>
          <p className="text-3xl md:text-4xl text-cipher-red uppercase tracking-wider font-bold">
            OpenCipher
          </p>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            A lightweight, secure CTF platform for college treasure-hunt events. 
            Challenge your mind, crack the codes, claim victory.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Link to="/auth">
              <Button size="lg" className="text-lg shadow-glow-moss">
                Get Started
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="text-lg">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-primary">Platform</span> Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-lg bg-card border border-border hover:border-primary transition-all hover:shadow-glow-moss">
              <Trophy className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Diverse Challenges</h3>
              <p className="text-muted-foreground">
                Cryptography, programming, cyber security, and more categories to test your skills.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-all hover:shadow-glow-cipher">
              <Shield className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">
                Built with security in mind. Campus email verification and role-based access.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border hover:border-primary transition-all hover:shadow-glow-moss">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Real-time Scoring</h3>
              <p className="text-muted-foreground">
                Live leaderboard tracking with instant score updates as challenges are solved.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-all hover:shadow-glow-cipher">
              <Users className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-2">Team Competition</h3>
              <p className="text-muted-foreground">
                Compete with fellow students and climb the ranks in your college events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-card/50">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">
            Ready to <span className="text-cipher-red">Break the Code</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the hunt, solve challenges, and prove your skills in the ultimate treasure hunt.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg shadow-glow-cipher">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;