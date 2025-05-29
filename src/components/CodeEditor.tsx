
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Save, Plus, Trash2, File, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFile {
  id: string;
  project_id: string;
  file_path: string;
  content: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
}

interface CodeEditorProps {
  projectId: string;
  files: ProjectFile[];
}

const CodeEditor = ({ projectId, files }: CodeEditorProps) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(
    files.length > 0 ? files[0] : null
  );
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setFileContent(selectedFile.content || '');
      setHasUnsavedChanges(false);
    }
  }, [selectedFile]);

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ fileId, content }: { fileId: string; content: string }) => {
      const { data, error } = await supabase
        .from('project_files')
        .update({ 
          content, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', fileId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'File saved',
        description: 'Changes have been saved successfully',
      });
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create new file mutation
  const createFileMutation = useMutation({
    mutationFn: async ({ fileName, content = '' }: { fileName: string; content?: string }) => {
      const fileType = fileName.split('.').pop()?.toLowerCase() || 'text';
      
      const { data, error } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          file_path: fileName,
          content,
          file_type: fileType,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newFile) => {
      toast({
        title: 'File created',
        description: `${newFile.file_path} has been created`,
      });
      setSelectedFile(newFile);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('project_files')
        .delete()
        .eq('id', fileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'File deleted',
        description: 'File has been deleted successfully',
      });
      setSelectedFile(files.length > 1 ? files[0] : null);
      queryClient.invalidateQueries({ queryKey: ['projectFiles', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleContentChange = (value: string) => {
    setFileContent(value);
    setHasUnsavedChanges(value !== (selectedFile?.content || ''));
  };

  const handleSave = () => {
    if (selectedFile && hasUnsavedChanges) {
      saveFileMutation.mutate({
        fileId: selectedFile.id,
        content: fileContent,
      });
    }
  };

  const handleCreateFile = () => {
    const fileName = prompt('Enter file name (e.g., components/Button.tsx):');
    if (fileName) {
      createFileMutation.mutate({ fileName });
    }
  };

  const handleDeleteFile = () => {
    if (selectedFile && confirm(`Are you sure you want to delete ${selectedFile.file_path}?`)) {
      deleteFileMutation.mutate(selectedFile.id);
    }
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

  const getFileIcon = (fileName: string) => {
    return <File className="w-4 h-4" />;
  };

  if (files.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No files generated yet</h3>
          <p className="text-slate-400 mb-4">
            Use the Generate tab to create your application files
          </p>
          <Button onClick={handleCreateFile} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New File
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[600px]">
      {/* File Explorer */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center">
              <Folder className="w-4 h-4 mr-2" />
              Files
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCreateFile}
              className="text-slate-400 hover:text-white p-1"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
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
                    {file.id === selectedFile?.id && hasUnsavedChanges && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="lg:col-span-3 bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
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
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                  Unsaved
                </Badge>
              )}
            </div>
            {selectedFile && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saveFileMutation.isPending}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {saveFileMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteFile}
                  className="border-red-700 text-red-400 hover:bg-red-900/20"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {selectedFile ? (
            <div className="h-[500px] flex flex-col">
              <textarea
                value={fileContent}
                onChange={(e) => handleContentChange(e.target.value)}
                className="flex-1 w-full p-4 bg-slate-950 text-slate-300 font-mono text-sm border-none outline-none resize-none"
                placeholder="Start coding..."
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 h-[500px] flex items-center justify-center">
              Select a file to start editing
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
