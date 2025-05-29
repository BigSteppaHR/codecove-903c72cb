
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Code, Eye, Terminal, Settings, Zap, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CodeViewer from '@/components/CodeViewer';
import ProjectPrompt from '@/components/ProjectPrompt';

const ProjectEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('prompt');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: projectFiles } = useQuery({
    queryKey: ['projectFiles', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', id)
        .order('file_path');
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <p className="text-sm text-slate-400 capitalize">{project.type} • {project.status}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="prompt" className="data-[state=active]:bg-slate-800">
              <Zap className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-slate-800">
              <Code className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-slate-800">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="terminal" className="data-[state=active]:bg-slate-800">
              <Terminal className="w-4 h-4 mr-2" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-800">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prompt">
            <ProjectPrompt project={project as any} />
          </TabsContent>

          <TabsContent value="code">
            <CodeViewer files={projectFiles || []} />
          </TabsContent>

          <TabsContent value="preview">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-800 p-8 rounded-lg text-center">
                  <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Preview functionality coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terminal">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Terminal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black p-4 rounded-lg font-mono text-green-400">
                  <div className="mb-2">$ Welcome to Codecove Terminal</div>
                  <div className="text-slate-500">Online terminal functionality coming soon...</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Project Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300">Project Name</label>
                    <p className="text-white">{project.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Type</label>
                    <p className="text-white capitalize">{project.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300">Status</label>
                    <p className="text-white capitalize">{project.status}</p>
                  </div>
                  {project.description && (
                    <div>
                      <label className="text-sm font-medium text-slate-300">Description</label>
                      <p className="text-white">{project.description}</p>
                    </div>
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

export default ProjectEditor;
