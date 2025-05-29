
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  ExternalLink, 
  Rocket, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw
} from 'lucide-react';

interface ProjectDeploymentProps {
  projectId: string;
  projectName: string;
}

interface Deployment {
  id: string;
  platform: string;
  url: string;
  status: 'building' | 'ready' | 'error';
  created_at: string;
  build_log?: string;
}

const ProjectDeployment = ({ projectId, projectName }: ProjectDeploymentProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState('vercel');
  const [deploymentConfig, setDeploymentConfig] = useState({
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    environmentVars: ''
  });

  // Fetch existing deployments
  const { data: deployments, isLoading } = useQuery({
    queryKey: ['deployments', projectId],
    queryFn: async () => {
      // Simulate API call - in real implementation would fetch from backend
      const mockDeployments: Deployment[] = [
        {
          id: '1',
          platform: 'vercel',
          url: `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.vercel.app`,
          status: 'ready',
          created_at: new Date().toISOString()
        }
      ];
      return mockDeployments;
    },
  });

  // Deploy to platform mutation
  const deployMutation = useMutation({
    mutationFn: async (platform: string) => {
      // Simulate deployment process
      const deploymentUrl = platform === 'vercel' 
        ? `https://${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.vercel.app`
        : `https://${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.netlify.app`;

      // In real implementation, this would:
      // 1. Package the project files
      // 2. Send to deployment platform API
      // 3. Monitor build status
      // 4. Update project record with deployment URL

      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate build time
      
      return {
        id: Date.now().toString(),
        platform,
        url: deploymentUrl,
        status: 'ready' as const,
        created_at: new Date().toISOString()
      };
    },
    onSuccess: (deployment) => {
      toast({
        title: 'Deployment successful!',
        description: `Your project is now live at ${deployment.url}`,
      });
      queryClient.invalidateQueries({ queryKey: ['deployments', projectId] });
      
      // Update project with deployment URL
      supabase
        .from('projects')
        .update({ deploy_url: deployment.url })
        .eq('id', projectId);
    },
    onError: (error) => {
      toast({
        title: 'Deployment failed',
        description: 'Please check your project configuration and try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDeploy = () => {
    deployMutation.mutate(selectedPlatform);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'building':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Deployments */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Live Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-400">Loading deployments...</div>
          ) : deployments && deployments.length > 0 ? (
            <div className="space-y-3">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium capitalize">{deployment.platform}</span>
                          <Badge className={getStatusColor(deployment.status)}>
                            {deployment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {new Date(deployment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(deployment.url, '_blank')}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </div>
                  {deployment.status === 'ready' && (
                    <div className="mt-2">
                      <span className="text-sm text-slate-300">URL: </span>
                      <span className="text-sm text-blue-400">{deployment.url}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Globe className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p>No deployments yet</p>
              <p className="text-sm">Deploy your project to make it live</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deploy New */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Deploy Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-slate-800 border-slate-700">
            <AlertDescription className="text-slate-300">
              Deploy your project to make it accessible on the web. Choose a platform and configure your deployment settings.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Platform Selection */}
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="vercel">Vercel</SelectItem>
                    <SelectItem value="netlify">Netlify</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300">Build Command</Label>
                <Input
                  value={deploymentConfig.buildCommand}
                  onChange={(e) => setDeploymentConfig({
                    ...deploymentConfig,
                    buildCommand: e.target.value
                  })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="npm run build"
                />
              </div>

              <div>
                <Label className="text-slate-300">Output Directory</Label>
                <Input
                  value={deploymentConfig.outputDirectory}
                  onChange={(e) => setDeploymentConfig({
                    ...deploymentConfig,
                    outputDirectory: e.target.value
                  })}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="dist"
                />
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2 capitalize">{selectedPlatform} Deployment</h4>
              <div className="space-y-2 text-sm text-slate-300">
                {selectedPlatform === 'vercel' ? (
                  <>
                    <p>• Automatic builds from Git</p>
                    <p>• Global CDN distribution</p>
                    <p>• Custom domains support</p>
                    <p>• Serverless functions</p>
                  </>
                ) : (
                  <>
                    <p>• Continuous deployment</p>
                    <p>• Form handling</p>
                    <p>• Split testing</p>
                    <p>• Edge functions</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleDeploy}
            disabled={deployMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {deployMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to {selectedPlatform}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDeployment;
