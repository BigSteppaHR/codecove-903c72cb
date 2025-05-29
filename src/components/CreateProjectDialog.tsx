
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Code, Smartphone, Globe } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateProjectDialog = ({ open, onOpenChange, onSuccess }: CreateProjectDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'web' as 'web' | 'mobile' | 'fullstack',
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description,
          type: data.type,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return project;
    },
    onSuccess: () => {
      toast({
        title: 'Project created!',
        description: 'Your new project has been created successfully.',
      });
      setFormData({ name: '', description: '', type: 'web' });
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    createProjectMutation.mutate(formData);
  };

  const projectTypes = [
    { value: 'web', label: 'Web Application', icon: Globe, description: 'React/Next.js web app' },
    { value: 'mobile', label: 'Mobile App', icon: Smartphone, description: 'React Native with Expo' },
    { value: 'fullstack', label: 'Full-Stack App', icon: Code, description: 'Web + Mobile + Backend' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription className="text-slate-400">
            Start building your next application with AI
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Awesome App"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your app should do..."
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Project Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'web' | 'mobile' | 'fullstack') => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white">
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4" />
                      <div>
                        <div>{type.label}</div>
                        <div className="text-xs text-slate-400">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending || !formData.name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
