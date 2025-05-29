
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Code, Calendar, Coins, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import ProjectCard from '@/components/ProjectCard';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user profile with better error handling
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
            })
            .select()
            .single();
          
          if (createError) {
            throw createError;
          }
          return newProfile;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Fetch projects
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects, error: projectsError } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id && !!userProfile,
    retry: 2,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Show errors if they occur
  useEffect(() => {
    if (profileError) {
      console.error('Profile error:', profileError);
      toast({
        title: 'Profile Error',
        description: 'Failed to load user profile. Please refresh the page.',
        variant: 'destructive',
      });
    }
    
    if (projectsError) {
      console.error('Projects error:', projectsError);
      toast({
        title: 'Projects Error',
        description: `Failed to load projects: ${projectsError.message}`,
        variant: 'destructive',
      });
    }
  }, [profileError, projectsError, toast]);

  const tokenUsagePercentage = userProfile 
    ? (userProfile.tokens_used / userProfile.tokens_limit) * 100 
    : 0;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (profileLoading) {
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
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.first_name || 'Developer'}!</h2>
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

        {projectsLoading ? (
          <Card className="bg-slate-900 border-slate-800 text-center py-12">
            <CardContent>
              <div className="text-white">Loading projects...</div>
            </CardContent>
          </Card>
        ) : projects?.length === 0 ? (
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
