
import { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Code, Smartphone, Globe, Calendar, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { dark } from '@clerk/themes';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import ProjectCard from '@/components/ProjectCard';

const Dashboard = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user profile and projects
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.id,
  });

  // Create user profile if it doesn't exist
  useEffect(() => {
    const createUserProfile = async () => {
      if (user && !userProfile && !profileLoading) {
        const { error } = await supabase
          .from('users')
          .insert({
            clerk_user_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            first_name: user.firstName || '',
            last_name: user.lastName || '',
            avatar_url: user.imageUrl || '',
          });

        if (error) {
          console.error('Error creating user profile:', error);
          toast({
            title: 'Error',
            description: 'Failed to create user profile. Please try again.',
            variant: 'destructive',
          });
        }
      }
    };

    createUserProfile();
  }, [user, userProfile, profileLoading]);

  const tokenUsagePercentage = userProfile 
    ? (userProfile.tokens_used / userProfile.tokens_limit) * 100 
    : 0;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (profileLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Codecove</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300">
              <Coins className="w-4 h-4" />
              <span>{formatNumber(userProfile?.tokens_used || 0)} / {formatNumber(userProfile?.tokens_limit || 10000)}</span>
            </div>
            <Badge variant={userProfile?.plan_type === 'pro' ? 'default' : 'secondary'}>
              {userProfile?.plan_type === 'pro' ? 'Pro' : 'Free'}
            </Badge>
            <UserButton 
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox: 'w-10 h-10'
                }
              }}
            />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName}!</h2>
          <p className="text-slate-400">Build amazing apps with AI-powered code generation.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Token Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {formatNumber(userProfile?.tokens_used || 0)}
              </div>
              <Progress value={tokenUsagePercentage} className="mb-2" />
              <p className="text-xs text-slate-400">
                {formatNumber(userProfile?.tokens_limit || 10000)} total tokens
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                {projects?.length || 0}
              </div>
              <p className="text-xs text-slate-400">
                Total projects created
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2 capitalize">
                {userProfile?.plan_type || 'Free'}
              </div>
              <p className="text-xs text-slate-400">
                Current subscription
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Your Projects</h3>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {projects?.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800 text-center py-12">
            <CardContent>
              <Code className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-white">No projects yet</h4>
              <p className="text-slate-400 mb-6">
                Create your first AI-generated application
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project as any} 
                onUpdate={refetchProjects}
              />
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetchProjects}
      />
    </div>
  );
};

export default Dashboard;
