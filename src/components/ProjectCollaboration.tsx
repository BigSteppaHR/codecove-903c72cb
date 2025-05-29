
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Users, Mail, Crown, Edit, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectCollaborationProps {
  projectId: string;
  isOwner: boolean;
}

const ProjectCollaboration = ({ projectId, isOwner }: ProjectCollaborationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');

  // Fetch collaborators - we'll get just the collaboration data first
  const { data: collaborators } = useQuery({
    queryKey: ['projectCollaborators', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user profiles for the collaborators
  const { data: userProfiles } = useQuery({
    queryKey: ['userProfiles', collaborators?.map(c => c.user_id)],
    queryFn: async () => {
      if (!collaborators?.length) return [];
      
      const userIds = collaborators.map(c => c.user_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!collaborators?.length,
  });

  // Fetch pending invitations
  const { data: invitations } = useQuery({
    queryKey: ['projectInvitations', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString());
      
      if (error) throw error;
      return data;
    },
    enabled: isOwner,
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: 'editor' | 'viewer' }) => {
      const { data, error } = await supabase
        .from('project_invitations')
        .insert({
          project_id: projectId,
          email,
          role,
          invited_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: `Successfully invited ${inviteEmail} to collaborate`,
      });
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['projectInvitations', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove collaborator mutation
  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Collaborator removed",
        description: "Successfully removed collaborator from project",
      });
      queryClient.invalidateQueries({ queryKey: ['projectCollaborators', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove collaborator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invitation cancelled",
        description: "Successfully cancelled invitation",
      });
      queryClient.invalidateQueries({ queryKey: ['projectInvitations', projectId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;
    
    inviteUserMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'editor': return Edit;
      case 'viewer': return Eye;
      default: return Eye;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  // Helper function to get user profile for a collaborator
  const getUserProfile = (userId: string) => {
    return userProfiles?.find(profile => profile.id === userId);
  };

  return (
    <div className="space-y-6">
      {/* Invite New Collaborator */}
      {isOwner && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Collaborator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="inviteEmail" className="text-slate-300">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="inviteRole" className="text-slate-300">Role</Label>
                <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'editor' | 'viewer')}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleInviteUser}
              disabled={!inviteEmail.trim() || inviteUserMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Current Collaborators */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Collaborators ({(collaborators?.length || 0) + 1})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Project Owner */}
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{user?.email}</p>
                  <p className="text-slate-400 text-sm">You</p>
                </div>
              </div>
              <Badge variant="default" className="flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                Owner
              </Badge>
            </div>

            {/* Collaborators */}
            {collaborators?.map((collaborator) => {
              const RoleIcon = getRoleIcon(collaborator.role);
              const profile = getUserProfile(collaborator.user_id);
              const displayName = profile?.first_name && profile?.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : profile?.email || 'Unknown User';
              
              return (
                <div key={collaborator.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{displayName}</p>
                      {profile?.email && displayName !== profile.email && (
                        <p className="text-slate-400 text-sm">{profile.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(collaborator.role)} className="flex items-center">
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {collaborator.role}
                    </Badge>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaboratorMutation.mutate(collaborator.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {isOwner && invitations && invitations.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{invitation.email}</p>
                      <p className="text-slate-400 text-sm">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-400 border-orange-400">
                      {invitation.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectCollaboration;
