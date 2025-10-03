import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, Shield, Trophy, User as UserIcon, Code as Code2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary">CONVERGE PRESENTS</span>
            <span className="text-xs text-cipher-red uppercase tracking-wider">OpenCipher</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/challenges">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="nav-challenges">
                  <Trophy className="h-4 w-4" />
                  Challenges
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="nav-leaderboard">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="nav-profile">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="default" size="sm" className="gap-2 shadow-glow-moss" data-testid="nav-admin">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2" data-testid="nav-logout">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="shadow-glow-moss" data-testid="nav-signin">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
