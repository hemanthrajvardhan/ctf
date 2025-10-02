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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Users, Trophy, X, Ban, Check } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_banned: boolean;
  created_at: string;
}

interface Challenge {
  id: number;
  title: string;
  category: string;
  points: number;
  slug: string;
  is_visible: boolean;
  round: string | null;
}

interface Hint {
  id: number;
  content: string;
  cost: number;
  unlock_time: number;
  position: number;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeHints, setSelectedChallengeHints] = useState<Hint[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallengeId, setEditingChallengeId] = useState<number | null>(null);
  const [managingHintsFor, setManagingHintsFor] = useState<number | null>(null);
  
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
    round: '',
    image_url: '',
    external_link: '',
    is_visible: true,
  });

  const [hintFormData, setHintFormData] = useState({
    content: '',
    cost: 0,
    unlock_time: 0,
    position: 0,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/session', {
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
      const response = await fetch('/api/users', {
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
      const response = await fetch('/api/challenges', {
        credentials: 'include',
      });
      const data = await response.json();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const loadHints = async (challengeId: number) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/hints`, {
        credentials: 'include',
      });
      const data = await response.json();
      setSelectedChallengeHints(data);
    } catch (error) {
      console.error('Error loading hints:', error);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users', {
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

  const handleBanToggle = async (userId: number, isBanned: boolean) => {
    try {
      const endpoint = isBanned ? `/api/users/${userId}/unban` : `/api/users/${userId}/ban`;
      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update ban status');
      }

      toast({ title: isBanned ? "User unbanned successfully!" : "User banned successfully!" });
      loadUsers();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
        ? `/api/challenges/${editingChallengeId}`
        : '/api/challenges';
      
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
      setChallengeFormData({ title: '', slug: '', description: '', category: 'cryptography', points: 100, flag: '', round: '', image_url: '', external_link: '', is_visible: true });
      loadChallenges();
    } catch (error: any) {
      toast({ title: "Error saving challenge", description: error.message, variant: "destructive" });
    }
  };

  const handleEditChallenge = async (id: number) => {
    try {
      const response = await fetch(`/api/challenges/${challenges.find(c => c.id === id)?.slug}`, {
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
          round: data.round || '',
          image_url: data.image_url || '',
          external_link: data.external_link || '',
          is_visible: data.is_visible,
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
      const response = await fetch(`/api/challenges/${id}`, {
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

  const handleManageHints = (challengeId: number) => {
    setManagingHintsFor(challengeId);
    loadHints(challengeId);
  };

  const handleAddHint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingHintsFor) return;

    try {
      const response = await fetch(`/api/challenges/${managingHintsFor}/hints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(hintFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to add hint');
      }

      toast({ title: "Hint added successfully!" });
      setHintFormData({ content: '', cost: 0, unlock_time: 0, position: 0 });
      loadHints(managingHintsFor);
    } catch (error: any) {
      toast({ title: "Error adding hint", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteHint = async (hintId: number) => {
    if (!managingHintsFor) return;

    try {
      const response = await fetch(`/api/hints/${hintId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hint');
      }

      toast({ title: "Hint deleted successfully!" });
      loadHints(managingHintsFor);
    } catch (error: any) {
      toast({ title: "Error deleting hint", description: error.message, variant: "destructive" });
    }
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-dark"><Navbar /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                    <div className="grid md:grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
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
                <CardTitle>All Users ({users.length})</CardTitle>
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
                          {user.email} • {user.role} {user.is_banned && <span className="text-red-500">• BANNED</span>}
                        </p>
                      </div>
                      <Button
                        variant={user.is_banned ? "default" : "destructive"}
                        size="sm"
                        onClick={() => handleBanToggle(user.id, user.is_banned)}
                        className="gap-2"
                        data-testid={`button-ban-${user.id}`}
                      >
                        {user.is_banned ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        {user.is_banned ? 'Unban' : 'Ban'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Challenge Management</h2>
              <Button onClick={() => { setShowChallengeForm(!showChallengeForm); setEditingChallengeId(null); setChallengeFormData({ title: '', slug: '', description: '', category: 'cryptography', points: 100, flag: '', round: '', image_url: '', external_link: '', is_visible: true }); }} className="gap-2 shadow-glow-moss" data-testid="button-new-challenge">
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
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={challengeFormData.title}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, title: e.target.value })}
                          required
                          data-testid="input-challenge-title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug (auto-generated)</Label>
                        <Input
                          id="slug"
                          value={challengeFormData.slug}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, slug: e.target.value })}
                          placeholder="auto-generated from title"
                          data-testid="input-challenge-slug"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={challengeFormData.category} onValueChange={(value) => setChallengeFormData({ ...challengeFormData, category: value })}>
                          <SelectTrigger data-testid="select-challenge-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cryptography">Cryptography</SelectItem>
                            <SelectItem value="cyber_security">Cyber Security</SelectItem>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="git">Git & Version Control</SelectItem>
                            <SelectItem value="forensics">Forensics</SelectItem>
                            <SelectItem value="web">Web</SelectItem>
                            <SelectItem value="reverse_engineering">Reverse Engineering</SelectItem>
                            <SelectItem value="misc">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="points">Points *</Label>
                        <Input
                          id="points"
                          type="number"
                          value={challengeFormData.points}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, points: parseInt(e.target.value) })}
                          required
                          data-testid="input-challenge-points"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="round">Round</Label>
                        <Select value={challengeFormData.round} onValueChange={(value) => setChallengeFormData({ ...challengeFormData, round: value })}>
                          <SelectTrigger data-testid="select-challenge-round">
                            <SelectValue placeholder="Select round" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="round1">Round 1: The Cryptic Trail</SelectItem>
                            <SelectItem value="round2">Round 2: The Patch Arena</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description/Story (Markdown supported)</Label>
                      <Textarea
                        id="description"
                        value={challengeFormData.description}
                        onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                        rows={6}
                        placeholder="Challenge description, story, and instructions..."
                        data-testid="textarea-challenge-description"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="image_url">Image URL</Label>
                        <Input
                          id="image_url"
                          value={challengeFormData.image_url}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, image_url: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          data-testid="input-challenge-image"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="external_link">External Link</Label>
                        <Input
                          id="external_link"
                          value={challengeFormData.external_link}
                          onChange={(e) => setChallengeFormData({ ...challengeFormData, external_link: e.target.value })}
                          placeholder="https://github.com/repo or other resource"
                          data-testid="input-challenge-link"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flag">Flag *</Label>
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_visible"
                        checked={challengeFormData.is_visible}
                        onCheckedChange={(checked) => setChallengeFormData({ ...challengeFormData, is_visible: checked })}
                        data-testid="switch-challenge-visible"
                      />
                      <Label htmlFor="is_visible">Challenge is visible to users</Label>
                    </div>

                    <Button type="submit" className="w-full shadow-glow-moss" data-testid="button-submit-challenge">
                      {editingChallengeId ? 'Update Challenge' : 'Create Challenge'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {managingHintsFor && (
              <Card className="border-accent shadow-glow-cipher">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Manage Hints for Challenge #{managingHintsFor}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setManagingHintsFor(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleAddHint} className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border">
                    <h4 className="font-semibold">Add New Hint</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="hint-content">Hint Content *</Label>
                        <Textarea
                          id="hint-content"
                          value={hintFormData.content}
                          onChange={(e) => setHintFormData({ ...hintFormData, content: e.target.value })}
                          placeholder="Hint text..."
                          required
                          rows={3}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="hint-cost">Cost (points)</Label>
                          <Input
                            id="hint-cost"
                            type="number"
                            value={hintFormData.cost}
                            onChange={(e) => setHintFormData({ ...hintFormData, cost: parseInt(e.target.value) })}
                            min="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hint-time">Unlock Time (min)</Label>
                          <Input
                            id="hint-time"
                            type="number"
                            value={hintFormData.unlock_time}
                            onChange={(e) => setHintFormData({ ...hintFormData, unlock_time: parseInt(e.target.value) })}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Add Hint</Button>
                  </form>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Existing Hints ({selectedChallengeHints.length})</h4>
                    {selectedChallengeHints.map((hint, index) => (
                      <div key={hint.id} className="flex items-start justify-between p-3 bg-muted/10 rounded border border-border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">Hint {index + 1}</p>
                          <p className="text-sm">{hint.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Cost: {hint.cost} pts • Unlock: {hint.unlock_time} min
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHint(hint.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {selectedChallengeHints.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No hints yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Challenges ({challenges.length})</CardTitle>
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
                        <h3 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {!challenge.is_visible && <span className="text-xs bg-muted px-2 py-1 rounded">Hidden</span>}
                          {challenge.round && <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">{challenge.round.toUpperCase()}</span>}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {challenge.category.replace('_', ' ')} • {challenge.points} points
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageHints(challenge.id)}
                          data-testid={`button-hints-${challenge.id}`}
                        >
                          Hints
                        </Button>
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
                  {challenges.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No challenges yet. Create your first one!</p>
                  )}
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
