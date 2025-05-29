
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Zap, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const generateCodeMutation = useMutation({
    mutationFn: async (promptText: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: {
          prompt: promptText,
          projectId: project.id,
          projectName: project.name,
          projectType: project.type
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Code generation started!',
        description: `Using ~${data.tokensUsed} tokens. Check the Code tab in a few moments.`,
      });
      setPrompt('');
      // Invalidate queries to refresh project status
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['projectFiles', project.id] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    },
    onError: (error: any) => {
      console.error('Error generating code:', error);
      
      let errorMessage = 'Failed to generate code. Please try again.';
      if (error.message?.includes('Claude API key not configured')) {
        errorMessage = 'AI service not configured. Please contact support.';
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication expired. Please sign in again.';
      }

      toast({
        title: 'Generation failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to generate code.',
        variant: 'destructive',
      });
      return;
    }
    generateCodeMutation.mutate(prompt);
  };

  const isGenerating = project.status === 'generating' || generateCodeMutation.isPending;

  // Example prompts based on project type
  const getExamplePrompts = () => {
    switch (project.type) {
      case 'web':
        return [
          'Create a todo app with add, edit, delete, and mark complete functionality',
          'Build a weather app that shows current weather and 5-day forecast',
          'Make a blog with posts, comments, and user authentication',
          'Create a dashboard with charts and data visualization'
        ];
      case 'mobile':
        return [
          'Create a mobile fitness tracker with workout logging',
          'Build a recipe app with search and favorites',
          'Make a expense tracker with categories and budgets',
          'Create a social media app with posts and messaging'
        ];
      default:
        return [
          'Create a full-stack e-commerce platform with user accounts',
          'Build a project management tool with teams and tasks',
          'Make a social network with posts, friends, and chat',
          'Create a learning management system with courses'
        ];
    }
  };

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
              placeholder={`Describe your ${project.type} application in detail...`}
              className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          <div className="bg-slate-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Example prompts:</h4>
            <div className="space-y-2">
              {getExamplePrompts().slice(0, 3).map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  disabled={isGenerating}
                  className="text-left text-sm text-slate-400 hover:text-blue-400 block transition-colors disabled:opacity-50"
                >
                  • {example}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium">AI Model: Claude 3.5 Sonnet</p>
                <p className="text-slate-400">
                  High-quality code generation with modern best practices
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate with AI
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

        {project.status === 'generating' && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              <p className="text-yellow-300 font-medium">AI is generating your code...</p>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              This usually takes 30-60 seconds. You can switch tabs while waiting.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPrompt;
