import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Users, Trophy } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface Challenge {
  id: number;
  title: string;
  category: string;
  points: number;
  slug: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(null);
  
  const [userFormData, setUserFormData] = useState({
    email: '',
    name: '',
    password: '',
    role: 'player',
  });

  const [challengeFormData, setChallengeFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: 'cryptography',
    points: 100,
    flag: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetch('http://localhost:3000/api/session', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          navigate('/auth');
          return;
        }

        if (data.user.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "You need admin privileges to access this page.",
            variant: "destructive",
          });
          navigate('/challenges');
          return;
        }

        setIsAdmin(true);
        loadUsers();
        loadChallenges();
      })
      .catch(() => {
        navigate('/auth');
      });
  }, [navigate, toast]);

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        credentials: 'include',
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/challenges', {
        credentials: 'include',
      });
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast({ title: "User created successfully!" });
      setShowUserForm(false);
      setUserFormData({ email: '', name: '', password: '', role: 'player' });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error creating user", description: error.message, variant: "destructive" });
    }
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const challengeData = {
      ...challengeFormData,
      slug: challengeFormData.slug || challengeFormData.title.toLowerCase().replace(/\s+/g, '-'),
    };

    try {
      const url = editingChallengeId 
        ? `http://localhost:3000/api/challenges/${editingChallengeId}`
        : 'http://localhost:3000/api/challenges';
      
      const response = await fetch(url, {
        method: editingChallengeId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(challengeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save challenge');
      }

      toast({ title: editingChallengeId ? "Challenge updated successfully!" : "Challenge created successfully!" });
      setShowChallengeForm(false);
      setEditingChallengeId(null);
      setChallengeFormData({ title: '', slug: '', description: '', category: 'cryptography', points: 100, flag: '' });
      loadChallenges();
    } catch (error: any) {
      toast({ title: "Error saving challenge", description: error.message, variant: "destructive" });
    }
  };

  const handleEditChallenge = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/challenges/${challenges.find(c => c.id === id)?.slug}`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data) {
        setChallengeFormData({
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          category: data.category,
          points: data.points,
          flag: '',
        });
        setEditingChallengeId(id);
        setShowChallengeForm(true);
      }
    } catch (error) {
      toast({ title: "Error loading challenge", variant: "destructive" });
    }
  };

  const handleDeleteChallenge = async (id: number) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/challenges/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete challenge');
      }

      toast({ title: "Challenge deleted successfully!" });
      loadChallenges();
    } catch (error: any) {
      toast({ title: "Error deleting challenge", description: error.message, variant: "destructive" });
    }
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-dark"><Navbar /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="users" className="gap-2" data-testid="tab-users">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2" data-testid="tab-challenges">
              <Trophy className="h-4 w-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button onClick={() => setShowUserForm(!showUserForm)} className="gap-2 shadow-glow-moss" data-testid="button-new-user">
                <Plus className="h-4 w-4" />
                {showUserForm ? 'Cancel' : 'Create User'}
              </Button>
            </div>

            {showUserForm && (
              <Card className="border-primary shadow-glow-moss">
                <CardHeader>
                  <CardTitle>Create New User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUserSubmit} className="space-y-4" data-testid="form-create-user">
                    <div className="space-y-2">
                      <Label htmlFor="user-name">Name</Label>
                      <Input
                        id="user-name"
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        required
                        data-testid="input-user-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-email">Email</Label>
                      <Input
                        id="user-email"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        required
                        data-testid="input-user-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-password">Temporary Password</Label>
                      <Input
                        id="user-password"
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        required
                        data-testid="input-user-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-role">Role</Label>
                      <Select value={userFormData.role} onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}>
                        <SelectTrigger data-testid="select-user-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="player">Player</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full shadow-glow-moss" data-testid="button-submit-user">
                      Create User
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border"
                      data-testid={`user-${user.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email} • {user.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Challenge Management</h2>
              <Button onClick={() => { setShowChallengeForm(!showChallengeForm); setEditingChallengeId(null); }} className="gap-2 shadow-glow-moss" data-testid="button-new-challenge">
                <Plus className="h-4 w-4" />
                {showChallengeForm ? 'Cancel' : 'New Challenge'}
              </Button>
            </div>

            {showChallengeForm && (
              <Card className="border-primary shadow-glow-moss">
                <CardHeader>
                  <CardTitle>{editingChallengeId ? 'Edit Challenge' : 'Create New Challenge'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChallengeSubmit} className="space-y-4" data-testid="form-challenge">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={challengeFormData.title}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
                          required
                          data-testid="input-challenge-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={challengeFormData.slug}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, slug: e.target.value })}
                          placeholder="auto-generated from title"
                          data-testid="input-challenge-slug"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={challengeFormData.category} onValueChange={(value) => setChallengeFormData({ ...challengeFormData, category: value })}>
                          <SelectTrigger data-testid="select-challenge-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cryptography">Cryptography</SelectItem>
                            <SelectItem value="cyber_security">Cyber Security</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="forensics">Forensics</SelectItem>
                            <SelectItem value="web">Web</SelectItem>
                            <SelectItem value="reverse_engineering">Reverse Engineering</SelectItem>
                            <SelectItem value="misc">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="points">Points</Label>
                        <Input
                          id="points"
                          type="number"
                          value={challengeFormData.points}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, points: parseInt(e.target.value) })}
                          required
                          data-testid="input-challenge-points"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={challengeFormData.description}
                        onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                        rows={6}
                        data-testid="textarea-challenge-description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flag">Flag</Label>
                      <Input
                        id="flag"
                        value={challengeFormData.flag}
                        onChange={(e) => setChallengeFormData({ ...challengeFormData, flag: e.target.value })}
                        placeholder="flag{example}"
                        required={!editingChallengeId}
                        data-testid="input-challenge-flag"
                      />
                      {editingChallengeId && <p className="text-sm text-muted-foreground">Leave empty to keep existing flag</p>}
                    </div>

                    <Button type="submit" className="w-full shadow-glow-moss" data-testid="button-submit-challenge">
                      {editingChallengeId ? 'Update Challenge' : 'Create Challenge'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {challenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-border hover:border-primary transition-colors"
                      data-testid={`challenge-${challenge.id}`}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {challenge.category.replace('_', ' ')} • {challenge.points} points
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditChallenge(challenge.id)}
                          className="gap-2"
                          data-testid={`button-edit-challenge-${challenge.id}`}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="gap-2"
                          data-testid={`button-delete-challenge-${challenge.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
