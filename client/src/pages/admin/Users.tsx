import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, User as UserIcon } from "lucide-react";
import AdminRoute from "@/components/AdminRoute";
import DashboardLayout from "./Dashboard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
      return await apiRequest('PATCH', `/api/admin/users/${userId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-users">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage user roles and permissions
            </p>
          </div>
          <Badge variant="secondary" data-testid="badge-user-count">
            {users?.length || 0} users
          </Badge>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {users && users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0"
                  data-testid={`user-item-${user.id}`}
                >
                  <div className="flex items-center gap-4">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                        data-testid={`img-avatar-${user.id}`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium" data-testid={`text-name-${user.id}`}>
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className="gap-1"
                      data-testid={`badge-role-${user.id}`}
                    >
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>

                    <Select
                      value={user.role}
                      onValueChange={(role: 'user' | 'admin') => {
                        updateRoleMutation.mutate({ userId: user.id, role });
                      }}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-32" data-testid={`select-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Users will appear here after they sign up with Firebase
                </p>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-md">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Users are automatically synced when they sign in with Firebase</li>
            <li>• Promote users to Admin to give them access to this dashboard</li>
            <li>• Admins can manage products, orders, and other users</li>
            <li>• Demote admins back to User to revoke their access</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Users() {
  return (
    <AdminRoute>
      <UsersPage />
    </AdminRoute>
  );
}
