
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  content: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectPreviewProps {
  files: ProjectFile[];
  projectType: string;
}

const ProjectPreview = ({ files, projectType }: ProjectPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const generatePreview = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Find the main HTML file or create one
      let htmlFile = files.find(f => f.file_path.endsWith('.html') || f.file_path.includes('index.html'));
      
      if (!htmlFile && projectType === 'web') {
        // Create a basic HTML structure for React/Vue projects
        htmlFile = {
          id: 'temp',
          project_id: '',
          file_path: 'index.html',
          content: generateBasicHTML(),
          file_type: 'html',
          created_at: '',
          updated_at: ''
        };
      }

      if (!htmlFile) {
        setError('No HTML file found. Preview is only available for web projects.');
        return;
      }

      // Process the HTML content to include other files
      let processedContent = htmlFile.content || '';
      
      // Inject CSS files
      const cssFiles = files.filter(f => f.file_path.endsWith('.css'));
      cssFiles.forEach(cssFile => {
        if (cssFile.content) {
          processedContent = processedContent.replace(
            '</head>',
            `<style>${cssFile.content}</style></head>`
          );
        }
      });

      // Inject JavaScript files
      const jsFiles = files.filter(f => f.file_path.endsWith('.js') || f.file_path.endsWith('.jsx'));
      jsFiles.forEach(jsFile => {
        if (jsFile.content) {
          processedContent = processedContent.replace(
            '</body>',
            `<script>${jsFile.content}</script></body>`
          );
        }
      });

      // Create blob URL for preview
      const blob = new Blob([processedContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      toast({
        title: 'Preview Generated',
        description: 'Your project preview is ready!',
      });
    } catch (err) {
      setError('Failed to generate preview. Please check your code for syntax errors.');
      console.error('Preview generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateBasicHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
    </style>
</head>
<body>
    <div id="root">
        <div class="container">
            <h1>Project Preview</h1>
            <p>Your generated project will appear here.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const refreshPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    generatePreview();
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      generatePreview();
    }
    
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [files]);

  if (files.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No files to preview</h3>
          <p className="text-slate-400">
            Generate some code first to see the preview
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-white">Live Preview</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {projectType}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshPreview}
              disabled={isLoading}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {previewUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={openInNewTab}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={generatePreview}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        ) : previewUrl ? (
          <div className="relative">
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-[600px] border-0 bg-white rounded-b-lg"
              title="Project Preview"
              sandbox="allow-scripts allow-same-origin"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-b-lg">
                <div className="text-white flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating preview...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-white flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading preview...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectPreview;
