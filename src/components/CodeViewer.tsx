
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Copy, Download, Folder, File } from 'lucide-react';
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

interface CodeViewerProps {
  files: ProjectFile[];
}

const CodeViewer = ({ files }: CodeViewerProps) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(
    files.length > 0 ? files[0] : null
  );
  const { toast } = useToast();

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    });
  };

  const downloadFile = (file: ProjectFile) => {
    if (!file.content) return;
    
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_path.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <File className="w-4 h-4" />;
  };

  const getLanguage = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'json': return 'json';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'py': return 'python';
      default: return 'text';
    }
  };

  if (files.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No files generated yet</h3>
          <p className="text-slate-400">
            Use the Generate tab to create your application files
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* File Explorer */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center">
            <Folder className="w-4 h-4 mr-2" />
            Project Files
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-4">
              {files.map((file) => (
                <Button
                  key={file.id}
                  variant={selectedFile?.id === file.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    {getFileIcon(file.file_path)}
                    <span className="text-sm truncate">{file.file_path}</span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Code Display */}
      <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-white text-sm">
                {selectedFile?.file_path || 'Select a file'}
              </CardTitle>
              {selectedFile && (
                <Badge variant="secondary" className="text-xs">
                  {getLanguage(selectedFile.file_path)}
                </Badge>
              )}
            </div>
            {selectedFile && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => selectedFile.content && copyToClipboard(selectedFile.content)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(selectedFile)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedFile ? (
            <ScrollArea className="h-[400px]">
              <pre className="p-4 text-sm bg-slate-950 text-slate-300 overflow-x-auto">
                <code>{selectedFile.content || 'No content'}</code>
              </pre>
            </ScrollArea>
          ) : (
            <div className="p-8 text-center text-slate-400">
              Select a file to view its contents
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeViewer;
