
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal as TerminalIcon, Play, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TerminalOutput {
  id: string;
  command: string;
  output: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

interface TerminalProps {
  projectId: string;
  projectType: string;
}

const Terminal = ({ projectId, projectType }: TerminalProps) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Sample commands based on project type
  const getSampleCommands = () => {
    const baseCommands = [
      'help - Show available commands',
      'clear - Clear terminal',
      'ls - List files',
      'pwd - Show current directory',
      'echo "message" - Print message',
    ];

    const webCommands = [
      'npm install - Install dependencies',
      'npm run dev - Start development server',
      'npm run build - Build for production',
      'npm test - Run tests',
    ];

    return projectType === 'web' ? [...baseCommands, ...webCommands] : baseCommands;
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsExecuting(true);
    const commandId = Date.now().toString();
    
    // Add command to history
    setCommandHistory(prev => [...prev.slice(-50), cmd]); // Keep last 50 commands
    setHistoryIndex(-1);

    try {
      let output = '';
      let type: 'success' | 'error' | 'info' = 'success';

      // Simulate command execution
      switch (cmd.toLowerCase().trim()) {
        case 'help':
          output = getSampleCommands().join('\n');
          type = 'info';
          break;
        
        case 'clear':
          setHistory([]);
          setIsExecuting(false);
          return;
        
        case 'ls':
          output = 'index.html\nstyle.css\nscript.js\npackage.json\nREADME.md';
          break;
        
        case 'pwd':
          output = `/projects/${projectId}`;
          break;
        
        case 'npm install':
          output = 'Installing dependencies...\n✓ Dependencies installed successfully';
          await new Promise(resolve => setTimeout(resolve, 2000));
          break;
        
        case 'npm run dev':
          output = 'Starting development server...\n✓ Server running on http://localhost:3000';
          await new Promise(resolve => setTimeout(resolve, 1500));
          break;
        
        case 'npm run build':
          output = 'Building for production...\n✓ Build completed successfully';
          await new Promise(resolve => setTimeout(resolve, 3000));
          break;
        
        case 'npm test':
          output = 'Running tests...\n✓ All tests passed (0 tests)';
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        
        default:
          if (cmd.startsWith('echo ')) {
            output = cmd.substring(5).replace(/['"]/g, '');
          } else {
            output = `Command not found: ${cmd}\nType 'help' to see available commands`;
            type = 'error';
          }
      }

      const newOutput: TerminalOutput = {
        id: commandId,
        command: cmd,
        output,
        type,
        timestamp: new Date()
      };

      setHistory(prev => [...prev, newOutput]);
    } catch (error) {
      const errorOutput: TerminalOutput = {
        id: commandId,
        command: cmd,
        output: `Error executing command: ${error}`,
        type: 'error',
        timestamp: new Date()
      };
      setHistory(prev => [...prev, errorOutput]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isExecuting) {
      executeCommand(command);
      setCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex] || '');
        }
      }
    }
  };

  const clearTerminal = () => {
    setHistory([]);
    toast({
      title: 'Terminal cleared',
      description: 'Command history has been cleared',
    });
  };

  const copyOutput = (output: string) => {
    navigator.clipboard.writeText(output);
    toast({
      title: 'Copied to clipboard',
      description: 'Terminal output copied successfully',
    });
  };

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <TerminalIcon className="w-5 h-5 mr-2" />
            Terminal
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearTerminal}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black text-green-400 font-mono text-sm">
          {/* Terminal Output */}
          <ScrollArea className="h-[400px] p-4" ref={scrollAreaRef}>
            <div className="space-y-2">
              {/* Welcome message */}
              {history.length === 0 && (
                <div className="text-slate-500">
                  <div>Welcome to Codecove Terminal</div>
                  <div>Type 'help' to see available commands</div>
                  <div>Project: {projectType} ({projectId.slice(0, 8)}...)</div>
                  <div className="border-b border-slate-800 my-2"></div>
                </div>
              )}
              
              {/* Command history */}
              {history.map((entry) => (
                <div key={entry.id} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400">$</span>
                    <span className="text-white">{entry.command}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyOutput(entry.output)}
                      className="h-4 w-4 p-0 text-slate-500 hover:text-white ml-auto"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  {entry.output && (
                    <div className={`pl-4 whitespace-pre-wrap ${
                      entry.type === 'error' ? 'text-red-400' : 
                      entry.type === 'info' ? 'text-blue-400' : 
                      'text-green-400'
                    }`}>
                      {entry.output}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading indicator */}
              {isExecuting && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <span>●</span>
                  <span>Executing command...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Command Input */}
          <div className="border-t border-slate-800 p-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <span className="text-blue-400">$</span>
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command..."
                className="bg-transparent border-none text-green-400 placeholder-slate-500 focus:ring-0 flex-1"
                disabled={isExecuting}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!command.trim() || isExecuting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-3 h-3" />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Terminal;
