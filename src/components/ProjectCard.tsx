
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Code, Smartphone, Globe, ExternalLink, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: 'web' | 'mobile' | 'fullstack';
  status: 'draft' | 'generating' | 'ready' | 'deployed';
  github_repo_url: string | null;
  deploy_url: string | null;
  created_at: string;
}

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web': return Globe;
      case 'mobile': return Smartphone;
      case 'fullstack': return Code;
      default: return Code;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'generating': return 'default';
      case 'ready': return 'default';
      case 'deployed': return 'default';
      default: return 'secondary';
    }
  };

  const TypeIcon = getTypeIcon(project.type);
  const formattedDate = new Date(project.created_at).toLocaleDateString();

  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <TypeIcon className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white text-lg">{project.name}</CardTitle>
          </div>
          <Badge variant={getStatusColor(project.status)} className="text-xs">
            {project.status}
          </Badge>
        </div>
        {project.description && (
          <CardDescription className="text-slate-400 line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center text-xs text-slate-500">
          <Calendar className="w-3 h-3 mr-1" />
          {formattedDate}
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => navigate(`/project/${project.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
          >
            Open Project
          </Button>
          
          {project.deploy_url && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => window.open(project.deploy_url!, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          
          {project.github_repo_url && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => window.open(project.github_repo_url!, '_blank')}
            >
              <Github className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
