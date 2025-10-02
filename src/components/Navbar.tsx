import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { LogOut, Shield, Trophy, User as UserIcon } from "lucide-react";
import mossLogo from "@/assets/moss-logo.png";

export const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={mossLogo} alt="MOSS" className="h-10 w-10 transition-transform group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="font-bold text-xl text-primary">MOSS CONVERGE</span>
            <span className="text-xs text-cipher-red uppercase tracking-wider">OpenCipher</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/challenges">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Challenges
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="default" size="sm" className="gap-2 shadow-glow-moss">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" className="shadow-glow-moss">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};