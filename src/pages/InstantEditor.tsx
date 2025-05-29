import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Icons
import {
  Code2,
  Eye,
  FileText,
  FolderTree,
  Loader2,
  Play,
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

// Prompt templates
const promptTemplates = [
  {
    name: "React App",
    description: "Create a basic React application",
    prompt: "Create a React app with a header, main content area, and footer. Use modern React practices.",
  },
  {
    name: "API Endpoint",
    description: "Create a serverless API endpoint",
    prompt: "Create a serverless API endpoint that handles GET and POST requests. Include proper error handling.",
  },
  {
    name: "Landing Page",
    description: "Create a responsive landing page",
    prompt: "Create a modern landing page with a hero section, features section, and contact form. Make it responsive.",
  },
];

const defaultFiles: FileStructure = {
  "/index.js": {
    content: "// Your code will appear here",
    language: "javascript",
  },
};

const InstantEditor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeFile, setActiveFile] = useState<string>("/index.js");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [prompt, setPrompt] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("Untitled Project");
  const [projectType, setProjectType] = useState<"web" | "mobile" | "api">("web");
  const [files, setFiles] = useState<FileStructure>(defaultFiles);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>(nanoid(10));

  // Handle file content change
  const handleFileChange = (value: string | undefined) => {
    if (!value) return;
    setFiles((prev) => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        content: value,
      },
    }));
  };

  // Create a new file
  const createNewFile = () => {
    const fileName = prompt("Enter file name (including extension):");
    if (!fileName) return;

    // Determine language based on extension
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    let language = "javascript";

    switch (extension) {
      case "js":
        language = "javascript";
        break;
      case "ts":
        language = "typescript";
        break;
      case "jsx":
        language = "javascript";
        break;
      case "tsx":
        language = "typescript";
        break;
      case "html":
        language = "html";
        break;
      case "css":
        language = "css";
        break;
      case "json":
        language = "json";
        break;
      case "md":
        language = "markdown";
        break;
      default:
        language = "javascript";
    }

    const filePath = fileName.startsWith("/") ? fileName : `/${fileName}`;

    setFiles((prev) => ({
      ...prev,
      [filePath]: {
        content: "",
        language,
      },
    }));

    setActiveFile(filePath);
  };

  // Generate code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async (promptText: string) => {
      setIsGenerating(true);
      
      try {
        const { data, error } = await supabase.functions.invoke("generate-code", {
          body: {
            prompt: promptText,
            projectType,
            model: "claude-4.0", // Specify Claude 4.0
          },
        });

        if (error) throw error;
        return data;
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      if (data?.files) {
        setFiles(data.files);
        
        // Set active file to index file if it exists
        const indexFile = Object.keys(data.files).find(file => 
          file.includes("index") || file === "/App.jsx" || file === "/App.tsx"
        );
        
        if (indexFile) {
          setActiveFile(indexFile);
        }
      }

      toast({
        title: "Code generated successfully!",
        description: `Generated with Claude 4.0`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save project mutation
  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      const project: Omit<Project, "created_at" | "updated_at"> = {
        id: projectId,
        name: projectName,
        description: prompt,
        type: projectType,
        files,
        user_id: user?.id || "",
        is_public: false,
      };

      const { data, error } = await supabase
        .from("projects")
        .upsert(project)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Project saved!",
        description: "Your project has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Share project (make public and get shareable link)
  const shareProject = async () => {
    // First save the project if needed
    if (!saveProjectMutation.isSuccess) {
      await saveProjectMutation.mutateAsync();
    }

    // Make the project public
    const { error } = await supabase
      .from("projects")
      .update({ is_public: true })
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Error sharing project",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Create shareable link
    const shareableLink = `${window.location.origin}/p/${projectId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink);
    
    toast({
      title: "Shareable link created!",
      description: "Link copied to clipboard.",
    });
  };

  // Apply prompt template
  const applyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
  };

  // Handle generate button click
  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Prompt cannot be empty",
        variant: "destructive",
      });
      return;
    }

    generateCodeMutation.mutate(prompt);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Codecove</h1>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-64"
            placeholder="Project name"
          />
          <Select
            value={projectType}
            onValueChange={(value: "web" | "mobile" | "api") => setProjectType(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Web App</SelectItem>
              <SelectItem value="mobile">Mobile App</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveProjectMutation.mutate()}
            disabled={saveProjectMutation.isPending}
          >
            {saveProjectMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareProject}
            disabled={saveProjectMutation.isPending}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 h-[calc(100vh-57px)]"
      >
        {/* Left Panel - Prompt & File Tree */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="h-full flex flex-col">
            <Tabs defaultValue="prompt" className="flex-1">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="prompt">Prompt</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              
              {/* Prompt Tab */}
              <TabsContent value="prompt" className="flex flex-col h-[calc(100vh-110px)]">
                <Card className="flex-1 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      Enhanced Prompt
                    </CardTitle>
                    <CardDescription>
                      Describe what you want to build with Claude 4.0
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to build..."
                      className="flex-1 min-h-[200px] resize-none"
                    />
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Templates</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {promptTemplates.map((template) => (
                          <Card
                            key={template.name}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => applyTemplate(template.prompt)}
                          >
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {template.description}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate with Claude 4.0
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Files Tab */}
              <TabsContent value="files" className="h-[calc(100vh-110px)]">
                <Card className="h-full border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <FolderTree className="h-5 w-5 mr-2 text-primary" />
                        Files
                      </div>
                      <Button size="sm" variant="ghost" onClick={createNewFile}>
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[calc(100vh-180px)]">
                    <ScrollArea className="h-full">
                      <div className="space-y-1">
                        {Object.keys(files).map((filePath) => (
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
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Code Editor & Preview */}
        <ResizablePanel defaultSize={70}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "code" | "preview")}
            className="h-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="code" className="flex items-center">
                <Code2 className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            {/* Code Editor Tab */}
            <TabsContent value="code" className="h-[calc(100vh-110px)] border rounded-md">
              {files[activeFile] && (
                <Editor
                  height="100%"
                  language={files[activeFile].language}
                  value={files[activeFile].content}
                  onChange={handleFileChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              )}
            </TabsContent>
            
            {/* Preview Tab */}
            <TabsContent value="preview" className="h-[calc(100vh-110px)] border rounded-md">
              {projectType === "web" && (
                <Sandpack
                  template="react"
                  files={Object.entries(files).reduce((acc, [path, file]) => {
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
                  }}
                />
              )}
              
              {projectType === "api" && (
                <div className="h-full flex items-center justify-center flex-col p-4">
                  <div className="max-w-md text-center">
                    <h3 className="text-xl font-bold mb-2">API Endpoint</h3>
                    <p className="text-muted-foreground mb-4">
                      API endpoints can't be previewed directly. Deploy your API to test it.
                    </p>
                    <Button disabled>
                      <Play className="h-4 w-4 mr-2" />
                      Deploy API
                    </Button>
                  </div>
                </div>
              )}
              
              {projectType === "mobile" && (
                <div className="h-full flex items-center justify-center flex-col p-4">
                  <div className="max-w-md text-center">
                    <h3 className="text-xl font-bold mb-2">Mobile App Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      Mobile app preview is coming soon. You can still edit the code.
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

export default InstantEditor;
