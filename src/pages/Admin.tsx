import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  category: string;
  points: number;
  slug: string;
}

const Admin = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    story: '',
    category: 'cryptography',
    points: 100,
    flag: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to access this page.",
          variant: "destructive",
        });
        navigate('/challenges');
        return;
      }

      setIsAdmin(true);
      loadChallenges();
    });
  }, [navigate, toast]);

  const loadChallenges = async () => {
    const { data } = await supabase
      .from('challenges')
      .select('id, title, category, points, slug')
      .order('created_at', { ascending: false });

    setChallenges(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const challengeData = {
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      story: formData.story,
      category: formData.category as any,
      points: formData.points,
      flag_hash: formData.flag,
    };

    if (editingId) {
      const { error } = await supabase
        .from('challenges')
        .update(challengeData)
        .eq('id', editingId);

      if (error) {
        toast({ title: "Error updating challenge", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Challenge updated successfully!" });
    } else {
      const { error } = await supabase
        .from('challenges')
        .insert(challengeData);

      if (error) {
        toast({ title: "Error creating challenge", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Challenge created successfully!" });
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      story: '',
      category: 'cryptography',
      points: 100,
      flag: '',
    });
    loadChallenges();
  };

  const handleEdit = async (id: string) => {
    const { data } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setFormData({
        title: data.title,
        slug: data.slug,
        story: data.story || '',
        category: data.category,
        points: data.points,
        flag: data.flag_hash,
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error deleting challenge", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Challenge deleted successfully!" });
    loadChallenges();
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-gradient-dark"><Navbar /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 shadow-glow-moss">
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'New Challenge'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 border-primary shadow-glow-moss">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Challenge' : 'Create New Challenge'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-generated from title"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
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
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Story (Markdown supported)</Label>
                  <Textarea
                    id="story"
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flag">Flag</Label>
                  <Input
                    id="flag"
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    placeholder="flag{example}"
                    required
                  />
                </div>

                <Button type="submit" className="w-full shadow-glow-moss">
                  {editingId ? 'Update Challenge' : 'Create Challenge'}
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
                      onClick={() => handleEdit(challenge.id)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(challenge.id)}
                      className="gap-2"
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
      </div>
    </div>
  );
};

export default Admin;