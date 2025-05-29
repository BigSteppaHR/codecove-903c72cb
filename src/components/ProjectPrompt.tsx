
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, Sparkles } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: 'web' | 'mobile' | 'fullstack';
  status: 'draft' | 'generating' | 'ready' | 'deployed';
}

interface ProjectPromptProps {
  project: Project;
}

const ProjectPrompt = ({ project }: ProjectPromptProps) => {
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCodeMutation = useMutation({
    mutationFn: async (promptText: string) => {
      // Update project status to generating
      await supabase
        .from('projects')
        .update({ status: 'generating' })
        .eq('id', project.id);

      // For now, we'll simulate the AI generation
      // In a real implementation, this would call Claude API
      const simulatedFiles = [
        {
          project_id: project.id,
          file_path: 'package.json',
          content: JSON.stringify({
            name: project.name.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            },
            dependencies: {
              'react': '^18.0.0',
              'react-dom': '^18.0.0'
            }
          }, null, 2),
          file_type: 'json'
        },
        {
          project_id: project.id,
          file_path: 'src/App.jsx',
          content: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ${project.name}
        </h1>
        <p className="text-lg text-gray-600">
          Generated with AI: ${promptText}
        </p>
      </div>
    </div>
  )
}

export default App`,
          file_type: 'jsx'
        },
        {
          project_id: project.id,
          file_path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
          file_type: 'html'
        }
      ];

      // Clear existing files
      await supabase
        .from('project_files')
        .delete()
        .eq('project_id', project.id);

      // Insert new files
      const { error } = await supabase
        .from('project_files')
        .insert(simulatedFiles);

      if (error) throw error;

      // Update project status to ready
      await supabase
        .from('projects')
        .update({ status: 'ready' })
        .eq('id', project.id);

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Code generated!',
        description: 'Your application has been generated successfully.',
      });
      setPrompt('');
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projectFiles', project.id] });
    },
    onError: (error) => {
      console.error('Error generating code:', error);
      toast({
        title: 'Generation failed',
        description: 'Failed to generate code. Please try again.',
        variant: 'destructive',
      });
      // Reset status on error
      supabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', project.id);
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateCodeMutation.mutate(prompt);
  };

  const isGenerating = project.status === 'generating' || generateCodeMutation.isPending;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
            AI Code Generation
          </CardTitle>
          <Badge variant={project.status === 'ready' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {project.description && (
          <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Project Description</h4>
            <p className="text-white">{project.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Describe what you want to build or modify
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe your ${project.type} application. For example:
- "Create a todo app with add, edit, and delete functionality"
- "Build a weather app that shows current weather and 5-day forecast"
- "Make a chat application with real-time messaging"`}
              className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium">AI Model: Claude 3.5 Sonnet</p>
                <p className="text-slate-400">
                  Tokens will be consumed based on the generated code size
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </div>

        {project.status === 'ready' && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-green-300 font-medium">Code generation complete!</p>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Check the Code tab to view your generated files
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPrompt;
