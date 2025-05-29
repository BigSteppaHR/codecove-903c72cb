import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Code, Eye, Terminal as TerminalIcon, Settings, Zap, LogOut, Rocket, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CodeEditor from '@/components/CodeEditor';
import ProjectPrompt from '@/components/ProjectPrompt';
import ProjectPreview from '@/components/ProjectPreview';
import Terminal from '@/components/Terminal';
import ProjectDeployment from '@/components/ProjectDeployment';
import ProjectCollaboration from '@/components/ProjectCollaboration';

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

  // Check if current user is the project owner
  const isOwner = project?.user_id === user?.id;

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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Always show prompt */}
        <div className="w-80 border-r border-slate-800 bg-slate-900 overflow-y-auto">
          <div className="p-4">
            <ProjectPrompt project={project as any} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-slate-800 bg-slate-900">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent border-none h-12 w-full justify-start rounded-none p-0">
                <TabsTrigger 
                  value="code" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger 
                  value="preview" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger 
                  value="terminal" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  <TerminalIcon className="w-4 h-4 mr-2" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger 
                  value="deploy" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </TabsTrigger>
                <TabsTrigger 
                  value="collaborate" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Share
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="code" className="h-full m-0 p-4">
                <CodeEditor projectId={project.id} files={projectFiles || []} />
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0">
                <ProjectPreview files={projectFiles || []} projectType={project.type} />
              </TabsContent>

              <TabsContent value="terminal" className="h-full m-0">
                <Terminal projectId={project.id} projectType={project.type} />
              </TabsContent>

              <TabsContent value="deploy" className="h-full m-0 p-4">
                <ProjectDeployment projectId={project.id} projectName={project.name} />
              </TabsContent>

              <TabsContent value="collaborate" className="h-full m-0 p-4">
                <ProjectCollaboration projectId={project.id} isOwner={isOwner} />
              </TabsContent>

              <TabsContent value="settings" className="h-full m-0 p-4">
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
      </div>
    </div>
  );
};

export default ProjectEditor;
