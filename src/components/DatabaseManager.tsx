
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Database, Play, RefreshCw, Table as TableIcon } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseManagerProps {
  projectId: string;
}

interface TableInfo {
  name: string;
  schema: string;
}

const DatabaseManager = ({ projectId }: DatabaseManagerProps) => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('tables');
  const queryClient = useQueryClient();

  // Available tables from the database schema
  const availableTables: TableInfo[] = [
    { name: 'profiles', schema: 'public' },
    { name: 'projects', schema: 'public' },
    { name: 'project_files', schema: 'public' },
    { name: 'project_collaborators', schema: 'public' },
    { name: 'project_invitations', schema: 'public' },
    { name: 'billing_history', schema: 'public' },
    { name: 'token_usage', schema: 'public' },
  ];

  // Fetch table data for selected table
  const { data: tableData, refetch: refetchTableData, isLoading: tableDataLoading } = useQuery({
    queryKey: ['table-data', selectedTable],
    queryFn: async () => {
      if (!selectedTable) return null;
      
      let query;
      switch (selectedTable) {
        case 'profiles':
          query = supabase.from('profiles').select('*').limit(100);
          break;
        case 'projects':
          query = supabase.from('projects').select('*').limit(100);
          break;
        case 'project_files':
          query = supabase.from('project_files').select('*').limit(100);
          break;
        case 'project_collaborators':
          query = supabase.from('project_collaborators').select('*').limit(100);
          break;
        case 'project_invitations':
          query = supabase.from('project_invitations').select('*').limit(100);
          break;
        case 'billing_history':
          query = supabase.from('billing_history').select('*').limit(100);
          break;
        case 'token_usage':
          query = supabase.from('token_usage').select('*').limit(100);
          break;
        default:
          return null;
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!selectedTable,
  });

  // Get table structure info
  const getTableStructure = (tableName: string) => {
    const structures: Record<string, Array<{column_name: string, data_type: string, is_nullable: string, column_default: string | null}>> = {
      profiles: [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
        { column_name: 'email', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'first_name', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'last_name', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'avatar_url', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'plan_type', data_type: 'text', is_nullable: 'YES', column_default: 'free' },
        { column_name: 'tokens_used', data_type: 'integer', is_nullable: 'YES', column_default: '0' },
        { column_name: 'tokens_limit', data_type: 'integer', is_nullable: 'YES', column_default: '10000' },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
      ],
      projects: [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
        { column_name: 'name', data_type: 'text', is_nullable: 'NO', column_default: null },
        { column_name: 'description', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'type', data_type: 'text', is_nullable: 'YES', column_default: 'web' },
        { column_name: 'status', data_type: 'text', is_nullable: 'YES', column_default: 'draft' },
        { column_name: 'framework', data_type: 'text', is_nullable: 'YES', column_default: 'react' },
        { column_name: 'template', data_type: 'text', is_nullable: 'YES', column_default: 'blank' },
        { column_name: 'user_id', data_type: 'uuid', is_nullable: 'YES', column_default: null },
        { column_name: 'deploy_url', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'github_repo_url', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'last_generated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: null },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
      ],
      project_files: [
        { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: 'gen_random_uuid()' },
        { column_name: 'project_id', data_type: 'uuid', is_nullable: 'YES', column_default: null },
        { column_name: 'file_path', data_type: 'text', is_nullable: 'NO', column_default: null },
        { column_name: 'file_type', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'content', data_type: 'text', is_nullable: 'YES', column_default: null },
        { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
        { column_name: 'updated_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()' },
      ],
    };
    
    return structures[tableName] || [];
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setActiveTab('data');
  };

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      toast.error('Please enter a SQL query');
      return;
    }
    
    // For now, show a message that custom SQL execution requires additional setup
    toast.error('Custom SQL execution requires additional database function setup. Please use the table browser for now.');
    setQueryResults([]);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Database Manager</h2>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Tables List */}
        <div className="w-64 border-r border-slate-800 bg-slate-900">
          <div className="p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
              <TableIcon className="w-4 h-4 mr-2" />
              Tables
            </h3>
            <div className="space-y-1">
              {availableTables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => handleTableSelect(table.name)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedTable === table.name
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {table.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-slate-800 px-4">
              <TabsList className="bg-transparent border-none h-12 w-full justify-start rounded-none p-0">
                <TabsTrigger 
                  value="data" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                  disabled={!selectedTable}
                >
                  Data
                </TabsTrigger>
                <TabsTrigger 
                  value="structure" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                  disabled={!selectedTable}
                >
                  Structure
                </TabsTrigger>
                <TabsTrigger 
                  value="sql" 
                  className="data-[state=active]:bg-slate-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none border-b-2 border-transparent"
                >
                  SQL Query
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="data" className="flex-1 p-4">
              {selectedTable ? (
                <Card className="bg-slate-900 border-slate-800 h-full">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">
                      {selectedTable} - Data ({tableData?.length || 0} rows)
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchTableData()}
                      disabled={tableDataLoading}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <RefreshCw className={`w-4 h-4 ${tableDataLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    {tableData && tableData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(tableData[0]).map((column) => (
                              <TableHead key={column} className="text-slate-300">
                                {column}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value, cellIndex) => (
                                <TableCell key={cellIndex} className="text-slate-200">
                                  {value !== null ? String(value) : 'NULL'}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center text-slate-400 py-8">
                        {tableDataLoading ? 'Loading...' : 'No data found in this table'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a table to view its data</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="structure" className="flex-1 p-4">
              {selectedTable ? (
                <Card className="bg-slate-900 border-slate-800 h-full">
                  <CardHeader>
                    <CardTitle className="text-white">{selectedTable} - Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-slate-300">Column</TableHead>
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Nullable</TableHead>
                          <TableHead className="text-slate-300">Default</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTableStructure(selectedTable).map((column) => (
                          <TableRow key={column.column_name}>
                            <TableCell className="text-slate-200 font-medium">
                              {column.column_name}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {column.data_type}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {column.is_nullable}
                            </TableCell>
                            <TableCell className="text-slate-200">
                              {column.column_default || 'None'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <TableIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a table to view its structure</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sql" className="flex-1 p-4 flex flex-col">
              <Card className="bg-slate-900 border-slate-800 flex-1 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">SQL Query Editor</CardTitle>
                    <Button
                      onClick={handleExecuteQuery}
                      disabled={!sqlQuery.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <div className="flex-1">
                    <Textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      placeholder="Enter your SQL query here..."
                      className="h-40 bg-slate-800 border-slate-700 text-white font-mono resize-none"
                    />
                  </div>
                  
                  <div className="text-sm text-slate-400 bg-slate-800 p-3 rounded">
                    <p className="font-medium mb-1">Available tables:</p>
                    <p>{availableTables.map(t => t.name).join(', ')}</p>
                  </div>

                  {queryResults.length > 0 && (
                    <div className="flex-1 overflow-auto">
                      <h4 className="text-slate-300 mb-2">Query Results:</h4>
                      <div className="bg-slate-800 rounded p-4 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(queryResults[0]).map((column) => (
                                <TableHead key={column} className="text-slate-300">
                                  {column}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {queryResults.map((row, index) => (
                              <TableRow key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <TableCell key={cellIndex} className="text-slate-200">
                                    {value !== null ? String(value) : 'NULL'}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
