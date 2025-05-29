import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import Editor from "@monaco-editor/react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

// UI Components
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Icons
import {
  AlertCircle,
  Code2,
  Copy,
  Eye,
  FileText,
  FolderTree,
  Loader2,
  Lock,
  Plus,
  Save,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";

// Types
interface FileStructure {
  [key: string]: {
    content: string;
    language: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: "web" | "mobile" | "api";
  files: FileStructure;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_public: boolean;
}

const ProjectShare = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFile, setActiveFile] = useState<string>("/index.js");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  // Fetch project data
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) throw new Error("Project ID is required");

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Project not found or is private");

      return data as Project;
    },
  });

  // Set active file when project loads
  useEffect(() => {
    if (project?.files) {
      // Set active file to index file if it exists
      const indexFile = Object.keys(project.files).find(file => 
        file.includes("index") || file === "/App.jsx" || file === "/App.tsx"
      );
      
      if (indexFile) {
        setActiveFile(indexFile);
      } else if (Object.keys(project.files).length > 0) {
        setActiveFile(Object.keys(project.files)[0]);
      }
    }
  }, [project]);

  // Fork project mutation
  const forkProjectMutation = useMutation({
    mutationFn: async () => {
      if (!project || !user) throw new Error("Project or user not found");

      const newProjectId = nanoid(10);
      const newProject: Omit<Project, "created_at" | "updated_at"> = {
        id: newProjectId,
        name: `${project.name} (Fork)`,
        description: project.description,
        type: project.type,
        files: project.files,
        user_id: user.id,
        is_public: false,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert(newProject)
        .select();

      if (error) throw error;
      return data[0] as Project;
    },
    onSuccess: (data) => {
      toast({
        title: "Project forked!",
        description: "You can now edit your own copy of this project.",
      });
      navigate(`/new?project=${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error forking project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle create new project button
  const handleCreateNew = () => {
    navigate("/new");
  };

  // Handle sign in button
  const handleSignIn = () => {
    navigate("/auth");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Loading Project</h2>
          <p className="text-muted-foreground">Please wait while we fetch the project...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
              Project Not Available
            </CardTitle>
            <CardDescription>
              {error instanceof Error 
                ? error.message 
                : "This project could not be loaded. It may be private or no longer exist."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button onClick={handleCreateNew} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Button>
            {!user && (
              <Button variant="outline" onClick={handleSignIn} className="flex-1">
                Sign In
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Codecove</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h2 className="font-medium">{project.name}</h2>
            <p className="text-sm text-muted-foreground truncate max-w-md">
              {project.description}
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            {project.type}
          </Badge>
          {user ? (
            <Button 
              onClick={() => forkProjectMutation.mutate()}
              disabled={forkProjectMutation.isPending}
            >
              {forkProjectMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Fork Project
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your Own
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <Alert variant="info" className="m-2 bg-primary/10 border-primary/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Read-only Mode</AlertTitle>
        <AlertDescription>
          You're viewing a shared project. Fork it to make your own editable copy.
        </AlertDescription>
      </Alert>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 h-[calc(100vh-120px)]"
      >
        {/* Left Panel - File Tree */}
        <ResizablePanel defaultSize={25} minSize={15}>
          <div className="h-full flex flex-col">
            <Card className="h-full border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FolderTree className="h-5 w-5 mr-2 text-primary" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100vh-180px)]">
                <ScrollArea className="h-full">
                  <div className="space-y-1">
                    {project.files && Object.keys(project.files).map((filePath) => (
                      <div
                        key={filePath}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${
                          activeFile === filePath
                            ? "bg-accent"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => setActiveFile(filePath)}
                      >
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm truncate">{filePath.replace("/", "")}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Code Editor & Preview */}
        <ResizablePanel defaultSize={75}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "code" | "preview")}
            className="h-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="code" className="flex items-center">
                <Code2 className="h-4 w-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            {/* Code Editor Tab */}
            <TabsContent value="code" className="h-[calc(100vh-170px)] border rounded-md">
              {project.files && project.files[activeFile] && (
                <Editor
                  height="100%"
                  language={project.files[activeFile].language}
                  value={project.files[activeFile].content}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    domReadOnly: true,
                    contextmenu: false,
                  }}
                />
              )}
            </TabsContent>
            
            {/* Preview Tab */}
            <TabsContent value="preview" className="h-[calc(100vh-170px)] border rounded-md">
              {project.type === "web" && project.files && (
                <Sandpack
                  template="react"
                  files={Object.entries(project.files).reduce((acc, [path, file]) => {
                    // Remove leading slash for Sandpack
                    const sandpackPath = path.startsWith("/") ? path.substring(1) : path;
                    return {
                      ...acc,
                      [sandpackPath]: file.content,
                    };
                  }, {})}
                  options={{
                    showNavigator: true,
                    showTabs: true,
                    editorHeight: "100%",
                    editorWidthPercentage: 0,
                    activeFile: activeFile.startsWith("/") ? activeFile.substring(1) : activeFile,
                    readOnly: true,
                  }}
                />
              )}
              
              {project.type === "api" && (
                <div className="h-full flex items-center justify-center flex-col p-4">
                  <div className="max-w-md text-center">
                    <h3 className="text-xl font-bold mb-2">API Endpoint</h3>
                    <p className="text-muted-foreground mb-4">
                      API endpoints can't be previewed directly.
                    </p>
                    <pre className="bg-muted p-4 rounded-md text-left overflow-auto max-h-80">
                      <code>
                        {project.files && project.files[activeFile]?.content}
                      </code>
                    </pre>
                  </div>
                </div>
              )}
              
              {project.type === "mobile" && (
                <div className="h-full flex items-center justify-center flex-col p-4">
                  <div className="max-w-md text-center">
                    <h3 className="text-xl font-bold mb-2">Mobile App Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      Mobile app preview is coming soon.
                    </p>
                    <div className="w-[320px] h-[650px] border-8 border-black rounded-3xl mx-auto overflow-hidden">
                      <div className="w-full h-8 bg-black flex justify-center items-center">
                        <div className="w-20 h-4 bg-neutral-800 rounded-full"></div>
                      </div>
                      <div className="w-full h-[calc(100%-32px)] bg-white flex items-center justify-center">
                        <p className="text-black">App Preview Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectShare;
